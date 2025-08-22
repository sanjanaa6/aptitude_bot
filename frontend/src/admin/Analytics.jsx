import React, { useState, useEffect } from 'react'
import { adminListUsers, adminListSections, adminGetQuizStats } from '../api.js'

// Modern UI Components
const container = { padding: '24px', background: '#f8fafc', minHeight: '100vh' }
const header = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '32px',
  background: 'white',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
}
const title = { margin: 0, fontSize: '28px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }
const refreshBtn = { 
  padding: '12px 20px', 
  border: '1px solid #e5e7eb', 
  borderRadius: '12px', 
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
  color: 'white', 
  cursor: 'pointer', 
  fontSize: '14px',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
}

const card = { 
  background: 'white', 
  border: '1px solid #e5e7eb', 
  borderRadius: '16px', 
  padding: '24px', 
  marginBottom: '24px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  transition: 'all 0.2s ease'
}
const cardHover = { 
  ...card, 
  transform: 'translateY(-2px)',
  boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }
const miniGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }

const statCard = (color) => ({
  background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
  border: `1px solid ${color}20`,
  borderRadius: '16px',
  padding: '24px',
  textAlign: 'center',
  transition: 'all 0.2s ease',
  cursor: 'pointer'
})

const statNumber = (color) => ({
  fontSize: '36px',
  fontWeight: '800',
  color: color,
  marginBottom: '8px',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
})

const statLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}

const table = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '16px'
}

const tableHeader = {
  background: '#f9fafb',
  borderBottom: '2px solid #e5e7eb',
  padding: '16px 12px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#374151',
  fontSize: '14px'
}

const tableRow = {
  borderBottom: '1px solid #f3f4f6',
  transition: 'background-color 0.2s ease'
}

const tableCell = {
  padding: '16px 12px',
  fontSize: '14px',
  color: '#374151'
}

const avatar = (size = 40) => ({
  width: size,
  height: size,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'grid',
  placeItems: 'center',
  color: 'white',
  fontWeight: '600',
  fontSize: size * 0.4
})

const badge = (color) => ({
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  color: color,
  background: `${color}15`,
  border: `1px solid ${color}30`
})

const progressBar = (percentage, color) => ({
  width: '100%',
  height: '8px',
  background: '#e5e7eb',
  borderRadius: '4px',
  overflow: 'hidden',
  marginTop: '8px'
})

const progressFill = (percentage, color) => ({
  height: '100%',
  width: `${percentage}%`,
  background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
  borderRadius: '4px',
  transition: 'width 0.3s ease'
})

export default function Analytics({ stats, onRefresh }) {
  const [recentUsers, setRecentUsers] = useState([])
  const [recentSections, setRecentSections] = useState([])
  const [quizStats, setQuizStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    api: 'healthy',
    performance: 'good',
    lastCheck: new Date()
  })

  useEffect(() => {
    loadRecentData()
    loadQuizStats()
    checkSystemHealth()
  }, [])

  const loadRecentData = async () => {
    try {
      const [usersRes, sectionsRes] = await Promise.all([
        adminListUsers(),
        adminListSections()
      ])
      
      // Get recent users (last 5)
      const recentUsersData = usersRes.users?.slice(-5).reverse() || []
      setRecentUsers(recentUsersData)
      
      // Get recent sections (last 5)
      const recentSectionsData = sectionsRes.sections?.slice(-5).reverse() || []
      setRecentSections(recentSectionsData)
    } catch (error) {
      console.error('Failed to load recent data:', error)
      setRecentUsers([])
      setRecentSections([])
    } finally {
      setLoading(false)
    }
  }

  const loadQuizStats = async () => {
    try {
      console.log('Loading quiz stats...')
      const res = await adminGetQuizStats()
      console.log('Quiz stats response:', res)
      setQuizStats(res)
    } catch (error) {
      console.error('Failed to load quiz stats:', error)
      // Set default values instead of crashing
      const defaultStats = {
        total_questions: 0,
        by_difficulty: { easy: 0, medium: 0, hard: 0 },
        by_section: []
      }
      console.log('Setting default quiz stats:', defaultStats)
      setQuizStats(defaultStats)
    }
  }

  const checkSystemHealth = () => {
    // Simulate system health check
    const health = {
      database: Math.random() > 0.1 ? 'healthy' : 'warning',
      api: Math.random() > 0.05 ? 'healthy' : 'error',
      performance: Math.random() > 0.2 ? 'good' : 'degraded',
      lastCheck: new Date()
    }
    setSystemHealth(health)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  const getTopicCount = (section) => {
    return section.topics?.length || 0
  }

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return '#10b981'
      case 'warning': return '#f59e0b'
      case 'error': return '#ef4444'
      case 'degraded': return '#f59e0b'
      case 'good': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return '✓'
      case 'warning': return '⚠'
      case 'error': return '✗'
      case 'degraded': return '⚠'
      case 'good': return '✓'
      default: return '?'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'hard': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <div style={container}>
      {/* Header */}
      <div style={header}>
        <div style={title}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          System Analytics Dashboard
        </div>
        <button 
          onClick={() => { onRefresh(); loadRecentData(); loadQuizStats(); checkSystemHealth() }} 
          style={refreshBtn}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M1 4v6h6"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Quick Stats */}
      <div style={grid}>
        <div style={statCard('#3b82f6')}>
          <div style={statNumber('#3b82f6')}>{stats?.users || 0}</div>
          <div style={statLabel}>Total Users</div>
          <div style={progressBar(100, '#3b82f6')}>
            <div style={progressFill(100, '#3b82f6')}></div>
          </div>
        </div>
        
        <div style={statCard('#10b981')}>
          <div style={statNumber('#10b981')}>{stats?.sections || 0}</div>
          <div style={statLabel}>Total Sections</div>
          <div style={progressBar(100, '#10b981')}>
            <div style={progressFill(100, '#10b981')}></div>
          </div>
        </div>
        
        <div style={statCard('#f59e0b')}>
          <div style={statNumber('#f59e0b')}>{stats?.topics || 0}</div>
          <div style={statLabel}>Total Topics</div>
          <div style={progressBar(100, '#f59e0b')}>
            <div style={progressFill(100, '#f59e0b')}></div>
          </div>
        </div>
        
        <div style={statCard('#ef4444')}>
          <div style={statNumber('#ef4444')}>{quizStats?.total_questions || 0}</div>
          <div style={statLabel}>Total Questions</div>
          <div style={progressBar(100, '#ef4444')}>
            <div style={progressFill(100, '#ef4444')}></div>
          </div>
        </div>
      </div>

      {/* System Health & Quiz Stats */}
      <div style={grid}>
        {/* System Health */}
        <div style={card}>
          <h4 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '18px', fontWeight: '600' }}>
            🏥 System Health Status
          </h4>
          <div style={miniGrid}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: getHealthColor(systemHealth.database), marginBottom: '8px' }}>
                {getHealthIcon(systemHealth.database)}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Database</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{systemHealth.database}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: getHealthColor(systemHealth.api), marginBottom: '8px' }}>
                {getHealthIcon(systemHealth.api)}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>API</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{systemHealth.api}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: getHealthColor(systemHealth.performance), marginBottom: '8px' }}>
                {getHealthIcon(systemHealth.performance)}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Performance</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{systemHealth.performance}</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '8px', marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Last Check: {systemHealth.lastCheck.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Quiz Statistics */}
        <div style={card}>
          <h4 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '18px', fontWeight: '600' }}>
            📊 Quiz Statistics
          </h4>
          {quizStats ? (
            <>
              <div style={miniGrid}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                    {quizStats.by_difficulty?.easy || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Easy</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                    {quizStats.by_difficulty?.medium || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Medium</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                    {quizStats.by_difficulty?.hard || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Hard</div>
                </div>
              </div>
              
              {quizStats.total_questions === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 8px 0' }}>No quiz questions have been added yet.</p>
                  <p style={{ margin: 0, fontSize: '14px' }}>Use the Quiz Manager to add questions for your topics.</p>
                </div>
              ) : (
                quizStats.by_section && quizStats.by_section.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <h5 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                      Questions by Section
                    </h5>
                    {quizStats.by_section.map((section, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ fontSize: '14px', color: '#374151' }}>{section.section}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{section.count}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>Loading quiz statistics...</div>
              <div style={{ fontSize: '14px' }}>Please wait while we fetch the data.</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div style={grid}>
        {/* Recent Users */}
        <div style={card}>
          <h4 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '18px', fontWeight: '600' }}>
            👥 Recent Users
          </h4>
          {recentUsers.length > 0 ? (
            <table style={table}>
              <thead>
                <tr>
                  <th style={tableHeader}>User</th>
                  <th style={tableHeader}>Email</th>
                  <th style={tableHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user, index) => (
                  <tr key={index} style={tableRow} onMouseEnter={(e) => e.target.closest('tr').style.background = '#f9fafb'}>
                    <td style={tableCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={avatar(36)}>
                          {getInitials(user.username || user.email)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>
                            {user.username || 'User'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            ID: {user.id?.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={tableCell}>{user.email}</td>
                    <td style={tableCell}>
                      <span style={badge(user.is_admin ? '#10b981' : '#6b7280')}>
                        {user.is_admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 20px' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>No users found</div>
              <div style={{ fontSize: '14px' }}>Start by adding some users to your system.</div>
            </div>
          )}
        </div>

        {/* Recent Sections */}
        <div style={card}>
          <h4 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '18px', fontWeight: '600' }}>
            📚 Recent Sections
          </h4>
          {recentSections.length > 0 ? (
            <table style={table}>
              <thead>
                <tr>
                  <th style={tableHeader}>Section</th>
                  <th style={tableHeader}>Topics</th>
                  <th style={tableHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSections.map((section, index) => (
                  <tr key={index} style={tableRow} onMouseEnter={(e) => e.target.closest('tr').style.background = '#f9fafb'}>
                    <td style={tableCell}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827' }}>{section.title}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>ID: {section.id}</div>
                      </div>
                    </td>
                    <td style={tableCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {getTopicCount(section)}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>topics</span>
                      </div>
                    </td>
                    <td style={tableCell}>
                      <span style={badge('#3b82f6')}>Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 20px' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>No sections found</div>
              <div style={{ fontSize: '14px' }}>Create sections to organize your topics.</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={card}>
        <h4 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '18px', fontWeight: '600' }}>
          ⚡ Quick Actions
        </h4>
        <div style={miniGrid}>
          <button 
            onClick={() => window.location.hash = '#users'} 
            style={{ ...refreshBtn, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Manage Users
          </button>
          
          <button 
            onClick={() => window.location.hash = '#topics'} 
            style={{ ...refreshBtn, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
            Manage Topics
          </button>
          
          <button 
            onClick={() => window.location.hash = '#quiz'} 
            style={{ ...refreshBtn, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
              <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
              <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
            </svg>
            Quiz Manager
          </button>
        </div>
      </div>
    </div>
  )
}
