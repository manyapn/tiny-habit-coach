/*
  useHabit: fetch the user's active habit from the backend

  returns:
    - loading: true while the request is in flight
    - habit: the data once it arrives (or null if no habit yet)
    - error: the error message if something went wrong
    - refetch: call this to re-fetch (used after a redesign)
*/

import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'

export function useHabit(userId) {
  const [habit, setHabit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHabit = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/habits/${userId}`)
      setHabit(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setHabit(null) // No habit yet — user needs onboarding
      } else {
        setError('Could not load habit')
      }
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchHabit() }, [fetchHabit])

  return { habit, loading, error, refetch: fetchHabit }
}
