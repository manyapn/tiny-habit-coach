/*
  Chat — reusable chat UI shell

  WHAT THIS COMPONENT DOES:
    - Renders a scrollable list of ChatBubble components
    - Shows TypingDots when isLoading is true
    - Renders the input + send button at the bottom
    - Calls onSend(text) when the user submits
*/

import { useRef, useEffect } from 'react'
import ChatBubble from './ChatBubble'
import TypingDots from './TypingDots'
import styles from './Chat.module.css'

export default function Chat({ messages, isLoading, onSend, placeholder = 'Type a message...' }) {
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const text = inputRef.current?.value?.trim()
    if (!text) return
    inputRef.current.value = ''
    onSend(text)
  }

  return (
    <div className={styles.shell}>
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            role={msg.role}
            type={msg.type}
            title={msg.title}
            content={msg.content}
            createdAt={msg.createdAt}
          />
        ))}
        {isLoading && <TypingDots />}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputRow}>
        <textarea
          ref={inputRef}
          rows={1}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className={styles.input}
        />
        <button onClick={submit} className={`btn-primary ${styles.sendBtn}`}>
          send
        </button>
      </div>
    </div>
  )
}
