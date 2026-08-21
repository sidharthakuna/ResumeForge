import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { EditorLayout } from '@/app/layouts/EditorLayout'
import { RequireAuth } from '@/app/RequireAuth'

import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import MyResumesPage from '@/features/dashboard/pages/MyResumesPage'
import SettingsPage from '@/features/settings/pages/SettingsPage'
import GlobalAiAssistantPage from '@/features/ai-assistant/pages/GlobalAiAssistantPage'
import AtsCheckerPage from '@/features/ai-assistant/pages/AtsCheckerPage'
import JobTailorPage from '@/features/ai-assistant/pages/JobTailorPage'
import SummaryStudioPage from '@/features/ai-assistant/pages/SummaryStudioPage'
import SkillsOptimizerPage from '@/features/ai-assistant/pages/SkillsOptimizerPage'

import PersonalInfoPage from '@/features/resume-editor/pages/PersonalInfoPage'
import PhotoPage from '@/features/resume-editor/pages/PhotoPage'
import SummaryPage from '@/features/resume-editor/pages/SummaryPage'
import EducationPage from '@/features/education/EducationPage'
import ExperiencePage from '@/features/experience/ExperiencePage'
import ProjectsPage from '@/features/projects/ProjectsPage'
import SkillsPage from '@/features/skills/SkillsPage'
import CertificationsPage from '@/features/certifications/CertificationsPage'
import AchievementsPage from '@/features/achievements/AchievementsPage'
import StrengthsPage from '@/features/strengths/StrengthsPage'
import LanguagesPage from '@/features/languages/LanguagesPage'
import TemplatesPage from '@/features/templates/pages/TemplatesPage'
import TemplatesGalleryPage from '@/features/templates/pages/TemplatesGalleryPage'
import ExportPage from '@/features/export/pages/ExportPage'

import NotFoundPage from '@/app/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  {
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/resumes', element: <MyResumesPage /> },
      { path: '/templates', element: <TemplatesGalleryPage /> },
      { path: '/ai', element: <GlobalAiAssistantPage /> },
      { path: '/ai/ats', element: <AtsCheckerPage /> },
      { path: '/ai/tailor', element: <JobTailorPage /> },
      { path: '/ai/summary', element: <SummaryStudioPage /> },
      { path: '/ai/skills', element: <SkillsOptimizerPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/resumes/:resumeId',
    element: (
      <RequireAuth>
        <EditorLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="edit/personal" replace /> },
      { path: 'edit/personal', element: <PersonalInfoPage /> },
      { path: 'edit/photo', element: <PhotoPage /> },
      { path: 'edit/summary', element: <SummaryPage /> },
      { path: 'edit/education', element: <EducationPage /> },
      { path: 'edit/experience', element: <ExperiencePage /> },
      { path: 'edit/projects', element: <ProjectsPage /> },
      { path: 'edit/skills', element: <SkillsPage /> },
      { path: 'edit/certifications', element: <CertificationsPage /> },
      { path: 'edit/achievements', element: <AchievementsPage /> },
      { path: 'edit/strengths', element: <StrengthsPage /> },
      { path: 'edit/languages', element: <LanguagesPage /> },
      { path: 'ai', element: <GlobalAiAssistantPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'export', element: <ExportPage /> },
    ],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <NotFoundPage /> },
])
