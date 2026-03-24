/*
  IntentionCard — displays the user's Implementation Intention
*/

import IntentionText from './IntentionText'
import styles from './IntentionCard.module.css'

export default function IntentionCard({ habit }) {
  if (!habit) return null

  return (
    <div className={styles.card}>
      <span className={styles.label}>your intention</span>
      <p className={styles.intention}>
        <IntentionText action={habit.action} time={habit.time} location={habit.location} />
      </p>

      <div className={styles.divider} />

      <p className={styles.twoMinute}>
        two-minute version: {habit.two_minute}
      </p>

      {habit.habit_stack && (
        <p className={styles.stack}>
          after: {habit.habit_stack}
        </p>
      )}
    </div>
  )
}
