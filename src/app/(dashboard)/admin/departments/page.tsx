import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DepartmentsClient from './departments-client'

export default async function DepartmentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if admin
  const { data: currentUser } = await supabase
    .from('departments')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!currentUser?.is_admin) redirect('/rooms')

  // Fetch all departments
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  return <DepartmentsClient departments={departments || []} />
}
