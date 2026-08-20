/**
 * The backend genuinely has no "list my resumes" endpoint (confirmed by
 * reading ResumeService.java, ResumeController.java, and the repository —
 * there is no findAll/findByUser method or route anywhere). The original
 * HTML frontend worked around this by keeping a local registry of resume
 * IDs in localStorage, updated whenever a resume is created, and this app
 * uses the same approach — ported to a small typed module instead of
 * inline script code.
 *
 * This means: a resume created from a different browser/device, or after
 * clearing site data, will not appear on the dashboard even though it
 * still exists and is fully editable by direct link
 * (/resumes/:id/edit/personal). This is disclosed to the user in the
 * dashboard empty state and in Settings, not hidden.
 */

const REGISTRY_KEY = 'rf_resume_registry'

export interface RegistryEntry {
  id: string
  addedAt: string // ISO timestamp, for sorting only — not from the backend
}

function readRegistry(): RegistryEntry[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRegistry(entries: RegistryEntry[]): void {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(entries))
}

export function listRegisteredResumeIds(): RegistryEntry[] {
  return readRegistry().sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1))
}

export function registerResumeId(id: string): void {
  const entries = readRegistry()
  if (entries.some((e) => e.id === id)) return
  writeRegistry([...entries, { id, addedAt: new Date().toISOString() }])
}

export function unregisterResumeId(id: string): void {
  writeRegistry(readRegistry().filter((e) => e.id !== id))
}
