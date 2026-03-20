import { getSessionUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import RoomDetailClient from './room-detail-client'

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase, user } = await getSessionUser()

  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('departments')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: room } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single()

  if (!room) notFound()

  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .eq('room_id', id)

  const { data: departments } = await supabase
    .from('departments')
    .select('*')

  return (
    <RoomDetailClient
      room={room}
      schedules={schedules || []}
      departments={departments || []}
      currentDepartmentId={user.id}
      isAdmin={currentUser?.is_admin || false}
    />
  )
}
