/*
  useUserId: returns the current Supabase auth user's ID.
  Returns null while session is loading or user is not signed in.
*/

import { useState, useEffect } from 'react'
import { supabase } from '../api/supabase'
import api from '../api/client'

export function useUserId() {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user?.id ?? null
      setUserId(id)
      if (id) {
        api.post('/users', { id }).catch(() => {})
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return userId
}
