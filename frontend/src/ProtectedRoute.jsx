import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('qc_token')
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

export function AdminRoute({ children }) {
  const token = localStorage.getItem('qc_token')
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''))
    if (!payload?.is_admin) {
      return <Navigate to="/dashboard" replace />
    }
  } catch (_) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}


