/*
  Weekly.jsx — weekly AI review (available after 7+ days)

    context = {
      habit: { action, time, location, why },
      checkins_summary: "Mon: ✓, Tue: ✓, Wed: ✗, Thu: ✓, Fri: ✗, Sat: ✓, Sun: ✓",
      streak: N,
      completion_rate: 0.71,
      redesign_count: N,
      days_since_start: N
    }

  CHECKINS_SUMMARY FORMAT:
    We build a human-readable string of this week's check-ins.
    "Mon: ✓, Tue: ✓, Wed: ✗" is more useful to the AI than a JSON array.
    The AI can then reference "both misses were Wednesday evenings" naturally.

  THE REVIEW CONVERSATION:
    Same Chat component used in Onboarding and Checkin.
    The AI opens the conversation with a data-driven weekly observation.
    The user can respond and have a multi-turn conversation.
    No done:JSON detection needed here 
*/

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserId } from '../hooks/useUserId'
import { useHabit } from '../hooks/useHabit'
import { useCheckins } from '../hooks/useCheckins'
import Chat from '../components/Chat'
import api from '../api/client'
import styles from './Weekly.module.css'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildCheckinsSummary(checkins) {
  // Build a string summarizing the last 7 days
  const today = new Date()
  const parts = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toLocaleDateString('en-CA')
    const dayName = DAY_NAMES[d.getDay()]
    const found = checkins.find(c => c.date === dateStr)
    const symbol = found ? (found.completed === 1 ? '✓' : '✗') : '–'
    parts.push(`${dayName}: ${symbol}`)
  }
  return parts.join(', ')
}

export default function Weekly() {
  const userId = useUserId()
  const navigate = useNavigate()
  const { habit } = useHabit(userId)
  const { checkins } = useCheckins(userId)
  const [chatMessages, setChatMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!userId) return
    api.get(`/stats/${userId}`).then(res => setStats(res.data)).catch(() => {})
  }, [userId])

  // Start the weekly review conversation once we have all data
  useEffect(() => {
    if (!habit || !stats || !checkins.length || initialized.current) return
    initialized.current = true
    sendWeeklyMessage([])
  }, [habit, stats, checkins, sendWeeklyMessage])

  function buildContext() {
    return {
      habit: {
        action: habit?.action,
        time: habit?.time,
        location: habit?.location,
        why: habit?.why,
      },
      checkins_summary: buildCheckinsSummary(checkins),
      streak: stats?.streak || 0,
      completion_rate: stats?.completion_rate || 0,
      redesign_count: stats?.redesign_count || 0,
      days_since_start: stats?.days_since_start || 7,
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function sendWeeklyMessage(msgs) {
    setIsLoading(true)
    try {
      const res = await api.post('/ai/chat', {
        system_prompt_key: 'weekly',
        messages: msgs.map(({ role, content }) => ({ role, content })),
        context: buildContext(),
      })
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.data.reply, createdAt: new Date() }
      ])
    } catch {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Could not load your weekly review. Try again.', createdAt: new Date() }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleSend(text) {
    const userMsg = { role: 'user', content: text, createdAt: new Date() }
    const newMsgs = [...chatMessages, userMsg]
    setChatMessages(newMsgs)
    sendWeeklyMessage(newMsgs)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/home')}>
          ← home
        </button>
        <h2 className={styles.title}>weekly review</h2>
        {stats && (
          <p className="text-meta">day {stats.days_since_start}</p>
        )}
      </header>

      <div className={styles.chatArea}>
        <Chat
          messages={chatMessages}
          isLoading={isLoading}
          onSend={handleSend}
          placeholder="respond to your coach..."
        />
      </div>
    </div>
  )
}
