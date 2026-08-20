import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Trophy,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  RefreshCw,
  Heart,
  Star,
  Play,
  Pause,
  Award,
  Sparkles,
  Gamepad2,
  Rocket,
  Compass,
  Crown,
  ChevronRight,
  Diamond,
  Hexagon,
  Radio,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/contexts/ThemeContext'

// Universal Arcade Progression Ladder (Non-resume related)
const ARCADE_RANKS = [
  { minScore: 0, title: 'Cadet', Icon: Radio, color: '#6366f1' },
  { minScore: 10, title: 'Pilot', Icon: Rocket, color: '#06b6d4' },
  { minScore: 25, title: 'Commander', Icon: Zap, color: '#10b981' },
  { minScore: 50, title: 'Captain', Icon: Compass, color: '#f59e0b' },
  { minScore: 85, title: 'Admiral', Icon: Award, color: '#8b5cf6' },
  { minScore: 130, title: 'Cosmic Master', Icon: Crown, color: '#ec4899' },
]

// Universal Energy Collectible Names
const CORE_NAMES = [
  'ORB',
  'CORE',
  'PULSE',
  'FLUX',
  'ION',
  'PRISM',
  'NEON',
  'CYBER',
  'WAVE',
  'SPARK',
]

// Pre-allocated object pools for zero-allocation performance
const MAX_ITEMS = 16
const MAX_PARTICLES = 40
const MAX_FLOATING_TEXTS = 8

interface ItemSlot {
  active: boolean
  x: number
  y: number
  speed: number
  label: string
  type: 'core' | 'boost' | 'shield' | 'nova' | 'repair' | 'hazard'
  shape: 'pill' | 'diamond' | 'hexagon' | 'shield' | 'star' | 'cross'
  color: string
  size: number
  points: number
}

interface ParticleSlot {
  active: boolean
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
  maxLife: number
}

interface TextSlot {
  active: boolean
  x: number
  y: number
  text: string
  color: string
  life: number
}

export function CareerCatcherGame() {
  const { isDark } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // React state for HUD & UI
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [level, setLevel] = useState(1)
  const [rankTitle, setRankTitle] = useState('Cadet')
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  // Active Buffs
  const [shieldActive, setShieldActive] = useState(false)
  const [multiplierActive, setMultiplierActive] = useState(false)
  const [multiplierTimer, setMultiplierTimer] = useState(0)

  // Audio Preference
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('resumeforge_game_sound') !== 'false'
    } catch {
      return true
    }
  })

  // Persisted High Score
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('resumeforge_game_highscore') || '0')
    } catch {
      return 0
    }
  })

  // Smooth lerp movement state refs
  const playerX = useRef(230)
  const targetX = useRef(230)
  const keysPressed = useRef<{ left: boolean; right: boolean }>({ left: false, right: false })

  // Static Object Pools (Zero GC pressure)
  const itemPool = useRef<ItemSlot[]>(
    Array.from({ length: MAX_ITEMS }, () => ({
      active: false,
      x: 0,
      y: 0,
      speed: 0,
      label: '',
      type: 'core',
      shape: 'pill',
      color: '#4f46e5',
      size: 56,
      points: 1,
    })),
  )

  const particlePool = useRef<ParticleSlot[]>(
    Array.from({ length: MAX_PARTICLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      color: '#fff',
      size: 2,
      life: 0,
      maxLife: 20,
    })),
  )

  const textPool = useRef<TextSlot[]>(
    Array.from({ length: MAX_FLOATING_TEXTS }, () => ({
      active: false,
      x: 0,
      y: 0,
      text: '',
      color: '#fff',
      life: 0,
    })),
  )

  const animationFrameId = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Dispose audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  // Web Audio Synthesizer
  const playSound = useCallback(
    (type: 'catch' | 'powerup' | 'shield' | 'heal' | 'hit' | 'levelup' | 'gameover', pitchMod = 1) => {
      if (!soundEnabled) return
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          audioCtxRef.current = new AudioContextClass()
        }
        const ctx = audioCtxRef.current
        if (ctx.state === 'suspended') ctx.resume()

        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        if (type === 'catch') {
          osc.type = 'sine'
          const freq = 440 * pitchMod
          osc.frequency.setValueAtTime(freq, now)
          osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.08)
          gain.gain.setValueAtTime(0.1, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085)
          osc.start(now)
          osc.stop(now + 0.085)
        } else if (type === 'powerup') {
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(523.25, now)
          osc.frequency.setValueAtTime(659.25, now + 0.06)
          osc.frequency.setValueAtTime(783.99, now + 0.12)
          gain.gain.setValueAtTime(0.12, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
          osc.start(now)
          osc.stop(now + 0.2)
        } else if (type === 'shield' || type === 'heal') {
          osc.type = 'sine'
          osc.frequency.setValueAtTime(320, now)
          osc.frequency.exponentialRampToValueAtTime(640, now + 0.12)
          gain.gain.setValueAtTime(0.12, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
          osc.start(now)
          osc.stop(now + 0.15)
        } else if (type === 'hit') {
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(160, now)
          osc.frequency.linearRampToValueAtTime(50, now + 0.1)
          gain.gain.setValueAtTime(0.18, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11)
          osc.start(now)
          osc.stop(now + 0.11)
        } else if (type === 'levelup') {
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(440, now)
          osc.frequency.setValueAtTime(554.37, now + 0.07)
          osc.frequency.setValueAtTime(659.25, now + 0.14)
          osc.frequency.setValueAtTime(880, now + 0.21)
          gain.gain.setValueAtTime(0.15, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
          osc.start(now)
          osc.stop(now + 0.3)
        } else if (type === 'gameover') {
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(260, now)
          osc.frequency.linearRampToValueAtTime(70, now + 0.3)
          gain.gain.setValueAtTime(0.2, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
          osc.start(now)
          osc.stop(now + 0.3)
        }
      } catch {
        // audio fail safe
      }
    },
    [soundEnabled],
  )

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    try {
      localStorage.setItem('resumeforge_game_sound', String(next))
    } catch {
      // ignore
    }
  }

  // Level Progression helper (+1 point scale)
  const checkLevelUp = useCallback(
    (currentScore: number, prevLevel: number) => {
      let activeRank = ARCADE_RANKS[0]
      let lvlIndex = 1
      for (let i = ARCADE_RANKS.length - 1; i >= 0; i--) {
        if (currentScore >= ARCADE_RANKS[i].minScore) {
          activeRank = ARCADE_RANKS[i]
          lvlIndex = i + 1
          break
        }
      }
      if (lvlIndex > prevLevel) {
        playSound('levelup')
      }
      setLevel(lvlIndex)
      setRankTitle(activeRank.title)
      return lvlIndex
    },
    [playSound],
  )

  // Spawn items with +1 Point Base Scale
  const spawnItemFromPool = useCallback((canvasWidth: number, currentLvl: number) => {
    const pool = itemPool.current
    let slot: ItemSlot | null = null
    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].active) {
        slot = pool[i]
        break
      }
    }
    if (!slot) return

    const rand = Math.random()
    if (rand < 0.22) {
      // 1. DIAMOND HAZARD (VOID DEBRIS / METEOR)
      slot.type = 'hazard'
      slot.shape = 'diamond'
      slot.label = 'HAZARD'
      slot.color = '#ef4444'
      slot.points = 0
      slot.size = 38
    } else if (rand < 0.28) {
      // 2. HEXAGON (HYPER 2X BOOST)
      slot.type = 'boost'
      slot.shape = 'hexagon'
      slot.label = '2X'
      slot.color = '#f59e0b'
      slot.points = 1
      slot.size = 36
    } else if (rand < 0.34) {
      // 3. SHIELD BADGE (ENERGY BARRIER)
      slot.type = 'shield'
      slot.shape = 'shield'
      slot.label = 'SHIELD'
      slot.color = '#06b6d4'
      slot.points = 1
      slot.size = 46
    } else if (rand < 0.38) {
      // 4. STAR BADGE (SUPER NOVA)
      slot.type = 'nova'
      slot.shape = 'star'
      slot.label = 'NOVA'
      slot.color = '#eab308'
      slot.points = 5
      slot.size = 42
    } else if (rand < 0.42 && Math.random() < 0.35) {
      // 5. CROSS / PLUS (REPAIR PACK)
      slot.type = 'repair'
      slot.shape = 'cross'
      slot.label = '+1'
      slot.color = '#ec4899'
      slot.points = 1
      slot.size = 34
    } else {
      // 6. STANDARD CAPSULE PILL (ENERGY CORE) = +1 Point
      slot.type = 'core'
      slot.shape = 'pill'
      const idx = Math.floor(Math.random() * CORE_NAMES.length)
      slot.label = CORE_NAMES[idx]
      slot.color = '#4f46e5'
      slot.points = 1
      slot.size = Math.max(54, slot.label.length * 7 + 16)
    }

    slot.active = true
    slot.x = Math.random() * (canvasWidth - slot.size - 40) + slot.size / 2 + 20
    slot.y = -15
    slot.speed = 2.1 + currentLvl * 0.35 + Math.random() * 1.5
  }, [])

  // Spawn particles from pool
  const spawnParticlesFromPool = (x: number, y: number, color: string, count = 8) => {
    const pool = particlePool.current
    let spawned = 0
    for (let i = 0; i < pool.length && spawned < count; i++) {
      if (!pool[i].active) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 3.5 + 1.2
        pool[i].active = true
        pool[i].x = x
        pool[i].y = y
        pool[i].vx = Math.cos(angle) * speed
        pool[i].vy = Math.sin(angle) * speed
        pool[i].color = color
        pool[i].size = Math.random() * 2 + 1.5
        pool[i].life = 15
        pool[i].maxLife = 15
        spawned++
      }
    }
  }

  // Spawn text from pool
  const spawnTextFromPool = (x: number, y: number, text: string, color: string) => {
    const pool = textPool.current
    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].active) {
        pool[i].active = true
        pool[i].x = x
        pool[i].y = y
        pool[i].text = text
        pool[i].color = color
        pool[i].life = 26
        break
      }
    }
  }

  // Start / Restart game
  const startGame = () => {
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setLives(3)
    setLevel(1)
    setRankTitle('Cadet')
    setGameOver(false)
    setIsPaused(false)
    setIsNewHighScore(false)
    setShieldActive(false)
    setMultiplierActive(false)
    setMultiplierTimer(0)

    playerX.current = 230
    targetX.current = 230

    itemPool.current.forEach((item) => { item.active = false })
    particlePool.current.forEach((p) => { p.active = false })
    textPool.current.forEach((t) => { t.active = false })

    setIsPlaying(true)
  }

  // Multiplier countdown timer
  useEffect(() => {
    if (!multiplierActive) return
    const interval = setInterval(() => {
      setMultiplierTimer((prev) => {
        if (prev <= 1) {
          setMultiplierActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [multiplierActive])

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = true
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = true
      }
      if (e.key === ' ' && isPlaying && !gameOver) {
        e.preventDefault()
        setIsPaused((p) => !p)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = false
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPlaying, gameOver])

  // Helper to draw geometric shapes on canvas
  const drawGeometricItem = (
    ctx: CanvasRenderingContext2D,
    it: ItemSlot,
  ) => {
    ctx.save()
    ctx.translate(it.x, it.y)

    // SHAPE 1: DIAMOND (HAZARD / METEOR)
    if (it.shape === 'diamond') {
      const d = 16
      ctx.beginPath()
      ctx.moveTo(0, -d)
      ctx.lineTo(d, 0)
      ctx.lineTo(0, d)
      ctx.lineTo(-d, 0)
      ctx.closePath()
      ctx.fillStyle = '#ef4444'
      ctx.fill()
      ctx.strokeStyle = '#fca5a5'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('VOID', 0, 1)
    }
    // SHAPE 2: HEXAGON (HYPER 2X BOOST)
    else if (it.shape === 'hexagon') {
      const r = 16
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3
        const hx = r * Math.cos(a)
        const hy = r * Math.sin(a)
        if (i === 0) ctx.moveTo(hx, hy)
        else ctx.lineTo(hx, hy)
      }
      ctx.closePath()
      ctx.fillStyle = '#f59e0b'
      ctx.fill()
      ctx.strokeStyle = '#fef08a'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('2X', 0, 0)
    }
    // SHAPE 3: SHIELD BADGE (DEFLECTOR BARRIER)
    else if (it.shape === 'shield') {
      const w = 20
      const h = 24
      ctx.beginPath()
      ctx.moveTo(-w / 2, -h / 2)
      ctx.lineTo(w / 2, -h / 2)
      ctx.lineTo(w / 2, h / 6)
      ctx.quadraticCurveTo(w / 2, h / 2, 0, h / 2 + 3)
      ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 6)
      ctx.closePath()
      ctx.fillStyle = '#06b6d4'
      ctx.fill()
      ctx.strokeStyle = '#a5f3fc'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 8.5px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('SHIELD', 0, -1)
    }
    // SHAPE 4: STAR / OCTAGON (SUPER NOVA)
    else if (it.shape === 'star') {
      const r = 16
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4
        const sx = r * Math.cos(a)
        const sy = r * Math.sin(a)
        if (i === 0) ctx.moveTo(sx, sy)
        else ctx.lineTo(sx, sy)
      }
      ctx.closePath()
      ctx.fillStyle = '#eab308'
      ctx.fill()
      ctx.strokeStyle = '#fef9c3'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('NOVA', 0, 0)
    }
    // SHAPE 5: PLUS / CROSS (REPAIR NANITES)
    else if (it.shape === 'cross') {
      const c = 14
      const t = 5
      ctx.beginPath()
      ctx.rect(-t / 2, -c / 2, t, c)
      ctx.rect(-c / 2, -t / 2, c, t)
      ctx.fillStyle = '#ec4899'
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 8px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('+1', 0, 0)
    }
    // SHAPE 6: CAPSULE PILL (ENERGY CORE)
    else {
      const pw = it.size
      const ph = 22
      ctx.beginPath()
      ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 7)
      ctx.fillStyle = '#4f46e5'
      ctx.fill()

      // Left Accent Core Dot
      ctx.fillStyle = '#a5b4fc'
      ctx.beginPath()
      ctx.arc(-pw / 2 + 8, 0, 2.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9.5px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(it.label, 4, 0.5)
    }

    ctx.restore()
  }

  // Main Canvas Render Loop
  useEffect(() => {
    if (!isPlaying || gameOver || isPaused) return

    let lastSpawn = performance.now()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const loop = (now: number) => {
      const spawnInterval = Math.max(650, 1150 - level * 90)
      if (now - lastSpawn > spawnInterval) {
        spawnItemFromPool(canvas.width, level)
        lastSpawn = now
      }

      if (keysPressed.current.left) {
        targetX.current = Math.max(42, targetX.current - 8)
      }
      if (keysPressed.current.right) {
        targetX.current = Math.min(canvas.width - 42, targetX.current + 8)
      }

      playerX.current += (targetX.current - playerX.current) * 0.35

      // Canvas Background
      ctx.fillStyle = isDark ? '#090d16' : '#f8fafc'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Background Grid
      ctx.strokeStyle = isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.07)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Player Orbiter Vessel
      const pX = playerX.current
      const pY = canvas.height - 38
      const pW = 76
      const pH = 24

      // Shield Aura
      if (shieldActive) {
        ctx.strokeStyle = '#22d3ee'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(pX, pY + pH / 2, pW / 2 + 6, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Multiplier Glow Aura
      if (multiplierActive) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)'
        ctx.beginPath()
        ctx.arc(pX, pY + pH / 2, pW / 2 + 10, 0, Math.PI * 2)
        ctx.fill()
      }

      // Player Vessel Body
      ctx.fillStyle = multiplierActive ? '#f59e0b' : '#4f46e5'
      ctx.beginPath()
      ctx.roundRect(pX - pW / 2, pY, pW, pH, 7)
      ctx.fill()

      // Player Vessel Top Glowing Thruster Trim
      ctx.fillStyle = multiplierActive ? '#fef08a' : (isDark ? '#a5b4fc' : '#c7d2fe')
      ctx.fillRect(pX - pW / 2 + 4, pY + 2, pW - 8, 2.5)

      // Player Label
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(multiplierActive ? 'HYPER 2X' : 'ORBITER', pX, pY + 16)

      // Update & Draw Items
      const itemsList = itemPool.current
      for (let i = 0; i < itemsList.length; i++) {
        const it = itemsList[i]
        if (!it.active) continue

        it.y += it.speed

        // Render shape
        drawGeometricItem(ctx, it)

        // Collision Check
        if (
          it.y >= pY - 8 &&
          it.y <= pY + pH &&
          Math.abs(it.x - pX) < pW / 2 + it.size / 2 - 6
        ) {
          if (it.type === 'hazard') {
            if (shieldActive) {
              setShieldActive(false)
              spawnParticlesFromPool(it.x, it.y, '#22d3ee', 12)
              spawnTextFromPool(it.x, it.y, 'SHIELD SAVED', '#22d3ee')
              playSound('shield')
            } else {
              spawnParticlesFromPool(it.x, it.y, '#ef4444', 14)
              spawnTextFromPool(it.x, it.y, '-1 LIFE', '#ef4444')
              playSound('hit')
              setCombo(0)
              setLives((l) => {
                const nl = l - 1
                if (nl <= 0) {
                  setGameOver(true)
                  setIsPlaying(false)
                  playSound('gameover')
                }
                return nl
              })
            }
          } else if (it.type === 'boost') {
            setMultiplierActive(true)
            setMultiplierTimer(6)
            spawnParticlesFromPool(it.x, it.y, '#f59e0b', 12)
            spawnTextFromPool(it.x, it.y, '2X SPEED!', '#f59e0b')
            playSound('powerup')
          } else if (it.type === 'shield') {
            setShieldActive(true)
            spawnParticlesFromPool(it.x, it.y, '#06b6d4', 12)
            spawnTextFromPool(it.x, it.y, '+SHIELD', '#06b6d4')
            playSound('shield')
          } else if (it.type === 'repair') {
            setLives((prev) => Math.min(3, prev + 1))
            spawnParticlesFromPool(it.x, it.y, '#ec4899', 12)
            spawnTextFromPool(it.x, it.y, '+1 LIFE', '#ec4899')
            playSound('heal')
          } else {
            // Clean +1 Point Addition (or +2 under 2X, +5 for Nova Star)
            const basePoints = it.points // 1 for core, 5 for nova
            const finalPts = multiplierActive ? basePoints * 2 : basePoints

            setCombo((c) => {
              const nextCombo = c + 1
              setMaxCombo((prevMax) => Math.max(prevMax, nextCombo))

              setScore((s) => {
                const nextScore = s + finalPts
                checkLevelUp(nextScore, level)

                setHighScore((h) => {
                  if (nextScore > h) {
                    setIsNewHighScore(true)
                    try {
                      localStorage.setItem('resumeforge_game_highscore', String(nextScore))
                    } catch {
                      // ignore
                    }
                    return nextScore
                  }
                  return h
                })
                return nextScore
              })

              const pitch = 1 + Math.min(nextCombo, 5) * 0.1
              playSound('catch', pitch)

              spawnParticlesFromPool(it.x, it.y, it.color, 10)
              spawnTextFromPool(it.x, it.y, `+${finalPts}`, it.color)

              return nextCombo
            })
          }

          it.active = false
          continue
        }

        // Drop below screen
        if (it.y > canvas.height + 25) {
          if (it.type === 'core' || it.type === 'nova') {
            setCombo(0)
            setLives((l) => {
              const nl = l - 1
              if (nl <= 0) {
                setGameOver(true)
                setIsPlaying(false)
                playSound('gameover')
              }
              return nl
            })
            spawnTextFromPool(it.x, canvas.height - 20, 'MISSED', '#ef4444')
          }
          it.active = false
        }
      }

      // Process Particles Pool
      const particlesList = particlePool.current
      for (let p = 0; p < particlesList.length; p++) {
        const pt = particlesList[p]
        if (!pt.active) continue

        pt.x += pt.vx
        pt.y += pt.vy
        pt.life--

        ctx.fillStyle = pt.color
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2)
        ctx.fill()

        if (pt.life <= 0) pt.active = false
      }

      // Process Floating Texts Pool
      const textsList = textPool.current
      for (let t = 0; t < textsList.length; t++) {
        const ft = textsList[t]
        if (!ft.active) continue

        ft.y -= 1.0
        ft.life--

        ctx.fillStyle = ft.color
        ctx.font = 'bold 11px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(ft.text, ft.x, ft.y)

        if (ft.life <= 0) ft.active = false
      }

      animationFrameId.current = requestAnimationFrame(loop)
    }

    animationFrameId.current = requestAnimationFrame(loop)
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    }
  }, [
    isPlaying,
    gameOver,
    isPaused,
    level,
    multiplierActive,
    shieldActive,
    isDark,
    spawnItemFromPool,
    playSound,
    checkLevelUp,
  ])

  // Mouse & Touch Input Handler
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = 460 / rect.width
    const x = (e.clientX - rect.left) * scaleX
    targetX.current = Math.max(38, Math.min(460 - 38, x))
  }

  const CurrentRankIcon = ARCADE_RANKS[Math.min(level - 1, ARCADE_RANKS.length - 1)].Icon

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
                Cosmic Void Arcade
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-1.5 py-0.2 text-[9px] font-extrabold text-white animate-pulse">
                ARCADE
              </span>
            </div>
            <p className="text-[10.5px] text-ink-500 hidden sm:block">
              Catch energy cores & dodge void hazards
            </p>
          </div>
        </div>

        {/* Minimal Shape Legend Guide */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-ink-600 dark:text-ink-300 bg-paper-50/90 dark:bg-paper-50/60 px-2.5 py-1 rounded-lg border border-ink-100 dark:border-ink-200 shadow-2xs">
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
            <span className="h-2 w-3.5 rounded-full bg-indigo-600 inline-block" /> Core (+1)
          </span>
          <span className="text-ink-300">•</span>
          <span className="flex items-center gap-1 text-amber-600">
            <Hexagon className="h-3 w-3" /> 2X
          </span>
          <span className="text-ink-300">•</span>
          <span className="flex items-center gap-1 text-cyan-600">
            <Shield className="h-3 w-3" /> Shield
          </span>
          <span className="text-ink-300">•</span>
          <span className="flex items-center gap-1 text-rose-600">
            <Diamond className="h-3 w-3 fill-rose-500 text-rose-500" /> Void
          </span>
        </div>
      </div>

      {/* Top Game Status Bar */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-2.5 dark:border-ink-200">
        {/* Left: High Score & Rank */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 font-semibold text-ink-700">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>High: <strong className="font-mono text-ink-900">{highScore}</strong></span>
          </div>

          <div className="flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-[11px]">
            <CurrentRankIcon className="h-3 w-3" />
            <span>Lvl {level}: {rankTitle}</span>
          </div>
        </div>

        {/* Right: Combos, Buffs, Lives, Sound */}
        <div className="flex items-center gap-2 text-xs">
          {combo >= 2 && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-extrabold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-[11px] animate-bounce">
              <Zap className="h-3 w-3" /> x{combo} Combo
            </span>
          )}

          {multiplierActive && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 text-[11px] animate-pulse">
              <Flame className="h-3 w-3 text-amber-600" /> 2X ({multiplierTimer}s)
            </span>
          )}

          {shieldActive && (
            <span className="flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-0.5 font-bold text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 text-[11px]">
              <Shield className="h-3 w-3" /> Active
            </span>
          )}

          {/* Lives Indicator */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                className={`h-3.5 w-3.5 transition-colors ${
                  heartIndex <= lives
                    ? 'fill-rose-500 text-rose-500'
                    : 'fill-transparent text-ink-200 dark:text-ink-400'
                }`}
              />
            ))}
          </div>

          {/* Audio Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-900 transition-colors"
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-indigo-500" /> : <VolumeX className="h-3.5 w-3.5 text-ink-300" />}
          </button>
        </div>
      </div>

      {/* Canvas Viewport: Theme-Adaptive Surface */}
      <div className="relative mt-3 w-full overflow-hidden rounded-xl border border-indigo-200/80 bg-paper-100 shadow-inner dark:border-indigo-500/30 dark:bg-[#090d16]">
        <canvas
          ref={canvasRef}
          width={460}
          height={320}
          onPointerMove={handlePointerMove}
          className="w-full cursor-ew-resize touch-none select-none block"
        />

        {/* Modal Overlay: Theme-Adaptive Seamless Glassmorphism */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper-50/92 p-6 text-center backdrop-blur-md transition-all dark:bg-slate-950/88">
            {gameOver ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                {isNewHighScore && (
                  <div className="mb-2 flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-extrabold text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-bounce">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>NEW HIGH SCORE!</span>
                  </div>
                )}
                <h4 className="font-display text-2xl font-black tracking-tight text-rose-600 dark:text-rose-500">
                  Mission Failed
                </h4>

                <div className="mt-2.5 grid grid-cols-3 gap-3 rounded-xl border border-ink-100 bg-paper-100/80 p-3 text-xs text-ink-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <div>
                    <span className="text-ink-500 text-[11px] dark:text-slate-400">Score</span>
                    <div className="font-mono text-base font-bold text-ink-900 dark:text-white">{score}</div>
                  </div>
                  <div>
                    <span className="text-ink-500 text-[11px] dark:text-slate-400">Max Combo</span>
                    <div className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">{maxCombo}x</div>
                  </div>
                  <div>
                    <span className="text-ink-500 text-[11px] dark:text-slate-400">Rank</span>
                    <div className="font-bold text-ink-900 dark:text-white">Lvl {level}: {rankTitle}</div>
                  </div>
                </div>

                <Button variant="primary" size="sm" onClick={startGame} className="mt-4 gap-1.5 text-xs h-8 shadow-md">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Play Again</span>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in fade-in">
                {/* Glowing Emblem Icon */}
                <div className="relative mb-3 flex items-center justify-center">
                  <div className="absolute h-16 w-16 rounded-full bg-indigo-500/25 blur-xl animate-pulse" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>

                <h4 className="font-display text-xl font-bold tracking-tight text-ink-900 dark:text-white">
                  Cosmic Void Arcade
                </h4>
                <p className="mt-1 max-w-[320px] text-xs text-ink-600 leading-relaxed dark:text-slate-300">
                  Catch <strong className="text-indigo-600 dark:text-indigo-400">Energy Cores</strong> for <strong>+1 point</strong>, grab <strong className="text-amber-600 dark:text-amber-400">Hyper 2X</strong> & <strong className="text-cyan-600 dark:text-cyan-400">Shields</strong>, and avoid <strong className="text-rose-600 dark:text-rose-400">Void Hazards</strong>!
                </p>

                <Button
                  variant="primary"
                  size="md"
                  onClick={startGame}
                  className="mt-4 gap-2 text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-transform"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Launch Arcade Mission</span>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Button>
              </div>
            )}
          </div>
        )}

        {isPaused && isPlaying && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper-50/88 p-4 text-center backdrop-blur-md dark:bg-slate-950/88">
            <Pause className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-1" />
            <h4 className="font-display text-lg font-bold text-ink-900 dark:text-white">Paused</h4>
            <p className="text-xs text-ink-500 dark:text-slate-400 mt-0.5">Press Space or click below to resume</p>
            <Button variant="primary" size="sm" onClick={() => setIsPaused(false)} className="mt-3 text-xs h-8">
              Resume Mission
            </Button>
          </div>
        )}
      </div>

      {/* Game Footer / Controls Guide & Current Score */}
      <div className="mt-2.5 flex w-full items-center justify-between text-xs text-ink-500">
        <span className="text-[11px] text-ink-400">
          Controls: <kbd className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[10px] text-ink-700 dark:bg-ink-200">A</kbd> <kbd className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[10px] text-ink-700 dark:bg-ink-200">D</kbd> or <kbd className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[10px] text-ink-700 dark:bg-ink-200">←</kbd> <kbd className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[10px] text-ink-700 dark:bg-ink-200">→</kbd> or Drag
        </span>
        <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
          Score: <span className="text-sm text-ink-900 font-extrabold">{score}</span>
        </div>
      </div>
    </div>
  )
}
