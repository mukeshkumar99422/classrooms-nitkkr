import { getSessionUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RoomDetailClient from './room-detail-client'
import { getCachedDepartment } from '@/lib/supabase/user'

export default async function RoomDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; name: string }>
  searchParams: Promise<{ name?: string }>

}) {
  const { id} = await params;
  const {name}=await searchParams;
  const room = { id, name: name || 'Room Details' }
  
  const { supabase } = await getSessionUser()
  const department = await getCachedDepartment()
  if(department?.is_admin) redirect(`/admin/rooms/`)

  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .eq('room_id', id)
  if(!schedules) notFound()

  return (
    <RoomDetailClient
      room={room}
      schedules={schedules || []}
      currentDepartmentId={department?.id || ""}
    />
  )
}
