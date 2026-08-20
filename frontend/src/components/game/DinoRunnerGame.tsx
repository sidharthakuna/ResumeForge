import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Trophy,
  Volume2,
  VolumeX,
  Play,
  RefreshCw,
  Sparkles,
  Gamepad2,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/contexts/ThemeContext'

// Game Physics & Dimensions
const CANVAS_WIDTH = 540
const CANVAS_HEIGHT = 180
const GROUND_Y = 145
const GRAVITY = 0.58
const JUMP_VELOCITY = -11.0
const INITIAL_SPEED = 5.2
const MAX_SPEED = 12.0
const SPEED_ACCEL = 0.0006

const MAX_OBSTACLES = 4
const MAX_CLOUDS = 3
const MAX_GROUND_DOTS = 14

interface Obstacle {
  active: boolean
  x: number
  y: number
  width: number
  height: number
  type: 'cactus_small' | 'cactus_large' | 'cactus_group' | 'bird'
  animTick: number
}

interface Cloud {
  active: boolean
  x: number
  y: number
  speed: number
  scale: number
}

interface GroundDot {
  x: number
  width: number
}

export function DinoRunnerGame() {
  const { isDark } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // React State ONLY for Start/Game Over modal overlays
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  // Audio preference & Persisted High Score
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('resumeforge_dino_sound') !== 'false'
    } catch {
      return true
    }
  })

  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('resumeforge_dino_highscore') || '0')
    } catch {
      return 0
    }
  })

  // Mutable Game Physics Refs
  const isRunningRef = useRef(false)
  const isDarkRef = useRef(isDark)
  isDarkRef.current = isDark

  const dinoY = useRef(GROUND_Y - 34)
  const dinoVy = useRef(0)
  const isJumping = useRef(false)
  const isDucking = useRef(false)
  const speed = useRef(INITIAL_SPEED)
  const scoreRef = useRef(0)
  const distanceRef = useRef(0)
  const lastScoreMilestone = useRef(0)
  const frameTick = useRef(0)

  // Pre-allocated object pools
  const obstaclePool = useRef<Obstacle[]>(
    Array.from({ length: MAX_OBSTACLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      width: 16,
      height: 30,
      type: 'cactus_small',
      animTick: 0,
    })),
  )

  const cloudPool = useRef<Cloud[]>(
    Array.from({ length: MAX_CLOUDS }, () => ({
      active: false,
      x: 0,
      y: 0,
      speed: 0.6,
      scale: 1,
    })),
  )

  const groundDots = useRef<GroundDot[]>(
    Array.from({ length: MAX_GROUND_DOTS }, (_, i) => ({
      x: (CANVAS_WIDTH / MAX_GROUND_DOTS) * i,
      width: Math.random() * 6 + 3,
    })),
  )

  const animationFrameId = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const soundEnabledRef = useRef(soundEnabled)
  soundEnabledRef.current = soundEnabled

  // Dispose audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  // Web Audio Synthesizer with proper disconnection to prevent audio graph leaks
  const playSound = useCallback((type: 'jump' | 'score' | 'hit') => {
    if (!soundEnabledRef.current) return
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtxRef.current = new AudioCtx()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }

      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.onended = () => {
        try {
          osc.disconnect()
          gain.disconnect()
        } catch {
          // ignore
        }
      }

      if (type === 'jump') {
        osc.type = 'square'
        osc.frequency.setValueAtTime(180, now)
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.08)
        gain.gain.setValueAtTime(0.08, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085)
        osc.start(now)
        osc.stop(now + 0.085)
      } else if (type === 'score') {
        osc.type = 'square'
        osc.frequency.setValueAtTime(587.33, now)
        osc.frequency.setValueAtTime(880, now + 0.08)
        gain.gain.setValueAtTime(0.1, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
        osc.start(now)
        osc.stop(now + 0.18)
      } else if (type === 'hit') {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(140, now)
        osc.frequency.linearRampToValueAtTime(30, now + 0.18)
        gain.gain.setValueAtTime(0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
        osc.start(now)
        osc.stop(now + 0.2)
      }
    } catch {
      // safe fallback
    }
  }, [])

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    try {
      localStorage.setItem('resumeforge_dino_sound', String(next))
    } catch {
      // ignore
    }
  }

  // Jump Action Trigger (0ms immediate response)
  const handleJump = useCallback(() => {
    if (!isJumping.current && !isDucking.current) {
      dinoVy.current = JUMP_VELOCITY
      isJumping.current = true
      playSound('jump')
    }
  }, [playSound])

  // Spawn Obstacles (Safe gap guaranteed)
  const spawnObstacle = useCallback(() => {
    const pool = obstaclePool.current
    let slot: Obstacle | null = null
    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].active) {
        slot = pool[i]
        break
      }
    }
    if (!slot) return

    for (let i = 0; i < pool.length; i++) {
      if (pool[i].active && pool[i].x > CANVAS_WIDTH - 200) {
        return
      }
    }

    const rand = Math.random()
    if (rand < 0.25 && scoreRef.current > 90) {
      slot.type = 'bird'
      slot.width = 30
      slot.height = 20
      slot.x = CANVAS_WIDTH + 20
      slot.y = Math.random() < 0.5 ? GROUND_Y - 48 : GROUND_Y - 26
      slot.animTick = 0
    } else if (rand < 0.5) {
      slot.type = 'cactus_group'
      slot.width = 38
      slot.height = 30
      slot.x = CANVAS_WIDTH + 20
      slot.y = GROUND_Y - 30
    } else if (rand < 0.75) {
      slot.type = 'cactus_large'
      slot.width = 18
      slot.height = 32
      slot.x = CANVAS_WIDTH + 20
      slot.y = GROUND_Y - 32
    } else {
      slot.type = 'cactus_small'
      slot.width = 14
      slot.height = 24
      slot.x = CANVAS_WIDTH + 20
      slot.y = GROUND_Y - 24
    }

    slot.active = true
  }, [])

  // Spawn Background Clouds
  const spawnCloud = useCallback(() => {
    const pool = cloudPool.current
    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].active) {
        pool[i].active = true
        pool[i].x = CANVAS_WIDTH + 30
        pool[i].y = Math.random() * 40 + 15
        pool[i].speed = Math.random() * 0.5 + 0.4
        pool[i].scale = Math.random() * 0.3 + 0.8
        break
      }
    }
  }, [])

  // Draw Pixel Dino Character
  const renderDino = (ctx: CanvasRenderingContext2D, isDarkTheme: boolean) => {
    const dX = 38
    const dY = dinoY.current
    const ducking = isDucking.current && !isJumping.current
    const legFrame = Math.floor(frameTick.current / 4) % 2

    ctx.save()
    ctx.fillStyle = isDarkTheme ? '#f1f5f9' : '#1e293b'

    if (ducking) {
      const dw = 44
      const dh = 18
      const actualY = GROUND_Y - dh

      ctx.beginPath()
      ctx.roundRect(dX, actualY + 4, dw - 10, dh - 6, 3)
      ctx.roundRect(dX + dw - 18, actualY, 16, 12, 2)
      ctx.fill()

      ctx.fillStyle = isDarkTheme ? '#090d16' : '#ffffff'
      ctx.fillRect(dX + dw - 9, actualY + 3, 2.5, 2.5)

      ctx.fillStyle = isDarkTheme ? '#f1f5f9' : '#1e293b'
      if (legFrame === 0) {
        ctx.fillRect(dX + 8, actualY + dh - 3, 3, 3)
      } else {
        ctx.fillRect(dX + 22, actualY + dh - 3, 3, 3)
      }
    } else {
      // Head
      ctx.beginPath()
      ctx.roundRect(dX + 12, dY, 16, 13, 2)
      ctx.fill()

      // Eye
      ctx.fillStyle = isDarkTheme ? '#090d16' : '#ffffff'
      ctx.fillRect(dX + 21, dY + 3, 2.5, 2.5)

      // Body & Tail
      ctx.fillStyle = isDarkTheme ? '#f1f5f9' : '#1e293b'
      ctx.beginPath()
      ctx.roundRect(dX + 4, dY + 11, 18, 15, 3)
      ctx.fillRect(dX + 20, dY + 15, 5, 3)
      ctx.fillRect(dX, dY + 15, 5, 5)
      ctx.fill()

      // Legs
      if (isJumping.current) {
        ctx.fillRect(dX + 8, dY + 26, 3.5, 5)
        ctx.fillRect(dX + 15, dY + 26, 3.5, 5)
      } else {
        if (legFrame === 0) {
          ctx.fillRect(dX + 8, dY + 26, 3.5, 8)
          ctx.fillRect(dX + 15, dY + 26, 3.5, 4)
        } else {
          ctx.fillRect(dX + 8, dY + 26, 3.5, 4)
          ctx.fillRect(dX + 15, dY + 26, 3.5, 8)
        }
      }
    }

    ctx.restore()
  }

  // Draw Obstacles
  const renderObstacle = (ctx: CanvasRenderingContext2D, o: Obstacle, isDarkTheme: boolean) => {
    ctx.save()

    if (o.type === 'bird') {
      ctx.fillStyle = isDarkTheme ? '#fbbf24' : '#d97706'
      const wingFrame = Math.floor(frameTick.current / 6) % 2

      ctx.beginPath()
      ctx.roundRect(o.x + 8, o.y + 5, 16, 7, 2)
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(o.x, o.y + 8)
      ctx.lineTo(o.x + 8, o.y + 5)
      ctx.lineTo(o.x + 8, o.y + 11)
      ctx.closePath()
      ctx.fill()

      if (wingFrame === 0) {
        ctx.beginPath()
        ctx.moveTo(o.x + 12, o.y + 5)
        ctx.lineTo(o.x + 16, o.y - 5)
        ctx.lineTo(o.x + 22, o.y + 5)
        ctx.closePath()
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.moveTo(o.x + 12, o.y + 12)
        ctx.lineTo(o.x + 16, o.y + 20)
        ctx.lineTo(o.x + 22, o.y + 12)
        ctx.closePath()
        ctx.fill()
      }
    } else {
      ctx.fillStyle = isDarkTheme ? '#10b981' : '#059669'

      if (o.type === 'cactus_group') {
        ctx.beginPath()
        ctx.roundRect(o.x, o.y + 6, 10, o.height - 6, 2)
        ctx.roundRect(o.x + 14, o.y, 11, o.height, 2)
        ctx.roundRect(o.x + 28, o.y + 8, 10, o.height - 8, 2)
        ctx.fill()
      } else {
        const stemW = o.width > 16 ? 9 : 7
        const stemX = o.x + (o.width - stemW) / 2

        ctx.beginPath()
        ctx.roundRect(stemX, o.y, stemW, o.height, 2)
        ctx.fill()

        ctx.beginPath()
        ctx.roundRect(o.x, o.y + 7, 5, 8, 1.5)
        ctx.fillRect(o.x, o.y + 12, stemX - o.x + 1, 3.5)
        ctx.fill()

        if (o.type === 'cactus_large') {
          ctx.beginPath()
          ctx.roundRect(stemX + stemW + 1, o.y + 10, 5, 8, 1.5)
          ctx.fillRect(stemX + stemW - 1, o.y + 15, 6, 3.5)
          ctx.fill()
        }
      }
    }

    ctx.restore()
  }

  // Draw Cloud
  const renderCloud = (ctx: CanvasRenderingContext2D, c: Cloud, isDarkTheme: boolean) => {
    ctx.save()
    ctx.fillStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'
    ctx.beginPath()
    ctx.arc(c.x, c.y, 9 * c.scale, 0, Math.PI * 2)
    ctx.arc(c.x + 9 * c.scale, c.y - 3 * c.scale, 11 * c.scale, 0, Math.PI * 2)
    ctx.arc(c.x + 20 * c.scale, c.y, 8 * c.scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Main Delta-Time Stable Game Loop
  const runGameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let lastTime = performance.now()
    let lastSpawn = performance.now()
    let lastCloud = performance.now()

    const loop = (now: number) => {
      if (!isRunningRef.current) return

      const rawDt = (now - lastTime) / 16.666
      const dt = Math.min(Math.max(rawDt, 0.5), 2.2)
      lastTime = now

      frameTick.current++

      speed.current = Math.min(MAX_SPEED, speed.current + SPEED_ACCEL * dt)
      const curSpeed = speed.current

      distanceRef.current += curSpeed * 0.0665 * dt
      const currentScore = Math.floor(distanceRef.current)
      scoreRef.current = currentScore

      if (currentScore > 0 && currentScore % 100 === 0 && currentScore !== lastScoreMilestone.current) {
        lastScoreMilestone.current = currentScore
        playSound('score')
      }

      if (isJumping.current) {
        dinoY.current += dinoVy.current * dt
        dinoVy.current += GRAVITY * dt

        if (dinoY.current >= GROUND_Y - 34) {
          dinoY.current = GROUND_Y - 34
          dinoVy.current = 0
          isJumping.current = false
        }
      }

      const spawnInterval = Math.max(900, 1500 - currentScore * 3)
      if (now - lastSpawn > spawnInterval) {
        spawnObstacle()
        lastSpawn = now
      }

      if (now - lastCloud > 3500) {
        spawnCloud()
        lastCloud = now
      }

      const activeDark = isDarkRef.current

      // 1. Clear Canvas Surface
      ctx.fillStyle = activeDark ? '#090d16' : '#f8fafc'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 2. Render Clouds (Background Parallax)
      const clouds = cloudPool.current
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i]
        if (!c.active) continue
        c.x -= c.speed * dt
        renderCloud(ctx, c, activeDark)
        if (c.x < -50) c.active = false
      }

      // 3. Render Ground Line & Details
      ctx.strokeStyle = activeDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.25)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, GROUND_Y)
      ctx.lineTo(canvas.width, GROUND_Y)
      ctx.stroke()

      ctx.fillStyle = activeDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.16)'
      const dots = groundDots.current
      for (let d = 0; d < dots.length; d++) {
        dots[d].x -= curSpeed * dt
        if (dots[d].x < -10) dots[d].x = canvas.width + Math.random() * 20
        ctx.fillRect(dots[d].x, GROUND_Y + 4, dots[d].width, 1.5)
      }

      // 4. Render Dino
      renderDino(ctx, activeDark)

      // 5. Dynamic Accurate Dino Hitbox
      const isDuckingState = isDucking.current && !isJumping.current
      const dinoLeft = isDuckingState ? 38 + 5 : 38 + 6
      const dinoRight = isDuckingState ? 38 + 39 : 38 + 25
      const dinoTop = isDuckingState ? GROUND_Y - 15 : dinoY.current + 4
      const dinoBottom = isDuckingState ? GROUND_Y - 1 : dinoY.current + 31

      let collisionDetected = false
      const obstacles = obstaclePool.current
      for (let i = 0; i < obstacles.length; i++) {
        const o = obstacles[i]
        if (!o.active) continue

        o.x -= curSpeed * dt
        renderObstacle(ctx, o, activeDark)

        const obsLeft = o.x + 3
        const obsRight = o.x + o.width - 3
        const obsTop = o.y + 3
        const obsBottom = o.y + o.height

        const isColliding =
          dinoRight > obsLeft &&
          dinoLeft < obsRight &&
          dinoBottom > obsTop &&
          dinoTop < obsBottom

        if (isColliding) {
          collisionDetected = true
          break
        }

        if (o.x < -60) o.active = false
      }

      // 6. Direct Canvas Score Render
      const scoreStr = String(currentScore).padStart(5, '0')
      ctx.fillStyle = activeDark ? '#94a3b8' : '#475569'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(scoreStr, canvas.width - 18, 22)

      if (collisionDetected) {
        playSound('hit')
        isRunningRef.current = false
        const finalVal = currentScore
        setFinalScore(finalVal)

        setHighScore((prev) => {
          if (finalVal > prev) {
            setIsNewHighScore(true)
            try {
              localStorage.setItem('resumeforge_dino_highscore', String(finalVal))
            } catch {
              // ignore
            }
            return finalVal
          }
          return prev
        })

        setGameOver(true)
        setIsPlaying(false)
        return
      }

      animationFrameId.current = requestAnimationFrame(loop)
    }

    animationFrameId.current = requestAnimationFrame(loop)
  }, [playSound, spawnObstacle, spawnCloud])

  // Start / Restart Game
  const startGame = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }

    setGameOver(false)
    setIsNewHighScore(false)
    setFinalScore(0)

    dinoY.current = GROUND_Y - 34
    dinoVy.current = 0
    isJumping.current = false
    isDucking.current = false
    speed.current = INITIAL_SPEED
    scoreRef.current = 0
    distanceRef.current = 0
    lastScoreMilestone.current = 0
    frameTick.current = 0

    // Reset Pools
    obstaclePool.current.forEach((o) => { o.active = false })
    cloudPool.current.forEach((c) => { c.active = false })

    cloudPool.current[0] = { active: true, x: 100, y: 25, speed: 0.5, scale: 1 }
    cloudPool.current[1] = { active: true, x: 320, y: 18, speed: 0.6, scale: 0.9 }

    isRunningRef.current = true
    setIsPlaying(true)
    handleJump()
    runGameLoop()
  }, [handleJump, runGameLoop])

  // Stop loop on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    }
  }, [])

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        if (!isRunningRef.current || gameOver) {
          startGame()
        } else {
          handleJump()
        }
      }
      if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault()
        if (!isJumping.current) {
          isDucking.current = true
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        isDucking.current = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameOver, startGame, handleJump])

  // Touch / Pointer Down Immediate Handler (0ms Touch Response)
  const handlePointerStart = (e: React.PointerEvent | React.TouchEvent) => {
    // Avoid double firing if both pointer and touch exist
    if ('button' in e && e.button !== 0) return

    if (!isRunningRef.current || gameOver) {
      startGame()
    } else {
      handleJump()
    }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-indigo-500/20 bg-paper-50 p-4 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-indigo-500/30 dark:bg-paper-50/70">
      {/* Top Banner Ribbon */}
      <div className="mb-3 flex w-full items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent px-3.5 py-2 border border-indigo-500/15 dark:from-indigo-950/60 dark:via-cyan-950/40">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Gamepad2 className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wide text-indigo-950 dark:text-indigo-200">
                T-Rex Dino Runner
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-1.5 py-0.2 text-[9px] font-extrabold text-white animate-pulse">
                OFFLINE
              </span>
            </div>
            <p className="text-[10.5px] text-ink-500 hidden sm:block">
              Tap screen to jump over cacti & dodge flying birds
            </p>
          </div>
        </div>

        {/* High Score & Sound Toggle */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-ink-700 bg-paper-50/90 dark:bg-paper-50/60 px-2.5 py-1 rounded-lg border border-ink-100 dark:border-ink-200 shadow-2xs">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-ink-400">HI</span>
            <strong className="font-mono text-ink-900">{highScore}</strong>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-900 transition-colors border border-ink-100 dark:border-ink-200"
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-indigo-500" /> : <VolumeX className="h-3.5 w-3.5 text-ink-300" />}
          </button>
        </div>
      </div>

      {/* Canvas Viewport: Immediate Multi-Touch & Pointer Responder */}
      <div
        onPointerDown={handlePointerStart}
        className="relative w-full cursor-pointer overflow-hidden rounded-xl border border-indigo-200/80 bg-paper-100 shadow-inner select-none touch-manipulation dark:border-indigo-500/30 dark:bg-[#090d16]"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full block select-none pointer-events-none"
        />

        {/* Modal Overlay: Start & Game Over Screen */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper-50/92 p-5 text-center backdrop-blur-md transition-all dark:bg-slate-950/88">
            {gameOver ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                {isNewHighScore && (
                  <div className="mb-2 flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-extrabold text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-bounce">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    <span>NEW HIGH SCORE!</span>
                  </div>
                )}
                <h4 className="font-display text-xl font-black tracking-tight text-rose-600 dark:text-rose-500">
                  GAME OVER
                </h4>

                <div className="mt-2 flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-ink-400">Score: </span>
                    <strong className="font-mono text-sm font-bold text-ink-900 dark:text-white">{finalScore}</strong>
                  </div>
                  <div>
                    <span className="text-ink-400">Best: </span>
                    <strong className="font-mono text-sm font-bold text-amber-500">{highScore}</strong>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    startGame()
                  }}
                  className="mt-3.5 gap-1.5 text-xs h-8 shadow-md"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Play Again</span>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in fade-in">
                <div className="relative mb-2.5 flex items-center justify-center">
                  <div className="absolute h-12 w-12 rounded-full bg-indigo-500/25 blur-lg animate-pulse" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <h4 className="font-display text-lg font-bold tracking-tight text-ink-900 dark:text-white">
                  Chrome Dino Runner
                </h4>
                <p className="mt-0.5 max-w-[280px] text-xs text-ink-600 dark:text-slate-300">
                  Tap anywhere or press <kbd className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[10px] text-ink-700 dark:bg-ink-200">Space</kbd> to jump!
                </p>

                <Button
                  variant="primary"
                  size="md"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    startGame()
                  }}
                  className="mt-3 gap-2 text-xs font-bold shadow-md shadow-indigo-500/20 hover:scale-[1.02] transition-transform h-8 px-4"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Start Running</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Touch Action Buttons for Mobile Screen Control */}
      <div className="mt-2.5 flex w-full items-center justify-between gap-2">
        {/* Desktop Keyboard Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-ink-400">
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-700 dark:bg-ink-200">Space</kbd> or <kbd className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-700 dark:bg-ink-200"><ArrowUp className="h-2.5 w-2.5 inline" /></kbd> Jump
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-700 dark:bg-ink-200"><ArrowDown className="h-2.5 w-2.5 inline" /></kbd> Duck
          </span>
          <span>• Click/Tap screen to jump</span>
        </div>

        {/* Dedicated Mobile Touch Buttons */}
        <div className="flex sm:hidden w-full items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault()
              if (!isRunningRef.current || gameOver) {
                startGame()
              } else {
                handleJump()
              }
            }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs py-2.5 active:bg-indigo-700 active:scale-[0.98] transition-transform shadow-xs select-none touch-manipulation"
          >
            <ArrowUp className="h-4 w-4" />
            <span>JUMP / TAP</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault()
              if (!isJumping.current) {
                isDucking.current = true
              }
            }}
            onPointerUp={() => {
              isDucking.current = false
            }}
            onPointerCancel={() => {
              isDucking.current = false
            }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-ink-100 dark:bg-ink-200 text-ink-800 dark:text-ink-100 font-bold text-xs py-2.5 active:bg-ink-200 active:scale-[0.98] transition-transform shadow-xs select-none touch-manipulation"
          >
            <ArrowDown className="h-4 w-4" />
            <span>DUCK (HOLD)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
