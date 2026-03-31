import { redirect } from 'next/navigation'
import RoomsBrowseClient from './rooms-browse-client'
import { getCachedDepartment } from '@/lib/supabase/user'

export default async function RoomsPage() {
  const department = await getCachedDepartment();
  if(department?.is_admin) redirect('/admin/rooms');

  return <RoomsBrowseClient/>
}
