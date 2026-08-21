import { CheckCircle2, AlertTriangle, XCircle, Check, X, Minus } from 'lucide-react'
import type { SkillMatchItem } from '@/types/api'

interface JobMatchBadgeListProps {
  matches?: SkillMatchItem[]
  matchedKeywords?: string[]
  missingKeywords?: string[]
  className?: string
}

export function JobMatchBadgeList({
  matches = [],
  matchedKeywords = [],
  missingKeywords = [],
  className = '',
}: JobMatchBadgeListProps) {
  const allMatched = Array.from(
    new Set([
      ...matchedKeywords,
      ...matches.filter((m) => m.classification === 'MATCH').map((m) => m.skill),
    ])
  )

  const allPartial = Array.from(
    new Set(matches.filter((m) => m.classification === 'PARTIAL_MATCH').map((m) => m.skill))
  )

  const allMissing = Array.from(
    new Set([
      ...missingKeywords,
      ...matches.filter((m) => m.classification === 'MISSING').map((m) => m.skill),
    ])
  )

  if (allMatched.length === 0 && allPartial.length === 0 && allMissing.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {allMatched.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> Matched Skills ({allMatched.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allMatched.map((skill) => (
              <span
                key={skill}
                className="ai-badge-match gap-1"
              >
                <Check className="h-3 w-3 stroke-[2.5]" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {allPartial.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" /> Related / Partial Skills ({allPartial.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allPartial.map((skill) => (
              <span
                key={skill}
                className="ai-badge-partial gap-1"
              >
                <Minus className="h-3 w-3 stroke-[2.5]" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {allMissing.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-600 dark:text-ink-300">
            <XCircle className="h-3.5 w-3.5" /> Missing in Resume ({allMissing.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allMissing.map((skill) => (
              <span
                key={skill}
                className="ai-badge-missing gap-1"
                title="Requested in Job Description, not currently in candidate resume"
              >
                <X className="h-3 w-3 opacity-60" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

