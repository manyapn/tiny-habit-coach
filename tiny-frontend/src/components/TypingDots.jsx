/*
  TypingDots — three-dot "AI is thinking" animation
*/

import styles from './TypingDots.module.css'

export default function TypingDots() {
  return (
    <div className={styles.container}>
      <span className={styles.dot} />
      <span className={`${styles.dot} ${styles.dot2}`} />
      <span className={`${styles.dot} ${styles.dot3}`} />
    </div>
  )
}
