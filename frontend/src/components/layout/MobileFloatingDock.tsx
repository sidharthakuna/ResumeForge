import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronDown, Hand, Eye, FileText } from 'lucide-react'
import { clsx } from 'clsx'
import { toast } from 'sonner'
import type { NavItem } from './nav-config'
import styles from './MobileFloatingDock.module.css'

interface MobileFloatingDockProps {
  resumeId: string
  allSections: NavItem[]
  editorSections: NavItem[]
  toolSections: NavItem[]
  currentIndex: number
  currentSection: NavItem
  prevSection: NavItem | null
  nextSection: NavItem | null
  activeTab: 'edit' | 'preview'
  setActiveTab: React.Dispatch<React.SetStateAction<'edit' | 'preview'>>
  isFullWidthPage: boolean
  goToPrevSection: () => void
  goToNextSection: () => void
}

export function MobileFloatingDock({
  resumeId,
  allSections,
  editorSections,
  toolSections,
  currentIndex,
  currentSection,
  prevSection,
  nextSection,
  activeTab,
  setActiveTab,
  isFullWidthPage,
  goToPrevSection,
  goToNextSection,
}: MobileFloatingDockProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false)

  // Handedness preference: 'right' (default first preference for right-handed users) | 'left'
  const [handMode, setHandMode] = useState<'right' | 'left'>(() => {
    const saved = localStorage.getItem('rf_hand_mode')
    if (saved === 'left' || saved === 'right') return saved
    return 'right'
  })

  const toggleHandMode = () => {
    const next = handMode === 'right' ? 'left' : 'right'
    setHandMode(next)
    localStorage.setItem('rf_hand_mode', next)
    toast.success(next === 'left' ? 'Switched to Left-handed layout' : 'Switched to Right-handed layout', {
      duration: 1500,
    })
  }

  return (
    <div className={styles.dockWrapper}>
      <div className={styles.dockContainer}>
        <div className={styles.dockPill}>
          {handMode === 'right' ? (
            /* Right-handed layout: Primary controls (Next, Preview) on the RIGHT side */
            <>
              <div className={styles.stepNavGroup}>
                <button
                  onClick={goToPrevSection}
                  disabled={!prevSection}
                  className={styles.navArrowBtn}
                  aria-label="Previous section"
                  title={prevSection ? `Previous: ${prevSection.label}` : 'Start of sections'}
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>

                <button
                  onClick={() => setSectionMenuOpen((o) => !o)}
                  className={styles.stepPillBtn}
                >
                  <currentSection.icon className={styles.stepIcon} />
                  <span className={styles.stepLabel}>{currentSection.label}</span>
                  <span className={styles.stepCounterBadge}>
                    {currentIndex >= 0 ? `${currentIndex + 1}/${allSections.length}` : '1'}
                  </span>
                  <ChevronDown className={styles.stepChevron} />
                </button>

                <button
                  onClick={goToNextSection}
                  disabled={!nextSection}
                  className={styles.navArrowBtn}
                  aria-label="Next section"
                  title={nextSection ? `Next: ${nextSection.label}` : 'End of sections'}
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className={styles.controlsGroup}>
                <button
                  onClick={toggleHandMode}
                  className={clsx(styles.handBtn, styles.handBtnDefault)}
                  title="Right-handed mode active. Tap to switch to Left-handed mode."
                  aria-label="Toggle handedness mode"
                >
                  <Hand className="h-3.5 w-3.5" />
                  <span>Righty</span>
                </button>

                {!isFullWidthPage && (
                  <button
                    onClick={() => setActiveTab((t) => (t === 'edit' ? 'preview' : 'edit'))}
                    className={clsx(
                      styles.viewModePill,
                      activeTab === 'preview' ? styles.viewModePreview : styles.viewModeEdit
                    )}
                    title={activeTab === 'edit' ? 'Switch to Preview mode' : 'Switch to Edit mode'}
                  >
                    {activeTab === 'edit' ? (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </>
                    ) : (
                      <>
                        <FileText className="h-3.5 w-3.5" /> Edit
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Left-handed layout: Primary controls (Next, Preview) on the LEFT side */
            <>
              <div className={styles.controlsGroup}>
                {!isFullWidthPage && (
                  <button
                    onClick={() => setActiveTab((t) => (t === 'edit' ? 'preview' : 'edit'))}
                    className={clsx(
                      styles.viewModePill,
                      activeTab === 'preview' ? styles.viewModePreview : styles.viewModeEdit
                    )}
                    title={activeTab === 'edit' ? 'Switch to Preview mode' : 'Switch to Edit mode'}
                  >
                    {activeTab === 'edit' ? (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Preview
                      </>
                    ) : (
                      <>
                        <FileText className="h-3.5 w-3.5" /> Edit
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={toggleHandMode}
                  className={clsx(styles.handBtn, styles.handBtnActive)}
                  title="Left-handed mode active. Tap to switch to Right-handed mode."
                  aria-label="Toggle handedness mode"
                >
                  <Hand className="h-3.5 w-3.5" />
                  <span>Lefty</span>
                </button>
              </div>

              <div className={styles.stepNavGroup}>
                <button
                  onClick={goToPrevSection}
                  disabled={!prevSection}
                  className={styles.navArrowBtn}
                  aria-label="Previous section"
                  title={prevSection ? `Previous: ${prevSection.label}` : 'Start of sections'}
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>

                <button
                  onClick={() => setSectionMenuOpen((o) => !o)}
                  className={styles.stepPillBtn}
                >
                  <currentSection.icon className={styles.stepIcon} />
                  <span className={styles.stepLabel}>{currentSection.label}</span>
                  <span className={styles.stepCounterBadge}>
                    {currentIndex >= 0 ? `${currentIndex + 1}/${allSections.length}` : '1'}
                  </span>
                  <ChevronDown className={styles.stepChevron} />
                </button>

                <button
                  onClick={goToNextSection}
                  disabled={!nextSection}
                  className={styles.navArrowBtn}
                  aria-label="Next section"
                  title={nextSection ? `Next: ${nextSection.label}` : 'End of sections'}
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Upward Dark-Glass Bottom Sheet for Section Selection */}
        {sectionMenuOpen && (
          <div
            className={clsx(
              styles.bottomSheet,
              handMode === 'left' ? styles.bottomSheetAlignRight : styles.bottomSheetAlignLeft
            )}
          >
            <div className={styles.bottomSheetHeader}>
              <p className={styles.bottomSheetTitle}>Select Section</p>
              <button
                onClick={() => setSectionMenuOpen(false)}
                className={styles.doneBtn}
              >
                Done
              </button>
            </div>

            <div>
              <p className={styles.sectionGroupTitle}>Resume Content</p>
              {editorSections.map((sec, idx) => (
                <button
                  key={sec.label}
                  onClick={() => {
                    navigate(sec.path(resumeId))
                    setSectionMenuOpen(false)
                    setActiveTab('edit')
                  }}
                  className={clsx(
                    styles.sectionItemBtn,
                    location.pathname === sec.path(resumeId)
                      ? styles.sectionItemActive
                      : styles.sectionItemInactive
                  )}
                >
                  <div className={styles.sectionItemContent}>
                    <sec.icon className={styles.stepIcon} />
                    <span>{sec.label}</span>
                  </div>
                  <span className={styles.sectionItemStepBadge}>Step {idx + 1}</span>
                </button>
              ))}

              <div className={styles.divider} />

              <p className={styles.sectionGroupTitle}>Export &amp; Preview</p>
              {toolSections.map((sec) => (
                <button
                  key={sec.label}
                  onClick={() => {
                    navigate(sec.path(resumeId))
                    setSectionMenuOpen(false)
                    setActiveTab('edit')
                  }}
                  className={clsx(
                    styles.sectionItemBtn,
                    location.pathname === sec.path(resumeId)
                      ? styles.sectionItemActive
                      : styles.sectionItemInactive
                  )}
                >
                  <div className={styles.sectionItemContent}>
                    <sec.icon className={styles.stepIcon} />
                    <span>{sec.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
