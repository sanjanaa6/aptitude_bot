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
      background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1a202c',
            margin: '0 0 8px 0'
          }}>
            Create account
          </h1>
          <p style={{
            color: '#718096',
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
            color: '#718096',
            margin: 0,
            fontSize: '14px'
          }}>
            Already have an account?{' '}
            <a href="/login" style={{
              color: '#8e44ad',
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


