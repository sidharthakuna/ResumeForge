import { useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  Terminal,
  Server,
  Layout,
  Database,
  Wrench,
  Cpu,
  Cloud,
  CheckSquare,
} from 'lucide-react'

export interface CategoryOption {
  label: string
  icon: typeof Terminal
  example: string
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { label: 'Programming Languages', icon: Terminal, example: 'Java, JavaScript, Python, C++, HTML, CSS' },
  { label: 'Backend Technologies', icon: Server, example: 'Spring Boot, REST APIs, Microservices, Hibernate' },
  { label: 'Frontend Technologies', icon: Layout, example: 'React.js, Next.js, Vite, TailwindCSS' },
  { label: 'Databases & Storage', icon: Database, example: 'PostgreSQL, MySQL, MongoDB, Redis' },
  { label: 'Tools & Platforms', icon: Wrench, example: 'Git, GitHub, Docker, Maven, Postman, VS Code' },
  { label: 'Core Concepts', icon: Cpu, example: 'OOP, DSA, System Design, Database Design' },
  { label: 'DevOps & Cloud', icon: Cloud, example: 'AWS, Docker, Kubernetes, CI/CD, NGINX' },
  { label: 'Testing & Quality Assurance', icon: CheckSquare, example: 'JUnit 5, Mockito, Postman, Jest' },
]

interface CategorySelectDropdownProps {
  value: string
  onChange: (val: string) => void
  onSelectOption: (label: string, example: string) => void
}

export function CategorySelectDropdown({ value, onChange, onSelectOption }: CategorySelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          id="categoryHeading"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Select or type side heading…"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className="h-11 w-full rounded-lg border border-ink-100 bg-paper-50 px-4 pr-10 text-sm font-medium text-ink-900 shadow-sm placeholder:text-ink-400 transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/15 hover:border-ink-200"
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-ink-100 bg-paper-50 p-1.5 shadow-xl space-y-1 scrollbar-thin animate-in fade-in duration-150">
          <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Standard Side Headings
          </p>
          {CATEGORY_OPTIONS.map((opt) => {
            const IconComp = opt.icon
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  onSelectOption(opt.label, opt.example)
                  setOpen(false)
                }}
                className="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-ink-50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-100/80 dark:bg-indigo-500/20 border border-indigo-200/50 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <IconComp className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-ink-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                    {opt.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-ink-400 shrink-0 hidden sm:inline truncate max-w-[120px]">
                  {opt.example.split(',')[0]}…
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
