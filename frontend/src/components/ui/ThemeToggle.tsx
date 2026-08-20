import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import styles from './ThemeToggle.module.css'

/**
 * Animated pill-shaped light/dark toggle.
 * Drop it anywhere — it reads and writes via the ThemeContext.
 */
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-checked={isDark}
      role="switch"
      className={[styles.toggle, isDark ? styles.dark : ''].filter(Boolean).join(' ')}
    >
      <span className={styles.track}>
        <span className={styles.thumb}>
          {isDark ? (
            <Moon strokeWidth={2} />
          ) : (
            <Sun strokeWidth={2} />
          )}
        </span>
      </span>
    </button>
  )
}
