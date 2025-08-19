import React from 'react'
import LoginForm from '../components/LoginForm.jsx'

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f9fafb' }}>
      <div style={{ width: 460 }}>
        <LoginForm onSuccess={() => { window.location.href = '/' }} />
      </div>
    </div>
  )
}


