import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RoomsBrowseClient from './rooms-browse-client'

export default async function RoomsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rooms } = await supabase.from('rooms').select('*').order('name')

  return <RoomsBrowseClient rooms={rooms || []} />
}
