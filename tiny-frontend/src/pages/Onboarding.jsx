import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Chat from '../components/Chat'
import { useUserId } from '../hooks/useUserId'
import { useHabit } from '../hooks/useHabit'
import api from '../api/client'
import { parseAIResponse } from '../utils/parseAIResponse'
import IntentionText from '../components/IntentionText'
import styles from './Onboarding.module.css'

export default function Onboarding() {
  const userId = useUserId()
  const navigate = useNavigate()
  const { habit, loading: habitLoading } = useHabit(userId)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingHabit, setPendingHabit] = useState(null) // waiting for user confirmation
  const initialized = useRef(false)

  // Fix 1: if user already has a habit, send them to /home
  useEffect(() => {
    if (!habitLoading && habit) {
      navigate('/home')
    }
  }, [habit, habitLoading, navigate])

  // Start conversation once we know there's no existing habit
  useEffect(() => {
    if (!userId || habitLoading || habit || initialized.current) return
    initialized.current = true
    sendToAI([])
  }, [userId, habitLoading, habit])

  async function sendToAI(msgs) {
    setIsLoading(true)
    try {
      const res = await api.post('/ai/chat', {
        system_prompt_key: 'onboarding',
        messages: msgs.map(({ role, content }) => ({ role, content })),
        context: {},
      })
      const reply = res.data.reply

      const doneData = extractDoneJSON(reply)
      if (doneData) {
        // Fix 2: don't save yet — show a confirmation card first
        setPendingHabit(doneData)
        return
      }

      // Split reply into parts (multi-bubble + concept cards), stagger each one in
      const parts = parseAIResponse(reply)
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) await new Promise(resolve => setTimeout(resolve, 400))
        const part = parts[i]
        setMessages(prev => [
          ...prev,
          { role: 'assistant', type: part.type, title: part.title, content: part.content, createdAt: new Date() }
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Try again.', createdAt: new Date() }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleSend(text) {
    const userMessage = { role: 'user', content: text, createdAt: new Date() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    sendToAI(newMessages)
  }

  async function handleConfirm() {
    if (!pendingHabit || !userId) return
    // Save name and habit in parallel
    await Promise.all([
      pendingHabit.user_name
        ? api.put(`/users/${userId}/name`, { name: pendingHabit.user_name })
        : Promise.resolve(),
      api.post('/habits', {
        user_id: userId,
        action: pendingHabit.action,
        time: pendingHabit.time,
        location: pendingHabit.location,
        two_minute: pendingHabit.two_minute,
        why: pendingHabit.why,
        habit_stack: pendingHabit.habit_stack || null,
      }),
    ])
    navigate('/home')
  }

  function handleEdit() {
    // Let the user keep talking — dismiss the card and continue chat
    setPendingHabit(null)
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: "No problem — what would you like to change?", createdAt: new Date() }
    ])
  }








  function formatIntention(action, time, location) {
    const timePreps = ['when ', 'after ', 'before ', 'as ', 'while ', 'during ', 'every ']
    const locPreps  = ['in ', 'at ', 'on ', 'next to ', 'in front of ', 'by ', 'near ', 'outside ', 'inside ', 'beside ']
    const t = time.toLowerCase()
    const l = location.toLowerCase()
    const a = action.toLowerCase()

    // If the action already contains the time or location, omit the duplicate
    const includesTime = a.includes(t)
    const includesLoc  = a.includes(l)

    const timePart = includesTime ? '' : (timePreps.some(p => t.startsWith(p)) ? time : `at ${time}`)
    const locPart  = includesLoc  ? '' : (locPreps.some(p => l.startsWith(p))  ? location : `in ${location}`)

    return `I will ${action}${timePart ? ` ${timePart}` : ''}${locPart ? ` ${locPart}` : ''}.`
  }

  function extractDoneJSON(text) {
    // Extract JSON even if the AI wrapped it in conversational text
    const match = text.match(/\{[^{}]+\}/)
    if (!match) return null
    try {
      const parsed = JSON.parse(match[0])
      return parsed.done === true ? parsed : null
    } catch { return null }
  }

  if (habitLoading) return null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>tiny</h1>
        <p className={styles.tagline}>one habit, done right.</p>
      </header>

      <div className={styles.chatArea}>
        {pendingHabit ? (
          <div>
            <p className={styles.confirmExplainer}>
              An implementation intention is a specific promise to yourself: exactly what you'll do, when, and where. Research shows that naming the time and place is what makes habits stick.
            </p>
            <div className={styles.confirmCard}>
              <p className={styles.confirmLabel}>
                {pendingHabit.user_name ? `${pendingHabit.user_name}'s ` : ''}intention
              </p>
              <p className={styles.confirmIntention}>
                <IntentionText action={pendingHabit.action} time={pendingHabit.time} location={pendingHabit.location} />
              </p>
              <div className={styles.confirmDivider} />
              <p className={styles.confirmMeta}>two-minute version: {pendingHabit.two_minute}</p>
              {pendingHabit.why && (
                <p className={styles.confirmMeta}>why: {pendingHabit.why}</p>
              )}
            </div>
            <p className={styles.confirmQuestion}>does this sound right?</p>
            <div className={styles.confirmButtons}>
              <button className="btn-primary" onClick={handleConfirm}>
                yes, that's it
              </button>
              <button className="btn-ghost" onClick={handleEdit}>
                not quite
              </button>
            </div>
          </div>
        ) : (
          <Chat
            messages={messages}
            isLoading={isLoading}
            onSend={handleSend}
            placeholder="tell the coach..."
          />
        )}
      </div>
    </div>
  )
}
