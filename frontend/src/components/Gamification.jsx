import React, { useState, useEffect } from 'react'
import {
  getGamificationStats,
  getUserBadges,
  getBadgeProgress,
  recordUserAction
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

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
}

const statCardStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
  textAlign: 'center'
}

const statValueStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#3b82f6',
  marginBottom: '8px'
}

const statLabelStyle = {
  fontSize: '0.875rem',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const tabContainerStyle = {
  display: 'flex',
  borderBottom: '2px solid #e5e7eb',
  marginBottom: '30px'
}

const tabStyle = (active) => ({
  padding: '12px 24px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: active ? '600' : '500',
  color: active ? '#3b82f6' : '#6b7280',
  borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
  marginBottom: '-2px',
  transition: 'all 0.2s ease'
})

const badgeGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px'
}

const badgeCardStyle = (rarity) => {
  const rarityColors = {
    common: { border: '#6b7280', bg: '#f9fafb' },
    rare: { border: '#3b82f6', bg: '#eff6ff' },
    epic: { border: '#8b5cf6', bg: '#f3f4f6' },
    legendary: { border: '#f59e0b', bg: '#fffbeb' }
  }
  
  return {
    background: rarityColors[rarity]?.bg || '#f9fafb',
    border: `2px solid ${rarityColors[rarity]?.border || '#6b7280'}`,
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    transition: 'transform 0.2s ease',
    cursor: 'pointer'
  }
}

const badgeIconStyle = {
  fontSize: '3rem',
  marginBottom: '12px',
  display: 'block'
}

const badgeNameStyle = {
  fontSize: '1.125rem',
  fontWeight: '600',
  color: '#1f2937',
  marginBottom: '8px'
}

const badgeDescriptionStyle = {
  fontSize: '0.875rem',
  color: '#6b7280',
  marginBottom: '12px',
  lineHeight: '1.4'
}

const badgeRarityStyle = (rarity) => {
  const rarityColors = {
    common: '#6b7280',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b'
  }
  
  return {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: rarityColors[rarity] || '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  }
}

const progressCardStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
  marginBottom: '20px'
}

const progressBarStyle = {
  width: '100%',
  height: '8px',
  backgroundColor: '#e5e7eb',
  borderRadius: '4px',
  overflow: 'hidden',
  marginTop: '8px'
}

const progressFillStyle = (progress) => ({
  height: '100%',
  backgroundColor: '#3b82f6',
  width: `${progress * 100}%`,
  transition: 'width 0.3s ease'
})

const loadingStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#6b7280'
}

const errorStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#ef4444',
  background: '#fef2f2',
  borderRadius: '8px',
  border: '1px solid #fecaca'
}

export default function Gamification() {
  const [activeTab, setActiveTab] = useState('overview')
  const [gamificationData, setGamificationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadGamificationData()
  }, [])

  const loadGamificationData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [statsRes, badgesRes, progressRes] = await Promise.all([
        getGamificationStats(),
        getUserBadges(),
        getBadgeProgress()
      ])
      
      setGamificationData({
        stats: statsRes.user_stats,
        badges: badgesRes.badges,
        progress: progressRes.progress,
        recentAchievements: statsRes.recent_achievements
      })
    } catch (err) {
      console.error('Failed to load gamification data:', err)
      setError('Failed to load gamification data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#6b7280',
      rare: '#3b82f6',
      epic: '#8b5cf6',
      legendary: '#f59e0b'
    }
    return colors[rarity] || '#6b7280'
  }

  const renderOverview = () => {
    if (!gamificationData) return null

    const { stats, recentAchievements } = gamificationData

    return (
      <div>
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.level}</div>
            <div style={statLabelStyle}>Level</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.total_points}</div>
            <div style={statLabelStyle}>Total Points</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.current_streak}</div>
            <div style={statLabelStyle}>Current Streak</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.badges_earned}</div>
            <div style={statLabelStyle}>Badges Earned</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.topics_completed}</div>
            <div style={statLabelStyle}>Topics Completed</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{stats.quizzes_taken}</div>
            <div style={statLabelStyle}>Quizzes Taken</div>
          </div>
        </div>

        {recentAchievements && recentAchievements.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Recent Achievements</h3>
            <div style={badgeGridStyle}>
              {recentAchievements.slice(-3).map((achievement) => (
                <div key={achievement.id} style={badgeCardStyle(achievement.badge_rarity)}>
                  <span style={badgeIconStyle}>{achievement.badge_icon}</span>
                  <div style={badgeNameStyle}>{achievement.badge_name}</div>
                  <div style={badgeDescriptionStyle}>{achievement.badge_description}</div>
                  <div style={badgeRarityStyle(achievement.badge_rarity)}>
                    {achievement.badge_rarity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderBadges = () => {
    if (!gamificationData) return null

    const { badges } = gamificationData

    if (badges.length === 0) {
      return (
        <div style={loadingStyle}>
          <p>No badges earned yet. Keep learning to unlock achievements!</p>
        </div>
      )
    }

    return (
      <div style={badgeGridStyle}>
        {badges.map((badge) => (
          <div key={badge.id} style={badgeCardStyle(badge.badge_rarity)}>
            <span style={badgeIconStyle}>{badge.badge_icon}</span>
            <div style={badgeNameStyle}>{badge.badge_name}</div>
            <div style={badgeDescriptionStyle}>{badge.badge_description}</div>
            <div style={badgeRarityStyle(badge.badge_rarity)}>
              {badge.badge_rarity}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '8px' }}>
              Earned: {new Date(badge.earned_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderProgress = () => {
    if (!gamificationData) return null

    const { progress } = gamificationData

    if (progress.length === 0) {
      return (
        <div style={loadingStyle}>
          <p>No progress data available.</p>
        </div>
      )
    }

    return (
      <div>
        {progress.map((item) => (
          <div key={item.badge_id} style={progressCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, color: '#1f2937' }}>{item.badge_name}</h4>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {item.current_value} / {item.target_value}
              </span>
            </div>
            <div style={progressBarStyle}>
              <div style={progressFillStyle(item.progress)}></div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
              {Math.round(item.progress * 100)}% complete
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <p>Loading gamification data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          <p>{error}</p>
          <button 
            onClick={loadGamificationData}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '12px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>🏆 Achievements</h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '1.125rem', color: '#6b7280' }}>
          Track your learning progress and unlock badges
        </p>
      </div>

      <div style={tabContainerStyle}>
        <button 
          style={tabStyle(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          style={tabStyle(activeTab === 'badges')}
          onClick={() => setActiveTab('badges')}
        >
          Badges ({gamificationData?.badges?.length || 0})
        </button>
        <button 
          style={tabStyle(activeTab === 'progress')}
          onClick={() => setActiveTab('progress')}
        >
          Progress ({gamificationData?.progress?.length || 0})
        </button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'badges' && renderBadges()}
      {activeTab === 'progress' && renderProgress()}
    </div>
  )
}
