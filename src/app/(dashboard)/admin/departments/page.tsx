import { getSessionUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DepartmentsClient from './departments-client'
import { getCachedDepartment } from '@/lib/supabase/user'

export default async function DepartmentsPage() {
  const department = await getCachedDepartment()
  if (!department?.is_admin) redirect('/rooms')
    
  return <DepartmentsClient/>
}
