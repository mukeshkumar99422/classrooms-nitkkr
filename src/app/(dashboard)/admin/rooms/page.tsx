import { getSessionUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RoomsClient from './rooms-client'
import { getCachedDepartment } from '@/lib/supabase/user'

export default async function AdminRoomsPage() {
  const department = await getCachedDepartment()
  if (!department?.is_admin) redirect('/rooms')

  return (
    <RoomsClient/>
  )
}
