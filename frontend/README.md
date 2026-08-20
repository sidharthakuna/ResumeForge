# ResumeForge — Frontend

A React 19 + TypeScript rewrite of the ResumeForge frontend, built against
your actual Spring Boot backend (`resume-abc.zip`) — every API call, field
name, and enum value in this app was read directly from that backend's Java
source, not guessed or inferred from the old frontend.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

Your Spring Boot backend must be running and reachable — by default this
app expects it at `http://localhost:9090` (see `.env`, `VITE_API_BASE_URL`).
You can also change the API base URL at runtime from **Settings** in the
app itself, without rebuilding.

**Important:** your backend's CORS config (`SecurityConfig.java`) only
allows requests from `localhost`/`127.0.0.1` origins. Run this frontend on
localhost too, or update the backend's allowed origins if you deploy either
side elsewhere.

```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

## Two real backend issues found while building this

I read your backend source end-to-end before writing any frontend code.
Two things are worth knowing about — both are documented in code comments
at the exact call sites, and the frontend works around both, but the real
fix belongs on the backend:

### 1. `GeneratedResumeController` route bug

The controller class carries `@RequestMapping("/api/generated-resumes")`,
and the `listForResume` method *also* declares the full path
`/api/resumes/{resumeId}/generated-resumes` on its `@GetMapping`. Spring
concatenates class-level and method-level mappings, so the route that's
actually live on your server is:

```
/api/generated-resumes/api/resumes/{resumeId}/generated-resumes
```

**not** the clean path the in-code comment claims. This frontend calls the
real (doubled) path — see `src/features/export/api/generation.api.ts`.

**Suggested fix:** remove the class-level `@RequestMapping`, or change the
method to `@GetMapping("/{resumeId}/generated-resumes")`.

### 2. No endpoint to list a user's resumes

There is no `findAll`/`findByUser` method anywhere in `ResumeService`,
`ResumeRepository`, or `ResumeController` — confirmed by reading all three.
Your original frontend worked around this with a local registry of resume
IDs in `localStorage`; this app does the same
(`src/features/dashboard/lib/resume-registry.ts`), and is upfront about the
limitation in the dashboard's empty state and in Settings: a resume opened
only by direct link, or created on a different device, won't appear on the
dashboard automatically, even though it still exists and is fully
reachable at `/resumes/:id/edit/personal`.

**Suggested fix:** add `GET /api/resumes` returning the current user's
resumes (a `findByUserId` repository method plus a thin controller route
would do it), and the dashboard can switch to that instead.

## Architecture

Feature-module structure — each domain owns its own `api/`, `components/`,
`schemas/`, and pages:

```
src/
├── app/                     # router, providers, layouts, auth guard
├── components/
│   ├── ui/                  # design-system primitives (Button, Card, …)
│   ├── layout/               # sidebar, topbar, nav config
│   └── feedback/              # SectionHeader, SectionListEditor, SaveStatus
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── resume-editor/        # personal info, summary, core resume hooks
│   ├── education/
│   ├── experience/
│   ├── projects/
│   ├── skills/
│   ├── certifications/
│   ├── achievements/
│   ├── languages/
│   ├── ai-assistant/         # wired to the 2 real AI endpoints only
│   ├── templates/            # 5 frontend-rendered templates + gallery
│   ├── export/                # generate-from-html + download history
│   └── settings/
├── lib/                      # axios client, query keys, session storage
└── types/api.ts               # hand-mirrored from the real backend DTOs
```

### Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router 7 ·
TanStack Query · React Hook Form · Zod · Zustand · Axios · Lucide icons ·
Sonner (toasts)

### Design system

Visually re-themed to match a Stitch-generated mockup ("Forge Professional
System": Indigo primary, Cyan secondary, Hanken Grotesk + Inter, subtle
glassmorphism on the top bar). All tokens live in `styles/theme.css` under
the same `ink-*`/`paper-*`/`brass-*` names the components already used, so
the whole app re-themes from one file — no component had to change its
className to pick up the new palette. Mockup-only controls that have
nothing behind them on the backend (Export's DOCX/paper-size/DPI options,
the Google sign-in button) are shown disabled with a tooltip explaining
why, rather than hidden or faked — see `features/export/pages/ExportPage.tsx`
and `features/auth/pages/LoginPage.tsx`.

### 16 routes

9 are directly backed by real resume sub-resources (Personal, Summary,
Education, Experience, Projects, Skills, Certifications, Achievements,
Languages); AI Assistant, Templates, and Export/History are frontend
features built on top of the real AI-generation and export endpoints;
Dashboard, the standalone Templates gallery, and Settings round it out.
No section here was invented without a backing endpoint — Skills, for
example, intentionally has no proficiency/category UI because
`SkillRequest`/`SkillResponse` only has a `name` field on the backend.

### Templates

Five templates (Standard, Visionary, Director, Essential, Graduate — named
and ordered to match the design mockup) are rendered client-side to a full
HTML document and sent through `POST
/api/resumes/{id}/generate-from-html`, whose `templateName` field is free
text with no backend enum validation. This is separate from the backend's
own two-template Thymeleaf catalog (`MODERN`/`CLASSIC`, used by
`preview-html`/`preview-pdf`/`generate`), which still exists and is wired
up in `resume.api.ts` if you want to use it directly.

The standalone gallery at `/templates` (reached from the sidebar, outside
any specific resume) previews every template against placeholder sample
content in `features/templates/lib/sample-resume.ts` — never real user
data — and creates a new resume with the chosen template pre-selected.
The per-resume gallery at `/resumes/:id/templates` renders the same five
templates against that resume's actual live data instead.

Add a new template by writing a renderer in
`features/templates/renderers/` (see `classic.tsx`, which exports
`standardTemplate`, for the simplest example) and registering it in
`registry.ts`.
