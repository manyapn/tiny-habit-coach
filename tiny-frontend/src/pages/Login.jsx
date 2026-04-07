import { useState } from 'react'
import { supabase } from '../api/supabase'
import styles from './Onboarding.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>tiny</h1>
        <p className={styles.tagline}>one habit, done right.</p>
      </header>

      <div className={styles.chatArea}>
        {sent ? (
          <div>
            <p style={{ fontFamily: 'Lora, serif', fontSize: 15, lineHeight: 1.7, color: 'var(--c-ink)', marginBottom: 8 }}>
              check your email — we sent you a magic link to sign in.
            </p>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--c-muted)' }}>
              sent to {email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontFamily: 'Lora, serif', fontSize: 15, lineHeight: 1.7, color: 'var(--c-ink)', marginBottom: 4 }}>
              enter your email to get started.
            </p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                fontFamily: 'Lora, serif',
                fontSize: 15,
                padding: '10px 12px',
                border: '1px solid var(--c-dust)',
                borderRadius: 6,
                background: 'transparent',
                color: 'var(--c-ink)',
                outline: 'none',
              }}
            />
            {error && (
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#c0392b' }}>{error}</p>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'sending...' : 'continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
