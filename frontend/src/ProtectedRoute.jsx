import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { me } from './api.js'

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
  const [isAdmin, setIsAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!token) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const userInfo = await me()
        setIsAdmin(!!userInfo?.user?.is_admin)
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [token])

  if (loading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '16px',
      color: '#64748b'
    }}>Loading...</div>
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}


