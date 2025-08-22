import React, { useEffect, useMemo, useState } from 'react'
import { getSections, explainTopic, me, getUserProgress, getProgressSummary, updateProgress } from '../api.js'
import SectionsPanel from '../components/SectionsPanel.jsx'
import ExplanationView from '../components/ExplanationView.jsx'
import Chat from '../components/Chat.jsx'
import Quiz from '../components/Quiz.jsx'
import Bookmarks from '../components/Bookmarks.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { useNavigate } from 'react-router-dom'

// Clean Professional UI Components
const pageStyle = { 
  minHeight: '100vh', 
  background: '#f8fafc', 
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', 
  display: 'flex', 
  flexDirection: 'column' 
}

const headerStyle = { 
  background: 'white', 
  borderBottom: '1px solid #e2e8f0',
  padding: '20px 24px', 
  color: '#1e293b',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
}

const headerInnerStyle = { 
  width: '100%', 
  margin: 0, 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between',
  gap: 12 
}

const contentWrapStyle = { 
  width: '100vw', 
  margin: 0, 
  padding: 0, 
  display: 'grid', 
  gridTemplateColumns: '380px 1fr', 
  gap: 0, 
  flex: 1 
}

const statPill = { 
  display: 'inline-flex', 
  alignItems: 'center', 
  gap: 8, 
  background: '#f1f5f9', 
  border: '1px solid #e2e8f0', 
  borderRadius: '20px', 
  padding: '8px 16px', 
  fontSize: '14px',
  fontWeight: '600',
  color: '#475569'
}

const cardStyle = { 
  background: 'white', 
  border: '1px solid #e2e8f0', 
  borderRadius: '12px', 
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease'
}

const sectionScrollStyle = { 
  maxHeight: 'calc(100vh - 200px)', 
  overflowY: 'auto',
  padding: '16px'
}

const welcomeCard = {
  ...cardStyle,
  background: 'white',
  margin: '20px',
  textAlign: 'center'
}

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  margin: '20px'
}

const statCard = (color) => ({
  ...cardStyle,
  background: 'white',
  border: `1px solid ${color}`,
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
})

const statNumber = (color) => ({
  fontSize: '36px',
  fontWeight: '800',
  color: color,
  marginBottom: '8px'
})

const statLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}

const badge = (color) => ({
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  color: color,
  background: `${color}10`,
  border: `1px solid ${color}30`,
  display: 'inline-block',
  margin: '4px'
})

const tabButton = (active) => ({
  padding: '12px 20px',
  border: 'none',
  borderRadius: '8px',
  background: active ? '#3b82f6' : '#f1f5f9',
  color: active ? 'white' : '#475569',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease'
})

export default function UserDashboard() {
  const [sections, setSections] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(!!localStorage.getItem('qc_token'))
  const [userLabel, setUserLabel] = useState('Signed in')
  const [progress, setProgress] = useState([])
  const [progressSummary, setProgressSummary] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [streakDays, setStreakDays] = useState(0)
  const [tab, setTab] = useState('explanation')
  const [filter, setFilter] = useState('')
  const navigate = useNavigate()

  useEffect(() => { getSections().then((res) => setSections(res.sections || [])).catch(() => setSections([])) }, [])
  useEffect(() => { if (!authed) return; me().then((r) => { setUserLabel(r?.user?.username || r?.user?.email || 'Signed in') }).catch(() => {}) }, [authed])
  useEffect(() => { if (!authed) return; loadProgress() }, [authed])
  useEffect(() => { const stored = parseInt(localStorage.getItem('qc_streak_days') || '0', 10); setStreakDays(Number.isFinite(stored) ? stored : 0) }, [])

  const filteredSections = sections.map(s => ({ ...s, topics: s.topics.filter(t => t.toLowerCase().includes(filter.toLowerCase() || '')) }))

  const loadProgress = async () => {
    setLoadingProgress(true)
    try {
      const [progressRes, summaryRes] = await Promise.all([ getUserProgress(), getProgressSummary() ])
      setProgress(progressRes.progress || [])
      setProgressSummary(summaryRes)
    } catch (e) { console.error('Failed to load progress:', e) } finally { setLoadingProgress(false) }
  }

  const updateDailyStreak = () => {
    const todayIso = new Date().toISOString().slice(0, 10)
    const lastActive = localStorage.getItem('qc_last_active_date')
    if (lastActive === todayIso) return
    const yesterdayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const nextStreak = lastActive === yesterdayIso ? (streakDays + 1) : 1
    setStreakDays(nextStreak)
    localStorage.setItem('qc_streak_days', String(nextStreak))
    localStorage.setItem('qc_last_active_date', todayIso)
  }

  const handleSelect = async (topic) => {
    setSelectedTopic(topic)
    setExplanation('')
    setError('')
    setLoading(true)
    try {
      const res = await explainTopic(topic)
      setExplanation(res.content || '')
      try { await updateProgress(topic, true) } catch (_) {}
      updateDailyStreak()
      await loadProgress()
    } catch (e) { setError(e.message || 'Failed to fetch explanation') } finally { setLoading(false) }
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('qc_token')
      // Optional: clear user-specific cached items
      // localStorage.removeItem('qc_streak_days')
      // localStorage.removeItem('qc_last_active_date')
    } catch (_) {}
    navigate('/login')
  }

  const badges = useMemo(() => {
    const p = progressSummary?.progress_percentage || 0
    const list = []
    if (p >= 25) list.push('Bronze')
    if (p >= 50) list.push('Silver')
    if (p >= 75) list.push('Gold')
    if (p >= 100) list.push('Completionist')
    if (streakDays >= 3) list.push('3-day Streak')
    if (streakDays >= 7) list.push('7-day Streak')
    return list
  }, [progressSummary, streakDays])

  const getTotalTopics = () => sections.reduce((sum, s) => sum + s.topics.length, 0)
  const getCompletedTopics = () => progress.filter(p => p.completed).length
  const getCompletionRate = () => getTotalTopics() > 0 ? Math.round((getCompletedTopics() / getTotalTopics()) * 100) : 0

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 48, 
              height: 48, 
              borderRadius: '12px', 
              background: '#3b82f6', 
              display: 'grid', 
              placeItems: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '24px', color: '#1e293b' }}>Quantitative Tutor</div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Welcome back, {userLabel}! Ready to learn?</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={statPill}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {streakDays} Day Streak
            </div>
            <div style={statPill}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
              </svg>
              {getCompletionRate()}% Complete
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#1e293b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 17l5-5-5-5"/>
                <path d="M15 12H3"/>
                <path d="M21 19V5a2 2 0 0 0-2-2h-6"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>



      {/* Statistics Grid */}
      <div style={statsGrid}>
        <div style={statCard('#3b82f6')}>
          <div style={statNumber('#3b82f6')}>{getTotalTopics()}</div>
          <div style={statLabel}>Total Topics</div>
        </div>
        
        <div style={statCard('#10b981')}>
          <div style={statNumber('#10b981')}>{getCompletedTopics()}</div>
          <div style={statLabel}>Completed</div>
        </div>
        
        <div style={statCard('#f59e0b')}>
          <div style={statNumber('#f59e0b')}>{streakDays}</div>
          <div style={statLabel}>Streak Days</div>
        </div>
        
        <div style={statCard('#ef4444')}>
          <div style={statNumber('#ef4444')}>{getCompletionRate()}%</div>
          <div style={statLabel}>Progress</div>
        </div>
      </div>

      <div style={contentWrapStyle}>
        {/* Left Sidebar */}
        <div style={{ background: 'white', borderRight: '1px solid #e2e8f0' }}>
          <div style={sectionScrollStyle}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search topics..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#1e293b',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            
            <SectionsPanel
              sections={filteredSections}
              selected={selectedTopic}
              onSelect={handleSelect}
              progress={progress}
            />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ background: '#f8fafc', padding: '24px' }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setTab('explanation')} 
              style={tabButton(tab === 'explanation')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Explanation
            </button>
            <button 
              onClick={() => setTab('quiz')} 
              style={tabButton(tab === 'quiz')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
              </svg>
              Quiz
            </button>
            <button 
              onClick={() => setTab('chat')} 
              style={tabButton(tab === 'chat')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Chat
            </button>
            <button 
              onClick={() => setTab('bookmarks')} 
              style={tabButton(tab === 'bookmarks')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              Bookmarks
            </button>
          </div>

          {/* Tab Content */}
          {tab === 'explanation' && (
            <div style={cardStyle}>
              {selectedTopic ? (
                <ExplanationView
                  topic={selectedTopic}
                  explanation={explanation}
                  loading={loading}
                  error={error}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1" style={{ marginBottom: '16px' }}>
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '24px' }}>
                    Choose a Topic to Start Learning
                  </h3>
                  <p style={{ margin: 0, fontSize: '16px' }}>
                    Select any topic from the left sidebar to begin your learning journey.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'quiz' && (
            <div style={cardStyle}>
              {selectedTopic ? (
                <Quiz selectedTopic={selectedTopic} />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1" style={{ marginBottom: '16px' }}>
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                    <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
                  </svg>
                  <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '24px' }}>
                    Select a Topic for Quiz
                  </h3>
                  <p style={{ margin: 0, fontSize: '16px' }}>
                    Choose a topic from the sidebar to test your knowledge with interactive quizzes.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'chat' && (
            <div style={cardStyle}>
              <Chat selectedTopic={selectedTopic} />
            </div>
          )}

          {tab === 'bookmarks' && (
            <div style={cardStyle}>
              <Bookmarks />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


