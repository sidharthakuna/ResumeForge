import { CheckCircle2, AlertCircle, Sparkles, Lightbulb } from 'lucide-react'
import type { AtsAnalysisResponse } from '@/types/api'

interface AtsScoreMeterProps {
  analysis: AtsAnalysisResponse
  className?: string
}

export function AtsScoreMeter({ analysis, className = '' }: AtsScoreMeterProps) {
  const { score, matchedKeywords, missingKeywords, suggestions, strengths, formattingWarnings } = analysis

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'ai-ats-score-high'
    if (val >= 60) return 'ai-ats-score-mid'
    return 'ai-ats-score-low'
  }

  const getScoreLabel = (val: number) => {
    if (val >= 85) return 'Exceptional Match'
    if (val >= 70) return 'Strong Alignment'
    if (val >= 50) return 'Moderate Fit'
    return 'Requires Optimization'
  }

  return (
    <div className={`ai-ats-meter-box space-y-4 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-2 font-display text-2xl font-bold shadow-xs ${getScoreColor(score)}`}>
            <span>{score}</span>
            <span className="text-[10px] font-medium opacity-80">/ 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-base font-bold text-ink-900">
                ATS Compatibility Score
              </h4>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-ink-600">
              {matchedKeywords.length} matching keywords identified &bull; {missingKeywords.length} missing signals
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48">
          <div className="ai-ats-track">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(5, score)}%` }}
            />
          </div>
        </div>
      </div>

      {strengths && strengths.length > 0 && (
        <div className="space-y-1.5 pt-2">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" /> Key Strengths
          </p>
          <ul className="space-y-1">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-ink-800 font-medium">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            <Lightbulb className="h-3.5 w-3.5" /> Actionable Recommendations
          </p>
          <ul className="space-y-1.5">
            {suggestions.map((sug, idx) => (
              <li key={idx} className="ai-ats-suggestion-item">
                <span className="font-bold text-purple-700 dark:text-purple-300">•</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {formattingWarnings && formattingWarnings.length > 0 && (
        <div className="space-y-1 pt-1">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-3.5 w-3.5" /> Formatting Warnings
          </p>
          <ul className="space-y-1">
            {formattingWarnings.map((warn, idx) => (
              <li key={idx} className="ai-ats-warning-item">
                &bull; {warn}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
