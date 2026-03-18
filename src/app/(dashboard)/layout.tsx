import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { Toaster } from '@/components/ui/sonner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get department info
  const { data: department } = await supabase
    .from('departments')
    .select('*')
    .eq('id', user.id)
    .single()

  const isAdmin = department?.is_admin || false

  return (
    <div className="flex h-screen bg-slate-950">
      <AppSidebar isAdmin={isAdmin} departmentName={department?.name} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  )
}
