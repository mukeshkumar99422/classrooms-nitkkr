import { createClient } from '@/lib/supabase/server'
import DepartmentsClient from './departments-client'

export const revalidate = 300 // Revalidate every 5 minutes

export default async function DepartmentsPage() {
  const supabase = await createClient()

  // Fetch all departments
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  return <DepartmentsClient departments={departments || []} />
}
