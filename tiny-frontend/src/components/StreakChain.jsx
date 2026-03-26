import { useState } from 'react'
import styles from './StreakChain.module.css'

function formatMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function sameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export default function StreakChain({ checkins, habitCreatedAt, newlyCompleted }) {
  const today = new Date()
  const todayStr = today.toLocaleDateString('en-CA')
  const habitStart = new Date(habitCreatedAt)

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const canGoPrev = !sameMonth(viewDate, habitStart)
  const canGoNext = !sameMonth(viewDate, today)

  function prevMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function nextMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  const checkinMap = {}
  checkins.forEach(c => {
    checkinMap[c.date] = c.completed === 1 ? 'done' : 'missed'
  })

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dots = []
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    let state
    if (dateStr > todayStr) {
      state = 'future'
    } else if (dateStr === todayStr && !checkinMap[dateStr]) {
      state = 'today'
    } else {
      state = checkinMap[dateStr] || 'missed'
    }
    dots.push({ date: dateStr, day, state })
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.monthNav}>
        <button className={styles.navBtn} onClick={prevMonth} disabled={!canGoPrev} aria-label="Previous month">←</button>
        <span className={styles.monthLabel}>{formatMonthYear(viewDate)}</span>
        <button className={styles.navBtn} onClick={nextMonth} disabled={!canGoNext} aria-label="Next month">→</button>
      </div>
      <div className={styles.grid}>
        {dots.map(({ date, state, day }) => (
          <div
            key={date}
            className={`${styles.dot} ${styles[state]} ${date === newlyCompleted ? styles.animate : ''}`}
            title={`${viewDate.toLocaleDateString('en-US', { month: 'short' })} ${day} — ${state}`}
          />
        ))}
      </div>
    </div>
  )
}
