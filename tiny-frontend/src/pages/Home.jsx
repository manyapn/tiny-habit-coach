/*
  Home.jsx: daily hub: streak, intention card, check-in button

  WHAT THIS PAGE DOES:
    1. Load the user's habit (via useHabit hook)
    2. Load check-ins + streak (via useCheckins hook)
    3. Display: logo, streak count, StreakChain grid, IntentionCard
    4. "Check In" button → navigate to /checkin
    5. "Weekly Review" button (visible after 7+ days) → navigate to /weekly

  REDIRECTS:
    - If no habit exists (404 from backend): redirect to / (onboarding)
    - If already checked in today: show "done for today" state
*/

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserId } from '../hooks/useUserId'
import { useHabit } from '../hooks/useHabit'
import { useCheckins } from '../hooks/useCheckins'
import IntentionCard from '../components/IntentionCard'
import StreakChain from '../components/StreakChain'
import api from '../api/client'
import styles from './Home.module.css'

const USER_ID_KEY = 'tiny_user_id'

export default function Home() {
  const userId = useUserId()
  const navigate = useNavigate()
  const { habit, loading: habitLoading } = useHabit(userId)
  const { checkins, streak, loading: checkinsLoading } = useCheckins(userId)
  const [stats, setStats] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  // Redirect to onboarding if no habit
  useEffect(() => {
    if (!habitLoading && !habit) {
      navigate('/')
    }
  }, [habit, habitLoading, navigate])

  // Fetch stats
  useEffect(() => {
    if (!userId) return
    api.get(`/stats/${userId}`).then(res => setStats(res.data)).catch(() => {})
  }, [userId])

  async function handleReset() {
    if (!userId) return
    await api.delete(`/users/${userId}/reset`).catch(() => {})
    localStorage.removeItem(USER_ID_KEY)
    navigate('/')
  }

  const today = new Date().toLocaleDateString('en-CA')
  const checkedInToday = checkins.some(c => c.date === today && c.completed === 1)
  const canSeeWeekly = stats?.days_since_start >= 7

  if (habitLoading || checkinsLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <span className="text-meta">loading...</span>
        </div>
      </div>
    )
  }

  if (!habit) return null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>tiny</h1>
        <p className="text-label">one habit, done right.</p>
      </header>

      <section className={styles.streakSection}>
        <div className={styles.streakRow}>
          <span className={styles.streakNumber}>{streak}</span>
          <span className="text-label" style={{ marginLeft: 8 }}>day streak</span>
        </div>

        {stats && (
          <p className={`${styles.statsLine} text-meta`}>
            {(stats.completion_rate * 100).toFixed(0)}% this month
            {' · '}day {stats.days_since_start}
          </p>
        )}

        <StreakChain
          checkins={checkins}
          habitCreatedAt={habit.created_at}
          newlyCompleted={null}
        />
      </section>

      <IntentionCard habit={habit} />

      <div className={styles.actions}>
        {checkedInToday ? (
          <p className={`${styles.doneMsg} text-meta`}>
            done for today. see you tomorrow.
          </p>
        ) : (
          <button
            className="btn-primary"
            onClick={() => navigate('/checkin')}
          >
            check in
          </button>
        )}

        {canSeeWeekly && (
          <button
            className={`btn-ghost ${styles.weeklyBtn}`}
            onClick={() => navigate('/weekly')}
          >
            weekly review
          </button>
        )}

        {confirmReset ? (
          <div className={styles.resetConfirm}>
            <p className={styles.resetWarning}>
              this will delete your habit, all check-ins, and your entire streak. there is no undo.
            </p>
            <div className={styles.resetButtons}>
              <button className="btn-primary" onClick={handleReset}>
                yes, start over
              </button>
              <button className="btn-ghost" onClick={() => setConfirmReset(false)}>
                cancel
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.resetLink} onClick={() => setConfirmReset(true)}>
            start over
          </button>
        )}
      </div>
    </div>
  )
}
