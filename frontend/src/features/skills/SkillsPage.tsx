import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Code2, Plus, X, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { useAddSkill, useRemoveSkill } from './api/skill.hooks'
import { CategorySelectDropdown } from './components/CategorySelectDropdown'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'

export default function SkillsPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const addMutation = useAddSkill(resumeId)
  const removeMutation = useRemoveSkill(resumeId)

  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const [categoryHeading, setCategoryHeading] = useState('')
  const [skillsText, setSkillsText] = useState('')

  const nextPath = `/resumes/${resumeId}/edit/certifications`

  function handleAdd() {
    const heading = categoryHeading.trim()
    const text = skillsText.trim()
    if (!heading || !text) return

    const formattedName = `${heading}: ${text}`
    const alreadyExists = full.skills.some((s) => s.name.toLowerCase() === formattedName.toLowerCase())
    if (alreadyExists) return

    addMutation.mutate(
      { name: formattedName },
      {
        onSuccess: () => {
          setCategoryHeading('')
          setSkillsText('')
        },
      }
    )
  }

  function handleRemove(id: string) {
    setPendingRemoveId(id)
    removeMutation.mutate(id, { onSettled: () => setPendingRemoveId(null) })
  }

  function handleSelectCategoryOption(label: string, example: string) {
    setCategoryHeading(label)
    if (!skillsText) {
      setSkillsText(example)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <SectionHeader
        title="Technical Skills"
        description="Organize your skills by side heading (e.g. Programming Languages, Databases)."
        icon={Code2}
        colorTone="indigo"
      />

      <div className="space-y-6">
        {/* Form Card: Add Skill Category */}
        <Card className="border-indigo-500/20 shadow-md">
          <CardHeader className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border-b border-indigo-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-ink-900">Add Technical Skill Section</h3>
              </div>
              <Badge tone="indigo">Side Heading Layout</Badge>
            </div>
          </CardHeader>

          <CardBody className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="categoryHeading">Side Heading / Category</Label>
                <CategorySelectDropdown
                  value={categoryHeading}
                  onChange={setCategoryHeading}
                  onSelectOption={handleSelectCategoryOption}
                />
              </div>

              <div>
                <Label htmlFor="skillsText">Skills (comma-separated)</Label>
                <Input
                  id="skillsText"
                  placeholder="e.g. Java, JavaScript, HTML, CSS"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAdd()
                    }
                  }}
                  className="focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                onClick={handleAdd}
                loading={addMutation.isPending}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20"
              >
                <Plus className="h-4 w-4" /> Add Section
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Existing Technical Skills List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">Technical Skills ({full.skills.length})</h3>
              <Badge tone="indigo">Categorized View</Badge>
            </div>
          </CardHeader>
          <CardBody>
            {full.skills.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Code2 className="mx-auto h-8 w-8 text-indigo-400 opacity-60" />
                <p className="text-sm font-medium text-ink-700">No technical skill categories added yet.</p>
                <p className="text-xs text-ink-400">
                  Select or type a Side Heading (e.g. Programming Languages) and Skills above.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-ink-100 rounded-xl border border-ink-100 overflow-hidden bg-paper-50 shadow-xs">
                {full.skills.map((skill) => {
                  const parts = skill.name.split(':')
                  const heading = parts.length > 1 ? parts[0].trim() : 'Skill'
                  const listText = parts.length > 1 ? parts.slice(1).join(':').trim() : skill.name
                  const skillPills = listText.split(',').map((s) => s.trim()).filter(Boolean)

                  return (
                    <div
                      key={skill.id}
                      className="group flex flex-col gap-3 p-4 transition-colors hover:bg-ink-50/60 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* Left Column: Side Heading */}
                      <div className="sm:w-1/3 shrink-0">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-white shadow-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-100" />
                          <span className="text-xs font-bold uppercase tracking-wider text-white">
                            {heading}
                          </span>
                        </div>
                      </div>

                      {/* Middle Column: Skill Pills */}
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-1.5">
                          {skillPills.map((pill, i) => (
                            <span
                              key={i}
                              className="rounded-md border border-ink-100 bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-800 shadow-2xs"
                            >
                              {pill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Column: Actions */}
                      <div className="flex items-center justify-end shrink-0 sm:pl-2">
                        <button
                          onClick={() => handleRemove(skill.id)}
                          disabled={pendingRemoveId === skill.id}
                          aria-label={`Remove ${skill.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-40"
                          title="Remove section"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Action Controls */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => navigate(nextPath)}
            className="gap-2 bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs font-semibold rounded-xl"
          >
            Next: Certifications <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
