import React, { useState } from 'react'
import { login, register } from '../api.js'

export default function LoginForm({ onSuccess, initialMode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState(initialMode || 'login')
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        await register({ email, password, username, name })
      }
      const res = await login(email, password)
      localStorage.setItem('qc_token', res.access_token)
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Auth failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <form onSubmit={submit} style={{ background: 'white', padding: 24, borderRadius: 16, width: 420, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
        <h3 style={{ marginTop: 0 }}>{mode === 'login' ? 'Login' : 'Register'}</h3>
        {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'register' && (
            <>
              <input type="text" required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
                     style={{ padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
              <input type="text" placeholder="Full name (optional)" value={name} onChange={(e) => setName(e.target.value)}
                     style={{ padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
            </>
          )}
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                 style={{ padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                 style={{ padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10 }} />
          <button type="submit" disabled={loading} style={{ background: '#111827', color: 'white', border: 'none', borderRadius: 10, padding: '12px 14px' }}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create account & Login')}
          </button>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {mode === 'login' ? (
            <span>
              No account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('register') }}>Register</a>
            </span>
          ) : (
            <span>
              Have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login') }}>Login</a>
            </span>
          )}
          <span style={{ color: '#6b7280' }}>Tip: Use a strong password</span>
        </div>
      </form>
    </div>
  )
}


