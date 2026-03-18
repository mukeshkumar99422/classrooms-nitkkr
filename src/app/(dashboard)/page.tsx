import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardHome() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: department } = await supabase
    .from('departments')
    .select('*')
    .eq('id', user.id)
    .single()

  if (department?.is_admin) {
    redirect('/admin/departments')
  } else {
    redirect('/rooms')
  }
}
