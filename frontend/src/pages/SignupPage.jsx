import React from 'react'
import LoginForm from '../components/LoginForm.jsx'

export default function SignupPage() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#3b82f6',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            Create account
          </h1>
          <p style={{
            color: '#64748b',
            margin: 0,
            fontSize: '16px'
          }}>
            Sign up to get started
          </p>
        </div>

        {/* Form */}
        <LoginForm initialMode="register" onSuccess={() => { window.location.href = '/dashboard' }} />

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{
            color: '#64748b',
            margin: 0,
            fontSize: '14px'
          }}>
            Already have an account?{' '}
            <a href="/login" style={{
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}


