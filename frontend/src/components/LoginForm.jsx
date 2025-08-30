import React, { useState } from 'react'
import { login, register } from '../api.js'
import { useTheme } from '../contexts/ThemeContext.jsx'

export default function LoginForm({ onSuccess, initialMode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState(initialMode || 'login')
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { colors } = useTheme()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (mode === 'register') {
        await register({ email, password, username, name })
      }
      const res = await login({ email, password })
      localStorage.setItem('qc_token', res.access_token)
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    setEmail('')
    setPassword('')
    setUsername('')
    setName('')
  }

  return (
    <div>
      {/* Mode Toggle */}
      <div style={{
        display: 'flex',
        background: colors.hover,
        borderRadius: '8px',
        padding: '4px',
        marginBottom: '24px'
      }}>
        <button
          type="button"
          onClick={() => setMode('login')}
          style={{
            flex: 1,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: mode === 'login' ? colors.surface : 'transparent',
            color: mode === 'login' ? colors.text : colors.textSecondary,
            fontWeight: mode === 'login' ? '500' : '400',
            cursor: 'pointer',
            boxShadow: mode === 'login' ? `0 1px 3px ${colors.shadow}` : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          style={{
            flex: 1,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: mode === 'register' ? colors.surface : 'transparent',
            color: mode === 'register' ? colors.text : colors.textSecondary,
            fontWeight: mode === 'register' ? '500' : '400',
            cursor: 'pointer',
            boxShadow: mode === 'register' ? `0 1px 3px ${colors.shadow}` : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          Sign Up
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: `${colors.error}20`,
          border: `1px solid ${colors.error}40`,
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '20px',
          color: colors.error,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={submit}>
        {mode === 'register' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text
              }}>
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  background: colors.surface,
                  color: colors.text
                }}
                                 placeholder="Enter username"
                 onFocus={(e) => e.target.style.borderColor = colors.primary}
                 onBlur={(e) => e.target.style.borderColor = colors.border}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text
              }}>
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  background: colors.surface,
                  color: colors.text
                }}
                                 placeholder="Enter full name"
                 onFocus={(e) => e.target.style.borderColor = colors.primary}
                 onBlur={(e) => e.target.style.borderColor = colors.border}
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.text
          }}>
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '16px',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box',
              background: colors.surface,
              color: colors.text
            }}
                         placeholder="Enter your email"
             onFocus={(e) => e.target.style.borderColor = colors.primary}
             onBlur={(e) => e.target.style.borderColor = colors.border}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: colors.text
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                paddingRight: '48px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                fontSize: '16px',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box',
                background: colors.surface,
                color: colors.text
              }}
                             placeholder="Enter your password"
               onFocus={(e) => e.target.style.borderColor = colors.primary}
               onBlur={(e) => e.target.style.borderColor = colors.border}
            />
                          <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.textSecondary,
                  padding: '4px'
                }}
              >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
                         background: loading ? colors.textSecondary : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
              }}></div>
              {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
            </>
          ) : (
            mode === 'login' ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}


