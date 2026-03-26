/*
  Checkin.jsx — daily check-in flow

  STATE MACHINE:
    'question' → show the habit question + YES / NOT TODAY buttons
    'chat' → missed-day AI conversation
    'done' → completed, redirect to /home after brief delay

  THE YES PATH:
    1. POST /checkins with completed=1
    2. Navigate back to /home

  THE NOT TODAY PATH:
    1. POST /checkins with completed=0
    2. AI opens the conversation and asks what got in the way
    3. Monitor AI messages for {"redesign": true/false} JSON
    4. If redesign=true: PUT /habits/:id with new fields, POST /redesigns
    5. Navigate back to /home
*/

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserId } from '../hooks/useUserId'
import { useHabit } from '../hooks/useHabit'
import { useCheckins } from '../hooks/useCheckins'
import { parseAIResponse } from '../utils/parseAIResponse'
import Chat from '../components/Chat'
import api from '../api/client'
import styles from './Checkin.module.css'

export default function Checkin() {
  const userId = useUserId()
  const navigate = useNavigate()
  const { habit } = useHabit(userId)
  const { checkins, logCheckin } = useCheckins(userId)

  const today = new Date().toLocaleDateString('en-CA')
  const alreadyCheckedIn = checkins.some(c => c.date === today)

  const [phase, setPhase] = useState('question') // 'question' | 'chat' | 'done'
  const [chatMessages, setChatMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const initialized = useRef(false)

  // Count consecutive misses (to send to missed-day prompt)
  const consecutiveMisses = (() => {
    let count = 0
    for (const c of [...checkins].sort((a, b) => b.date.localeCompare(a.date))) {
      if (c.completed === 0) count++
      else break
    }
    return count
  })()

  async function handleYes() {
    if (!habit) return
    await logCheckin(habit.id, true)
    navigate('/home')
  }

  async function handleNotToday() {
    if (!habit) return
    await logCheckin(habit.id, false)
    setPhase('chat')
    if (!initialized.current) {
      initialized.current = true
      await sendMissedDayMessage([])
    }
  }

  async function sendMissedDayMessage(msgs) {
    setIsLoading(true)
    const context = {
      habit,
      consecutive_misses: consecutiveMisses + 1,
    }
    try {
      const res = await api.post('/ai/chat', {
        system_prompt_key: 'missed_day',
        messages: msgs.map(({ role, content }) => ({ role, content })),
        context,
      })
      const reply = res.data.reply
      const redesign = extractRedesign(reply)

      if (redesign) {
        if (redesign.preamble) {
          const parts = parseAIResponse(redesign.preamble)
          for (let i = 0; i < parts.length; i++) {
            if (i > 0) await new Promise(r => setTimeout(r, 400))
            const part = parts[i]
            setChatMessages(prev => [
              ...prev,
              { role: 'assistant', type: part.type, title: part.title, content: part.content, createdAt: new Date() }
            ])
          }
          await new Promise(r => setTimeout(r, 600))
        }
        await handleRedesignResponse(redesign.data)
        return
      }

      const parts = parseAIResponse(reply)
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) await new Promise(r => setTimeout(r, 400))
        const part = parts[i]
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', type: part.type, title: part.title, content: part.content, createdAt: new Date() }
        ])
      }
    } catch {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Something went wrong. Let's talk tomorrow.", createdAt: new Date() }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleChatSend(text) {
    const userMsg = { role: 'user', content: text, createdAt: new Date() }
    const newMsgs = [...chatMessages, userMsg]
    setChatMessages(newMsgs)
    sendMissedDayMessage(newMsgs)
  }

  function extractRedesign(text) {
    // Handle reply that is purely JSON
    try {
      const parsed = JSON.parse(text.trim())
      if ('redesign' in parsed) return { data: parsed, preamble: '' }
    } catch { /* empty */ }
    // Handle reply where JSON is appended after text
    const match = text.match(/([\s\S]*?)(\{[\s\S]*?"redesign"[\s\S]*?\})\s*$/)
    if (match) {
      try {
        const parsed = JSON.parse(match[2])
        if ('redesign' in parsed) return { data: parsed, preamble: match[1].trim() }
      } catch { /* empty */ }
    }
    return null
  }

  async function handleRedesignResponse(data) {
    if (data.redesign && habit) {
      const updatedFields = {}
      if (data.new_action)     updatedFields.action = data.new_action
      if (data.new_time)       updatedFields.time = data.new_time
      if (data.new_location)   updatedFields.location = data.new_location
      if (data.new_two_minute) updatedFields.two_minute = data.new_two_minute

      if (Object.keys(updatedFields).length > 0) {
        const firstUserMsg = chatMessages.find(m => m.role === 'user')
        await api.put(`/habits/${habit.id}`, updatedFields)
        await api.post('/redesigns', {
          habit_id: habit.id,
          trigger_reason: firstUserMsg?.content || '',
          old_action: habit.action,
          new_action: data.new_action || habit.action,
          new_time: data.new_time || habit.time,
          new_location: data.new_location || habit.location,
          new_two_minute: data.new_two_minute || habit.two_minute,
        })
      }
    }
    setPhase('done')
    setTimeout(() => navigate('/home'), 1800)
  }

  if (!habit) return null
  if (alreadyCheckedIn && phase === 'question') {
    navigate('/home')
    return null
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/home')}>← back</button>

      {phase === 'question' && (
        <div className={styles.questionPhase}>
          <p className="text-label" style={{ marginBottom: 24 }}>today's check-in</p>
          <p className={styles.habitQuestion}>did you {habit.action}?</p>
          <p className={`${styles.habitMeta} text-meta`}>
            {habit.time} · {habit.location}
          </p>
          <div className={styles.buttons}>
            <button className="btn-primary" onClick={handleYes}>yes</button>
            <button className="btn-ghost" onClick={handleNotToday}>not today</button>
          </div>
        </div>
      )}

      {phase === 'chat' && (
        <div className={styles.chatPhase}>
          <p className="text-label" style={{ marginBottom: 16 }}>missed-day check-in</p>
          <Chat
            messages={chatMessages}
            isLoading={isLoading}
            onSend={handleChatSend}
            placeholder="tell the coach..."
          />
        </div>
      )}

      {phase === 'done' && (
        <div className={styles.donePhase}>
          <p className={styles.doneText}>got it.</p>
          <p className="text-meta">see you tomorrow.</p>
        </div>
      )}
    </div>
  )
}
