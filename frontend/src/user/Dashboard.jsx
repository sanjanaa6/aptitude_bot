import React, { useEffect, useMemo, useState } from 'react'
import { getSections, explainTopic, me, getUserProgress, getProgressSummary, updateProgress } from '../api.js'
import SectionsPanel from '../components/SectionsPanel.jsx'
import ExplanationView from '../components/ExplanationView.jsx'
import Chat from '../components/Chat.jsx'
import Quiz from '../components/Quiz.jsx'
import Bookmarks from '../components/Bookmarks.jsx'
import Gamification from '../components/Gamification.jsx'
import LearningPathGenerator from '../components/LearningPathGenerator.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import VoiceSettings from '../components/VoiceSettings.jsx'
import { useNavigate } from 'react-router-dom'

// Modern Dashboard Styles with Animations
const pageStyle = { 
  minHeight: '100vh', 
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', 
  display: 'flex', 
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden'
}

const floatingOrbs = {
  position: 'absolute',
  top: '10%',
  right: '5%',
  width: '200px',
  height: '200px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '50%',
  animation: 'float 6s ease-in-out infinite',
  zIndex: 0
}

const floatingOrb2 = {
  ...floatingOrbs,
  top: '60%',
  right: '15%',
  width: '150px',
  height: '150px',
  animationDelay: '2s'
}

const floatingOrb3 = {
  ...floatingOrbs,
  top: '30%',
  right: '25%',
  width: '100px',
  height: '100px',
  animationDelay: '4s'
}

const headerStyle = { 
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '24px 32px', 
  color: '#1e293b',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  zIndex: 10
}

const headerInnerStyle = { 
  width: '100%', 
  margin: 0, 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between',
  gap: 16 
}

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  animation: 'slideInLeft 0.8s ease-out'
}

const logoIcon = {
  width: 56, 
  height: 56, 
  borderRadius: '16px', 
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'grid', 
  placeItems: 'center',
  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
  animation: 'pulse 2s ease-in-out infinite'
}

const headerText = {
  animation: 'fadeInUp 0.8s ease-out 0.2s both'
}

const headerTitle = {
  fontWeight: '800', 
  fontSize: '28px', 
  color: '#1e293b',
  margin: 0,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}

const headerSubtitle = {
  fontSize: '16px', 
  color: '#64748b',
  margin: '4px 0 0 0',
  fontWeight: '500'
}

const headerActions = {
  display: 'flex', 
  alignItems: 'center', 
  gap: 16,
  animation: 'slideInRight 0.8s ease-out 0.4s both'
}

const statPill = { 
  display: 'inline-flex', 
  alignItems: 'center', 
  gap: 10, 
  background: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '25px', 
  padding: '12px 20px', 
  fontSize: '14px',
  fontWeight: '600',
  color: '#475569',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  cursor: 'pointer'
}

const statPillHover = {
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  background: 'rgba(255, 255, 255, 1)'
}

const contentWrapStyle = { 
  width: '100vw', 
  margin: 0, 
  padding: 0, 
  display: 'grid', 
  gridTemplateColumns: '400px 1fr', 
  gap: 0, 
  flex: 1,
  position: 'relative',
  zIndex: 5
}

const sidebarStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
  animation: 'slideInLeft 0.8s ease-out 0.6s both'
}

const mainContentStyle = {
  background: 'rgba(248, 250, 252, 0.8)',
  backdropFilter: 'blur(20px)',
  padding: '32px',
  animation: 'fadeInUp 0.8s ease-out 0.8s both'
}

const sectionScrollStyle = { 
  maxHeight: 'calc(100vh - 200px)', 
  overflowY: 'auto',
  padding: '24px',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(102, 126, 234, 0.3) transparent'
}

const welcomeCard = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '20px',
  padding: '32px',
  margin: '24px',
  textAlign: 'center',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  animation: 'fadeInUp 0.8s ease-out 1s both'
}

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '24px',
  margin: '24px',
  animation: 'fadeInUp 0.8s ease-out 1.2s both'
}

const statCard = (color, gradient) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '20px',
  padding: '32px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
})

const statCardHover = {
  transform: 'translateY(-8px) scale(1.02)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
}

const statCardGlow = (color, gradient) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '4px',
  background: gradient || `linear-gradient(90deg, ${color}, ${color}80)`,
  borderRadius: '20px 20px 0 0'
})

const statNumber = (color) => ({
  fontSize: '48px',
  fontWeight: '900',
  background: `linear-gradient(135deg, ${color}, ${color}80)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: '12px',
  display: 'block'
})

const statLabel = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '1px'
}

const tabButton = (active) => ({
  padding: '16px 24px',
  borderRadius: '12px',
  background: active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.8)',
  color: active ? 'white' : '#475569',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: '600',
  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  backdropFilter: 'blur(10px)',
  border: active ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10
})

const tabButtonHover = {
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
}

const tabContainer = {
  display: 'flex',
  gap: '16px',
  marginBottom: '32px',
  flexWrap: 'wrap',
  animation: 'fadeInUp 0.8s ease-out 1.4s both'
}

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '20px',
  padding: '32px',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  animation: 'fadeInUp 0.8s ease-out 1.6s both'
}

const emptyStateStyle = {
  textAlign: 'center',
  padding: '80px 40px',
  color: '#64748b',
  animation: 'fadeInUp 0.8s ease-out 1.8s both'
}

const emptyStateIcon = {
  width: '80px',
  height: '80px',
  marginBottom: '24px',
  opacity: 0.6
}

const emptyStateTitle = {
  margin: '0 0 16px 0',
  color: '#1e293b',
  fontSize: '28px',
  fontWeight: '700'
}

const emptyStateText = {
  margin: 0,
  fontSize: '18px',
  lineHeight: '1.6'
}

const searchInputStyle = {
  width: '100%',
  padding: '16px 20px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.9)',
  color: '#1e293b',
  fontSize: '16px',
  outline: 'none',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(10px)'
}

const searchInputFocus = {
  borderColor: '#667eea',
  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
  transform: 'scale(1.02)'
}

const actionButton = {
  padding: '12px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  background: 'rgba(255, 255, 255, 0.9)',
  color: '#1e293b',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(10px)'
}

const actionButtonHover = {
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  background: 'rgba(255, 255, 255, 1)'
}

// CSS Animations
const animations = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  @keyframes slideInLeft {
    from { transform: translateX(-100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
`

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
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [hoveredStat, setHoveredStat] = useState(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [leftTab, setLeftTab] = useState('learn')
  const navigate = useNavigate()

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
      const sanitizeExplanation = (text) => {
        if (!text) return ''
        let cleaned = String(text)
        cleaned = cleaned.replace(/^#{1,6}\s*/gm, '')
        cleaned = cleaned.replace(/\*\*|__/g, '')
        cleaned = cleaned.replace(/[\*_`~]/g, '')
        cleaned = cleaned.replace(/\\[\[\](){}]/g, '')
        cleaned = cleaned.replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
        cleaned = cleaned.replace(/\\/g, '')
        cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '- ')
        cleaned = cleaned.replace(/\s*-\s*(Definition|Purpose|Key Components|Example|Summary)\s*:/gi, '\n\n$1: ')
        cleaned = cleaned.replace(/\b(Definition|Purpose|Key Concepts?|Key Components|Example|Summary)\s*:/gi, '\n\n$1: ')
        cleaned = cleaned.replace(/\s(\d+)\.\s/g, '\n\n$1) ')
        cleaned = cleaned.replace(/\|{2,}/g, ' | ')
        cleaned = cleaned.replace(/\s\|\s/g, ' | ')
        cleaned = cleaned.replace(/\s?\|\s?/g, ' | ')
        cleaned = cleaned.replace(/\s?-{2,}\s?/g, '\n')
        cleaned = cleaned.replace(/([.!?])\s*(?=[A-Z0-9])/g, '$1\n')
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
        cleaned = cleaned.replace(/[\t ]{2,}/g, ' ')
        return cleaned.trim()
      }
      setExplanation(sanitizeExplanation(res.content || ''))
      try { await updateProgress(topic, true) } catch (_) {}
      updateDailyStreak()
      await loadProgress()
    } catch (e) { setError(e.message || 'Failed to fetch explanation') } finally { setLoading(false) }
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem('qc_token')
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

  const filteredSections = sections.map(s => ({ ...s, topics: s.topics.filter(t => t.toLowerCase().includes(filter.toLowerCase() || '')) }))

  // All useEffect hooks must be called in the same order every render
  useEffect(() => { getSections().then((res) => setSections(res.sections || [])).catch(() => setSections([])) }, [])
  useEffect(() => { 
    if (!authed) return; 
    me().then((r) => { 
      setUserLabel(r?.user?.username || r?.user?.email || 'Signed in')
      setIsAdmin(!!r?.user?.is_admin)
      setCheckingAdmin(false)
    }).catch(() => {
      setCheckingAdmin(false)
    }) 
  }, [authed])
  useEffect(() => { if (!authed) return; loadProgress() }, [authed])
  useEffect(() => { const stored = parseInt(localStorage.getItem('qc_streak_days') || '0', 10); setStreakDays(Number.isFinite(stored) ? stored : 0) }, [])

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (!checkingAdmin && isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [checkingAdmin, isAdmin, navigate])

  // Show loading while checking admin status
  if (checkingAdmin) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px',
      color: '#64748b',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>Loading...</div>
  }

  // Don't render user dashboard if user is admin
  if (isAdmin) {
    return null
  }

  return (
    <>
      <style>{animations}</style>
    <div style={pageStyle}>
        {/* Floating Background Elements */}
        <div style={floatingOrbs}></div>
        <div style={floatingOrb2}></div>
        <div style={floatingOrb3}></div>

      <header style={headerStyle}>
        <div style={headerInnerStyle}>
            <div style={logoContainer}>
              <div style={logoIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
              <div style={headerText}>
                <h1 style={headerTitle}>Quantitative Tutor</h1>
                <p style={headerSubtitle}>Welcome back, {userLabel}! Ready to learn?</p>
              </div>
          </div>
          
            <div style={headerActions}>
              <div 
                style={{...statPill, ...(hoveredStat === 'streak' ? statPillHover : {})}}
                onMouseEnter={() => setHoveredStat('streak')}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {streakDays} Day Streak
            </div>
              <div 
                style={{...statPill, ...(hoveredStat === 'progress' ? statPillHover : {})}}
                onMouseEnter={() => setHoveredStat('progress')}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
              </svg>
              {getCompletionRate()}% Complete
            </div>
            <button
              onClick={() => setShowVoiceSettings(true)}
              style={{
                  ...actionButton,
                  ...(hoveredStat === 'voice' ? actionButtonHover : {})
                }}
                onMouseEnter={() => setHoveredStat('voice')}
                onMouseLeave={() => setHoveredStat(null)}
              title="Voice Settings"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              Voice
            </button>
            <button
              onClick={handleLogout}
              style={{
                  ...actionButton,
                  ...(hoveredStat === 'logout' ? actionButtonHover : {})
                }}
                onMouseEnter={() => setHoveredStat('logout')}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      
      <div style={contentWrapStyle}>
        {/* Left Sidebar */}
          <div style={sidebarStyle}>
          <div style={sectionScrollStyle}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => setLeftTab('learn')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #e5e7eb',
                    background: leftTab === 'learn' ? '#eef2ff' : 'white',
                    color: leftTab === 'learn' ? '#3730a3' : '#111827',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  Learn
                </button>
                <button
                  onClick={() => setLeftTab('generator')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #e5e7eb',
                    background: leftTab === 'generator' ? '#eef2ff' : 'white',
                    color: leftTab === 'generator' ? '#3730a3' : '#111827',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></svg>
                  Learning Path
                </button>
              </div>
              {leftTab === 'learn' ? (
                <>
                  <div style={{ marginBottom: '24px' }}>
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                    style={{
                        ...searchInputStyle,
                        ...(searchFocused ? searchInputFocus : {})
                    }}
                  />
                </div>
                
                <SectionsPanel
                  sections={filteredSections}
                  selected={selectedTopic}
                  onSelect={handleSelect}
                  progress={progress}
                />
                </>
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 12,
                  padding: 16,
                  color: '#475569'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Learning Path Generator</div>
                  <div style={{ fontSize: 13 }}>
                    Coming soon. You will be able to generate a custom path.
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Main Content */}
          <div style={mainContentStyle}>
          {/* Tab Navigation */}
            {leftTab === 'learn' ? (
              <div style={tabContainer}>
            <button 
              onClick={() => setTab('explanation')} 
                style={{
                  ...tabButton(tab === 'explanation'),
                  ...(tab === 'explanation' ? {} : {})
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Explanation
            </button>
            <button 
              onClick={() => setTab('quiz')} 
                style={{
                  ...tabButton(tab === 'quiz'),
                  ...(tab === 'quiz' ? {} : {})
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
              </svg>
              Quiz
            </button>
            <button 
              onClick={() => setTab('chat')} 
                style={{
                  ...tabButton(tab === 'chat'),
                  ...(tab === 'chat' ? {} : {})
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Chat
            </button>
            <button 
              onClick={() => setTab('bookmarks')} 
                style={{
                  ...tabButton(tab === 'bookmarks'),
                  ...(tab === 'bookmarks' ? {} : {})
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              Bookmarks
            </button>
            <button 
              onClick={() => setTab('gamification')} 
                style={{
                  ...tabButton(tab === 'gamification'),
                  ...(tab === 'gamification' ? {} : {})
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Achievements
            </button>
          </div>
            ) : (
              <LearningPathGenerator />
            )}

          {/* Tab Content */}
          {leftTab === 'learn' && tab === 'explanation' && (
            <div style={cardStyle}>
              {selectedTopic ? (
                <ExplanationView
                  topic={selectedTopic}
                  explanation={explanation}
                  loading={loading}
                  error={error}
                />
              ) : (
                  <div style={emptyStateStyle}>
                    <svg style={emptyStateIcon} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                    <h3 style={emptyStateTitle}>
                    Choose a Topic to Start Learning
                  </h3>
                    <p style={emptyStateText}>
                    Select any topic from the left sidebar to begin your learning journey.
                  </p>
                </div>
              )}
            </div>
          )}

          {leftTab === 'learn' && tab === 'quiz' && (
            <div style={cardStyle}>
              {selectedTopic ? (
                <Quiz selectedTopic={selectedTopic} />
              ) : (
                  <div style={emptyStateStyle}>
                    <svg style={emptyStateIcon} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                    <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                    <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
                  </svg>
                    <h3 style={emptyStateTitle}>
                    Select a Topic for Quiz
                  </h3>
                    <p style={emptyStateText}>
                    Choose a topic from the sidebar to test your knowledge with interactive quizzes.
                  </p>
                </div>
              )}
            </div>
          )}

          {leftTab === 'learn' && tab === 'chat' && (
            <div style={cardStyle}>
              <Chat selectedTopic={selectedTopic} />
            </div>
          )}

          {leftTab === 'learn' && tab === 'bookmarks' && (
            <div style={cardStyle}>
              <Bookmarks />
            </div>
          )}

          {leftTab === 'learn' && tab === 'gamification' && (
            <div style={{ padding: 0, background: 'transparent' }}>
              <Gamification />
            </div>
          )}
        </div>
      </div>

      {/* Voice Settings Modal */}
      {showVoiceSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(10px)',
            animation: 'fadeInUp 0.3s ease-out'
        }}>
          <VoiceSettings onClose={() => setShowVoiceSettings(false)} />
        </div>
      )}
    </div>
    </>
  )
}
