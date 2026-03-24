/*
  useCheckins: fetch the user's check-in history and current streak

  Returns:
    checkins: array of last 30 check-in objects
    streak: current consecutive streak count
    loading: bool
    logCheckin(habitId, completed, frictionNote): function to log a new check-in
    refetch: re-fetch from backend
*/

import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'

export function useCheckins(userId) {
  const [checkins, setCheckins] = useState([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchCheckins = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [checkinsRes, streakRes] = await Promise.all([
        api.get(`/checkins/${userId}`),
        api.get(`/checkins/${userId}/streak`),
      ])
      setCheckins(checkinsRes.data)
      setStreak(streakRes.data.streak)
    } catch {
      // fail 
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchCheckins() }, [fetchCheckins])

  const logCheckin = async (habitId, completed, frictionNote = null) => {
    const today = new Date().toISOString().split('T')[0]
    const res = await api.post('/checkins', {
      user_id: userId,
      habit_id: habitId,
      date: today,
      completed: completed ? 1 : 0,
      friction_note: frictionNote,
    })
    // update local state, refetch for accuracy
    setCheckins(prev => [res.data, ...prev])
    await fetchCheckins()
    return res.data
  }

  return { checkins, streak, loading, logCheckin, refetch: fetchCheckins }
}
