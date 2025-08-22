import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import AdminDashboard from './admin/Dashboard.jsx'
import UserDashboard from './user/Dashboard.jsx'
import ProtectedRoute, { AdminRoute } from './ProtectedRoute.jsx'

const pageStyle = {
  minHeight: '100vh',
  background: '#f7fafc',
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  display: 'flex',
  flexDirection: 'column',
}

const headerStyle = {
  background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
  padding: '16px',
  color: 'white',
}

const headerInnerStyle = {
  width: '100%',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

const contentWrapStyle = {
  width: '100vw',
  margin: 0,
  padding: 0,
  display: 'grid',
  gridTemplateColumns: '360px 1fr',
  gap: 0,
  flex: 1,
}

const statPill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 999,
  padding: '6px 10px',
  fontSize: 12,
}

const cardStyle = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 0,
  padding: 16,
}

const sectionScrollStyle = { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }

const twoColMainStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
}

// UserDashboard moved to ./user/Dashboard.jsx

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}