import React, { useState, useEffect } from 'react'
import {
  seedDefaultBadges,
  getAllBadges,
  getLeaderboard
} from '../api.js'

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
  fontFamily: 'Inter, system-ui, sans-serif'
}

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px',
  color: '#1f2937'
}

const buttonStyle = {
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: '500',
  marginBottom: '20px',
  transition: 'background-color 0.2s ease'
}

const buttonStyleSecondary = {
  ...buttonStyle,
  background: '#6b7280',
  marginLeft: '12px'
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  background: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb'
}

const thStyle = {
  background: '#f9fafb',
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#374151',
  borderBottom: '1px solid #e5e7eb'
}

const tdStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid #e5e7eb',
  color: '#1f2937'
}

const badgeIconStyle = {
  fontSize: '1.5rem',
  marginRight: '8px'
}

const rarityStyle = (rarity) => {
  const colors = {
    common: '#6b7280',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b'
  }
  
  return {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: colors[rarity] || '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '4px 8px',
    background: `${colors[rarity]}20`,
    borderRadius: '4px'
  }
}

const loadingStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#6b7280'
}

const errorStyle = {
  textAlign: 'center',
  padding: '20px',
  color: '#ef4444',
  background: '#fef2f2',
  borderRadius: '8px',
  border: '1px solid #fecaca',
  marginBottom: '20px'
}

const successStyle = {
  textAlign: 'center',
  padding: '20px',
  color: '#059669',
  background: '#f0fdf4',
  borderRadius: '8px',
  border: '1px solid #bbf7d0',
  marginBottom: '20px'
}

export default function GamificationManager() {
  const [badges, setBadges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadGamificationData()
  }, [])

  const loadGamificationData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [badgesRes, leaderboardRes] = await Promise.all([
        getAllBadges(),
        getLeaderboard(20)
      ])
      
      setBadges(badgesRes.badges || [])
      setLeaderboard(leaderboardRes.leaderboard || [])
    } catch (err) {
      console.error('Failed to load gamification data:', err)
      setError('Failed to load gamification data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSeedBadges = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      
      const result = await seedDefaultBadges()
      setSuccess(`Successfully seeded ${result.count} default badges!`)
      
      // Reload badges
      const badgesRes = await getAllBadges()
      setBadges(badgesRes.badges || [])
    } catch (err) {
      console.error('Failed to seed badges:', err)
      setError('Failed to seed default badges. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  if (loading && badges.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <p>Loading gamification data...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>🎮 Gamification Manager</h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '1.125rem', color: '#6b7280' }}>
          Manage badges, view leaderboards, and monitor user engagement
        </p>
      </div>

      {error && (
        <div style={errorStyle}>
          <p>{error}</p>
          <button onClick={clearMessages} style={buttonStyleSecondary}>
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div style={successStyle}>
          <p>{success}</p>
          <button onClick={clearMessages} style={buttonStyleSecondary}>
            Dismiss
          </button>
        </div>
      )}

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Badge Management</h2>
        <button 
          onClick={handleSeedBadges}
          disabled={loading}
          style={{
            ...buttonStyle,
            background: loading ? '#9ca3af' : '#3b82f6'
          }}
        >
          {loading ? 'Seeding...' : 'Seed Default Badges'}
        </button>
        
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '16px', color: '#374151' }}>
            Available Badges ({badges.length})
          </h3>
          
          {badges.length > 0 ? (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Badge</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Rarity</th>
                  <th style={thStyle}>Points</th>
                </tr>
              </thead>
              <tbody>
                {badges.map((badge) => (
                  <tr key={badge.id}>
                    <td style={tdStyle}>
                      <span style={badgeIconStyle}>{badge.icon}</span>
                    </td>
                    <td style={tdStyle}>
                      <strong>{badge.name}</strong>
                    </td>
                    <td style={tdStyle}>{badge.description}</td>
                    <td style={tdStyle}>
                      <span style={{
                        textTransform: 'capitalize',
                        color: '#6b7280'
                      }}>
                        {badge.category}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={rarityStyle(badge.rarity)}>
                        {badge.rarity}
                      </span>
                    </td>
                    <td style={tdStyle}>{badge.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No badges available. Click "Seed Default Badges" to create the initial badge set.
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Leaderboard</h2>
        
        {leaderboard.length > 0 ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Rank</th>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Level</th>
                <th style={thStyle}>Points</th>
                <th style={thStyle}>Badges</th>
                <th style={thStyle}>Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user) => (
                <tr key={user.user_id}>
                  <td style={tdStyle}>
                    <strong style={{ color: '#3b82f6' }}>#{user.rank}</strong>
                  </td>
                  <td style={tdStyle}>
                    <strong>{user.username}</strong>
                  </td>
                  <td style={tdStyle}>{user.level}</td>
                  <td style={tdStyle}>{user.total_points.toLocaleString()}</td>
                  <td style={tdStyle}>{user.badges_count}</td>
                  <td style={tdStyle}>
                    <span style={{ color: '#059669' }}>
                      {user.streak} days
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
            No leaderboard data available yet.
          </p>
        )}
      </div>
    </div>
  )
}
