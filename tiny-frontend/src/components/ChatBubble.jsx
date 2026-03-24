import styles from './ChatBubble.module.css'

export default function ChatBubble({ role, content, type, title, createdAt }) {
  // Concept card: rendered outside the bubble flow as an info aside
  if (type === 'concept') {
    return (
      <div className={styles.conceptCard}>
        <span className={styles.conceptLabel}>{title}</span>
        <p className={styles.conceptBody}>{content}</p>
      </div>
    )
  }

  // Regular chat bubble
  const isAI = role === 'assistant'
  const time = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className={`${styles.row} ${isAI ? styles.rowAI : styles.rowUser}`}>
      <div className={`${styles.bubble} ${isAI ? styles.bubbleAI : styles.bubbleUser}`}>
        <p className={styles.text}>{content}</p>
        {time && <span className={styles.time}>{time}</span>}
      </div>
    </div>
  )
}
