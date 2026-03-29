import { createClient } from '@/lib/supabase/server'
import RoomsBrowseClient from './rooms-browse-client'

export const revalidate = 300 // Revalidate every 5 minutes

export default async function RoomsPage() {
  const supabase = await createClient()

  const { data: rooms } = await supabase.from('rooms').select('*').order('name')

  return <RoomsBrowseClient rooms={rooms || []} />
}
