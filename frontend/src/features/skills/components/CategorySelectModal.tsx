import {
  X,
  Terminal,
  Server,
  Layout,
  Database,
  Wrench,
  Cpu,
  Cloud,
  CheckSquare,
  Sparkles,
} from 'lucide-react'

export interface CategoryOption {
  label: string
  icon: typeof Terminal
  example: string
  description: string
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    label: 'Programming Languages',
    icon: Terminal,
    example: 'Java, JavaScript, Python, C++, HTML, CSS',
    description: 'Core languages used across your projects',
  },
  {
    label: 'Backend Technologies',
    icon: Server,
    example: 'Spring Boot, REST APIs, Microservices, Hibernate, Node.js',
    description: 'Server-side frameworks, ORMs, and API protocols',
  },
  {
    label: 'Frontend Technologies',
    icon: Layout,
    example: 'React.js, Next.js, Vite, Redux, TailwindCSS',
    description: 'Client-side frameworks, UI libraries, and state tools',
  },
  {
    label: 'Databases & Storage',
    icon: Database,
    example: 'PostgreSQL, MySQL, MongoDB, Redis',
    description: 'Relational databases, NoSQL, and caching engines',
  },
  {
    label: 'Tools & Platforms',
    icon: Wrench,
    example: 'Git, GitHub, Docker, Maven, Postman, VS Code, IntelliJ IDEA',
    description: 'IDEs, version control, build tools, and utilities',
  },
  {
    label: 'Core Concepts',
    icon: Cpu,
    example: 'OOP, Exception Handling, Collections, DSA, API Design, System Design',
    description: 'Computer Science fundamentals and architectural concepts',
  },
  {
    label: 'DevOps & Cloud',
    icon: Cloud,
    example: 'AWS, Docker, Kubernetes, CI/CD, NGINX',
    description: 'Cloud hosting, containerization, and deployment pipelines',
  },
  {
    label: 'Testing & Quality Assurance',
    icon: CheckSquare,
    example: 'JUnit 5, Mockito, Postman, Jest',
    description: 'Unit testing, mock frameworks, and API test suites',
  },
]

interface CategorySelectModalProps {
  open: boolean
  onClose: () => void
  onSelect: (category: string, exampleSkills: string) => void
}

export function CategorySelectModal({ open, onClose, onSelect }: CategorySelectModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-900">
                Select Skill Category
              </h2>
              <p className="text-xs text-ink-500">
                Choose a standard software engineering category
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {CATEGORY_OPTIONS.map((opt) => {
            const IconComponent = opt.icon
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  onSelect(opt.label, opt.example)
                  onClose()
                }}
                className="group flex w-full items-start gap-3 rounded-xl border border-ink-100/70 bg-ink-50/40 p-3.5 text-left transition-all hover:border-indigo-500/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/15"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <IconComponent className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-ink-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {opt.label}
                    </h3>
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {opt.description}
                  </p>
                  <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                    {opt.example}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
