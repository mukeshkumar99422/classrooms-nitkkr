import { getCachedDepartment } from '@/lib/supabase/user'
import { redirect } from 'next/navigation'

export default async function Home() {
  const department = await getCachedDepartment()

  if (!department) redirect('/login')

  if (department.is_admin) {
    redirect('/admin/departments')
  } else {
    redirect('/rooms')
  }
}
