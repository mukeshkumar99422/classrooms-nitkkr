import { getSessionUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RoomsBrowseClient from './rooms-browse-client'

export default async function RoomsPage() {
  const { supabase, user } = await getSessionUser()

  if (!user) redirect('/login')

  const { data: rooms } = await supabase.from('rooms').select('*').order('name')

  return <RoomsBrowseClient rooms={rooms || []} />
}
