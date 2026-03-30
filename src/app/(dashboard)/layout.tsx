// import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { Toaster } from '@/components/ui/sonner'
import { UserProvider } from '@/context/user-context'
import { getCachedDepartment } from '@/lib/supabase/user'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const department = await getCachedDepartment()

  if (!department) redirect('/login')


  return (
    <UserProvider initialDepartment={department}>
      <div className="flex h-screen bg-slate-950">
        <AppSidebar/>
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
        <Toaster richColors position="top-right" />
      </div>
    </UserProvider>
  )
}
