/*
  IntentionTextL renders an implementation intention as a template sentence.
*/

import styles from './IntentionText.module.css'

export default function IntentionText({ action, time, location }) {
  return (
    <span className={styles.sentence}>
      I will{' '}
      <span className={styles.slot}>{action}</span>
      {' '}
      <span className={styles.slot}>{time}</span>
      {' '}
      <span className={styles.slot}>{location}</span>.
    </span>
  )
}
