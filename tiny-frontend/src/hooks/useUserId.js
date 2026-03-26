/*
  useUserId: generate/persist a UUID in localStorage
*/

import { useState, useEffect } from 'react'
import api from '../api/client'

const USER_ID_KEY = 'tiny_user_id'

export function useUserId() {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    let id = localStorage.getItem(USER_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(USER_ID_KEY, id)
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserId(id)
    // Register with backend 
    api.post('/users', { id }).catch(() => {
     // non critical 
    })
  }, [])

  return userId
}
