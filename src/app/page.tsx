import { getSessionUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { supabase, user } = await getSessionUser()

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
