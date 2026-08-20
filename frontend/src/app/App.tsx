import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from './router'
import { AppProviders } from './providers'
import { ThemeProvider } from '@/contexts/ThemeContext'

export function App() {
  return (
    <ThemeProvider>
      <AppProviders>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              fontSize: '13.5px',
            },
          }}
        />
      </AppProviders>
    </ThemeProvider>
  )
}
