import {cache} from 'react'
import { getSessionUser } from './server'
import { Department } from '../types'

// React 'cache' memoizes the result for the lifetime of a single request
export const getCachedDepartment = cache(async (): Promise<Department | null> => {
  const { supabase, user } = await getSessionUser()

  if (!user) return null

  const { data } = await supabase
    .from('departments')
    .select('*')
    .eq('id', user.id)
    .single()

  return data as Department | null
})