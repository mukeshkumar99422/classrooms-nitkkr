import { getSessionUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MyScheduleClient from './my-schedule-client'
import { getCachedDepartment } from '@/lib/supabase/user';

export default async function MySchedulePage() {
  const department = await getCachedDepartment();
  if(!department) redirect('/login');
  if(department.is_admin) redirect('/admin/rooms');

  return (
    <MyScheduleClient
      department={department}
    />
  )
}
