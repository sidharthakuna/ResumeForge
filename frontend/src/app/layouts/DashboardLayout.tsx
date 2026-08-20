import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { TopBar } from '@/components/layout/TopBar'
import { MobileAppLayout } from '@/components/layout/MobileAppLayout'

export function DashboardLayout() {
  return (
    <>
      {/* Desktop layout for large screens */}
      <div className="hidden min-h-screen bg-paper-100 lg:block">
        <AppSidebar />
        <div className="flex min-h-screen flex-col lg:pl-64">
          <TopBar />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile layout module for mobile and tablet screens only */}
      <div className="block lg:hidden">
        <MobileAppLayout>
          <Outlet />
        </MobileAppLayout>
      </div>
    </>
  )
}
