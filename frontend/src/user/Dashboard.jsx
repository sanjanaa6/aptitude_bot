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
import LearningBot from '../components/learningBot/LearningBot.jsx'
import { useNavigate } from 'react-router-dom'
import CustomNavbar from '../components/CustomNavbar.jsx'

// Dark Space Theme Dashboard Styles
const pageStyle = { 
  minHeight: '100vh', 
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', 
  display: 'flex', 
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  color: '#e2e8f0'
}

const mainContentStyle = {
  display: 'grid',
  gridTemplateColumns: '320px 1fr',
  gap: 0,
  flex: 1,
  position: 'relative'
}

const sidebarStyle = (isMobileMenuOpen) => ({
  background: 'rgba(15, 23, 42, 0.95)',
  borderRight: '1px solid rgba(148, 163, 184, 0.1)',
  padding: '24px 0',
  overflowY: 'auto',
  backdropFilter: 'blur(20px)'
})

const sidebarOverlayStyle = (isMobileMenuOpen) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  zIndex: 999,
  display: isMobileMenuOpen ? 'block' : 'none'
})

const mobileMenuToggleStyle = {
  display: 'none',
  position: 'fixed',
  top: '80px',
  left: '16px',
  zIndex: 1001,
  background: 'rgba(139, 92, 246, 0.9)',
  border: 'none',
  borderRadius: '8px',
  padding: '12px',
  color: 'white',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
  transition: 'all 0.2s ease',
  alignItems: 'center',
  justifyContent: 'center'
}

const sidebarSection = {
  padding: '0 24px',
  marginBottom: '32px'
}

const sidebarTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}

const sidebarItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '8px',
  color: '#e2e8f0',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginBottom: '4px',
  position: 'relative'
}

const sidebarItemActive = {
  background: 'rgba(139, 92, 246, 0.15)',
  color: '#a78bfa',
  borderLeft: '3px solid #8b5cf6'
}

const sidebarItemHover = {
  background: 'rgba(148, 163, 184, 0.1)',
  color: '#f1f5f9'
}

const badgeStyle = {
  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  color: 'white',
  fontSize: '10px',
  fontWeight: '700',
  padding: '2px 6px',
  borderRadius: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const proBadgeStyle = {
  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
  color: 'white',
  fontSize: '10px',
  fontWeight: '700',
  padding: '2px 6px',
  borderRadius: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const newBadgeStyle = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  color: 'white',
  fontSize: '10px',
  fontWeight: '700',
  padding: '2px 6px',
  borderRadius: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const contentAreaStyle = {
  padding: '32px',
  overflowY: 'auto',
  background: 'rgba(15, 23, 42, 0.3)'
}

const welcomeSectionStyle = {
  background: 'rgba(30, 41, 59, 0.8)',
  borderRadius: '20px',
  padding: '32px',
  marginBottom: '32px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  backdropFilter: 'blur(20px)',
  position: 'relative',
  overflow: 'hidden'
}

const welcomeTitle = {
  fontSize: '32px',
  fontWeight: '800',
  color: '#f1f5f9',
  margin: '0 0 8px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
}

const welcomeSubtitle = {
  fontSize: '18px',
  color: '#94a3b8',
  margin: '0 0 32px 0',
  fontWeight: '500'
}

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '20px',
  marginBottom: '32px'
}

const statCardStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  textAlign: 'center',
  transition: 'all 0.3s ease'
}

const statCardHover = {
  transform: 'translateY(-4px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  borderColor: 'rgba(139, 92, 246, 0.3)'
}

const statIconStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'grid',
  placeItems: 'center',
  margin: '0 auto 16px',
  fontSize: '24px'
}

const statValueStyle = {
  fontSize: '28px',
  fontWeight: '800',
  color: '#f1f5f9',
  margin: '0 0 4px 0'
}

const statLabelStyle = {
  fontSize: '14px',
  color: '#94a3b8',
  fontWeight: '500',
  margin: 0
}

const sectionTitleStyle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#f1f5f9',
  margin: '0 0 24px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
}

const performanceGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '20px',
  marginBottom: '32px'
}

const performanceCardStyle = {
  background: 'rgba(30, 41, 59, 0.8)',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  transition: 'all 0.3s ease'
}

const performanceCardHover = {
  transform: 'translateY(-4px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  borderColor: 'rgba(139, 92, 246, 0.3)'
}

const performanceValueStyle = {
  fontSize: '32px',
  fontWeight: '800',
  color: '#f1f5f9',
  margin: '0 0 8px 0'
}

const performanceSubtextStyle = {
  fontSize: '14px',
  color: '#94a3b8',
  margin: 0
}

const quickLaunchGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '20px'
}

const quickLaunchItemStyle = {
  background: 'rgba(30, 41, 59, 0.8)',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden'
}

const quickLaunchItemHover = {
  transform: 'translateY(-4px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  borderColor: 'rgba(139, 92, 246, 0.3)'
}

const quickLaunchIconStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'grid',
  placeItems: 'center',
  margin: '0 auto 16px',
  fontSize: '24px'
}

const quickLaunchLabelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#e2e8f0',
  margin: 0
}

const tabContainer = {
  display: 'flex',
  gap: '8px',
  marginBottom: '24px',
  flexWrap: 'wrap'
}

const tabButton = (isActive) => ({
  padding: '12px 20px',
  background: isActive ? 'rgba(139, 92, 246, 0.2)' : 'rgba(148, 163, 184, 0.1)',
  border: isActive ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(148, 163, 184, 0.2)',
  color: isActive ? '#a78bfa' : '#e2e8f0',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
})

const searchInputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '8px',
  fontSize: '14px',
  background: 'rgba(15, 23, 42, 0.6)',
  color: '#e2e8f0',
  outline: 'none',
  transition: 'all 0.2s ease'
}

const searchInputFocus = {
  borderColor: 'rgba(139, 92, 246, 0.4)',
  boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)'
}

const cardStyle = {
  background: 'rgba(30, 41, 59, 0.8)',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  backdropFilter: 'blur(20px)'
}

const floatingOrbStyle = {
  position: 'absolute',
  width: '200px',
  height: '200px',
  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
  borderRadius: '50%',
  animation: 'float 6s ease-in-out infinite',
  zIndex: 0
}

const floatingOrb2Style = {
  ...floatingOrbStyle,
  top: '60%',
  right: '15%',
  width: '150px',
  height: '150px',
  background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
  animationDelay: '2s'
}

const floatingOrb3Style = {
  ...floatingOrbStyle,
  top: '30%',
  right: '25%',
  width: '100px',
  height: '100px',
  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
  animationDelay: '4s'
}

const largeLogoStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '120px',
  height: '120px',
  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  fontSize: '48px',
  fontWeight: '800',
  color: 'white',
  opacity: '0.1'
}

const animations = `
  @keyframes slideInLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
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

  const [searchFocused, setSearchFocused] = useState(false)
  const [leftTab, setLeftTab] = useState(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
  // Lazy-load sections only when user selects "Learn"
  useEffect(() => {
    if (leftTab !== 'learn') return
    getSections().then((res) => setSections(res.sections || [])).catch(() => setSections([]))
  }, [leftTab])
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
        <div style={floatingOrbStyle}></div>
        <div style={floatingOrb2Style}></div>
        <div style={floatingOrb3Style}></div>
        <div style={largeLogoStyle}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>

      <CustomNavbar
        title="Quantitative Tutor"
        subtitle="Welcome back"
        streakDays={streakDays}
        completionRate={getCompletionRate()}
        onLogout={handleLogout}
        onVoiceSettings={() => setShowVoiceSettings(true)}
        userLabel={userLabel}
      />

      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setShowMobileMenu(!showMobileMenu)} 
        style={mobileMenuToggleStyle}
        className="mobile-menu-toggle"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          {showMobileMenu ? (
            <path d="M18 6L6 18M6 6l12 12"/>
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18"/>
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      <div 
        style={sidebarOverlayStyle(showMobileMenu)} 
        onClick={() => setShowMobileMenu(false)}
        className={`mobile-overlay ${showMobileMenu ? 'open' : ''}`}
      ></div>

      {/* Statistics Grid */}
      
              {/* Main Layout Container */}
        <div style={mainContentStyle} className="dashboard-main-content">
        {/* Left Sidebar */}
        <div style={sidebarStyle(showMobileMenu)} className={`mobile-sidebar ${showMobileMenu ? 'open' : ''}`}>
          {/* Mobile Close Button */}
          <div style={{
            display: 'none',
            justifyContent: 'flex-end',
            padding: '16px 24px 0',
            marginBottom: '16px'
          }} className="mobile-close-button">
            <button
              onClick={() => setShowMobileMenu(false)}
              style={{
                background: 'rgba(148, 163, 184, 0.1)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                color: '#e2e8f0',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                width: '32px',
                height: '32px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div style={sidebarSection} className="dashboard-sidebar-section">
            <div style={sidebarTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span>Quantitative Tutor</span>
            </div>
            <div style={{...sidebarItem, color: '#94a3b8', fontSize: '12px'}} className="dashboard-sidebar-item">
              Welcome back, {userLabel}!
            </div>
          </div>

          <div style={sidebarSection} className="dashboard-sidebar-section">
            <div style={sidebarTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Learning Tools</span>
            </div>
            <div style={sidebarItem} onClick={() => { setLeftTab('learn'); setShowMobileMenu(false); }} className="dashboard-sidebar-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Aptitude Bot</span>
            </div>
            <div style={sidebarItem} onClick={() => { setLeftTab('generator'); setShowMobileMenu(false); }} className="dashboard-sidebar-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Roadmap Generator</span>
            </div>
            <div style={sidebarItem} onClick={() => { setLeftTab('learningBot'); setShowMobileMenu(false); }} className="dashboard-sidebar-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              <span>ChatBot</span>
              <div style={newBadgeStyle}>NEW</div>
            </div>
          </div>

          <div style={sidebarSection} className="dashboard-sidebar-section">
            <div style={sidebarTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Your Progress</span>
            </div>
            <div style={statCardStyle}>
              <div style={{...statIconStyle, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div style={statValueStyle}>{streakDays}</div>
              <div style={statLabelStyle}>Streak</div>
            </div>
            <div style={statCardStyle}>
              <div style={{...statIconStyle, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M9 12l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div style={statValueStyle}>{getCompletionRate()}%</div>
              <div style={statLabelStyle}>Completion</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={contentAreaStyle} className="dashboard-content-area">
          {/* Welcome Section - Show when no leftTab is selected */}
          {!leftTab && (
            <>
              <div style={welcomeSectionStyle}>
                <div style={largeLogoStyle}>QT</div>
                <h1 style={welcomeTitle}>
                  Welcome back, {userLabel}!
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </h1>
                <p style={welcomeSubtitle}>
                  Ready to master quantitative concepts? Your learning journey continues here!
                </p>
                
                <div style={statsGridStyle} className="dashboard-stats-grid">
                  <div style={statCardStyle}>
                    <div style={{...statIconStyle, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M9 12l2 2 4-4"/>
                        <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                        <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                        <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
                      </svg>
                    </div>
                    <div style={statValueStyle}>{progressSummary?.total_quizzes || 0}</div>
                    <div style={statLabelStyle}>Quizzes</div>
                  </div>
                  <div style={statCardStyle}>
                    <div style={{...statIconStyle, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div style={statValueStyle}>{getCompletionRate()}%</div>
                    <div style={statLabelStyle}>Score</div>
                  </div>
                  <div style={statCardStyle}>
                    <div style={{...statIconStyle, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div style={statValueStyle}>{streakDays}</div>
                    <div style={statLabelStyle}>Streak</div>
                  </div>
                  <div style={statCardStyle}>
                    <div style={{...statIconStyle, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div style={statValueStyle}>{progressSummary?.total_completed || 0}</div>
                    <div style={statLabelStyle}>Completed</div>
                  </div>
                </div>
              </div>

              {/* Quick Launch Section */}
              <div style={{...welcomeSectionStyle, marginBottom: '32px'}}>
                <h2 style={sectionTitleStyle}>
                  Quick Launch
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </h2>
                
                <div style={quickLaunchGridStyle} className="dashboard-quick-launch-grid">
                  <div style={quickLaunchItemStyle} onClick={() => { setLeftTab('learn'); setShowMobileMenu(false); }}>
                    <div style={{...quickLaunchIconStyle, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div style={quickLaunchLabelStyle}>Learn</div>
                  </div>
                                      <div style={quickLaunchItemStyle} onClick={() => { setLeftTab('generator'); setShowMobileMenu(false); }}>
                      <div style={{...quickLaunchIconStyle, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div style={quickLaunchLabelStyle}>Roadmap Generator</div>
                    </div>
                                      <div style={quickLaunchItemStyle} onClick={() => { setLeftTab('learningBot'); setShowMobileMenu(false); }}>
                      <div style={{...quickLaunchIconStyle, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                        </svg>
                      </div>
                      <div style={quickLaunchLabelStyle}>ChatBot</div>
                      <div style={newBadgeStyle}>NEW</div>
                    </div>
                </div>
              </div>
            </>
          )}

          {/* Conditional Content Based on Left Tab */}
          {leftTab === 'learn' ? (
            selectedTopic ? (
              <div>
                <div style={sectionTitleStyle}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span>Learn: {selectedTopic}</span>
                </div>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2 2z"/>
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Achievements
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                <div style={{ width: 'min(880px, 100%)' }}>
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
                  <div style={cardStyle}>
                    <SectionsPanel
                      sections={filteredSections}
                      selected={selectedTopic}
                      onSelect={handleSelect}
                      progress={progress}
                    />
                  </div>
                </div>
              </div>
            )
          ) : leftTab === 'generator' ? (
            <LearningPathGenerator />
          ) : leftTab === 'learningBot' ? (
            <LearningBot userEmail={userLabel} />
          ) : null}

          {/* Tab Content Rendering */}
          {leftTab === 'learn' && selectedTopic && tab === 'explanation' && (
            <div style={cardStyle}>
              <ExplanationView
                topic={selectedTopic}
                explanation={explanation}
                loading={loading}
                error={error}
              />
            </div>
          )}

          {leftTab === 'learn' && selectedTopic && tab === 'quiz' && (
            <div style={cardStyle}>
              <Quiz selectedTopic={selectedTopic} />
            </div>
          )}

          {leftTab === 'learn' && selectedTopic && tab === 'chat' && (
            <div style={cardStyle}>
              <Chat selectedTopic={selectedTopic} />
            </div>
          )}

          {leftTab === 'learn' && selectedTopic && tab === 'bookmarks' && (
            <div style={cardStyle}>
              <Bookmarks />
            </div>
          )}

          {leftTab === 'learn' && selectedTopic && tab === 'gamification' && (
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

      <style>{`
        /* Mobile menu toggle button */
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
        
        /* Mobile close button */
        @media (max-width: 768px) {
          .mobile-close-button {
            display: flex !important;
          }
        }
        
        /* Hide overlay on desktop */
        @media (min-width: 769px) {
          .mobile-overlay {
            display: none !important;
          }
        }
        
        /* Responsive Dashboard Styles */
        @media (max-width: 1024px) {
          .dashboard-main-content {
            grid-template-columns: 280px 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-main-content {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }
          
          .dashboard-sidebar {
            border-right: none;
            border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            padding: 16px 0;
          }
          
          .dashboard-content-area {
            padding: 20px;
          }
          
          .dashboard-welcome-section {
            padding: 24px;
            border-radius: 16px;
          }
          
          .dashboard-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          
          .dashboard-quick-launch-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 16px;
          }
        }
        
        @media (max-width: 480px) {
          .dashboard-content-area {
            padding: 16px;
          }
          
          .dashboard-welcome-section {
            padding: 20px;
            border-radius: 12px;
          }
          
          .dashboard-stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .dashboard-quick-launch-grid {
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            gap: 12px;
          }
          
          .dashboard-sidebar-section {
            padding: 0 12px;
            margin-bottom: 20px;
          }
          
          .dashboard-sidebar-item {
            padding: 8px 10px;
            gap: 8px;
            font-size: 14px;
          }
        }
        
        /* Mobile-first responsive design */
        @media (max-width: 768px) {
          .dashboard-title {
            font-size: 28px;
            gap: 10px;
          }
          
          .dashboard-subtitle {
            font-size: 16px;
            margin: 0 0 24px 0;
          }
          
          .dashboard-stat-card {
            padding: 20px;
            border-radius: 12px;
          }
          
          .dashboard-stat-icon {
            width: 40px;
            height: 40px;
            margin: 0 auto 12px;
            font-size: 20px;
          }
          
          .dashboard-stat-value {
            font-size: 24px;
          }
          
          .dashboard-section-title {
            font-size: 20px;
            margin: 0 0 20px 0;
            gap: 10px;
          }
          
          .dashboard-quick-launch-item {
            padding: 20px;
            border-radius: 12px;
          }
          
          .dashboard-quick-launch-icon {
            width: 40px;
            height: 40px;
            margin: 0 auto 12px;
            font-size: 20px;
          }
          
          .dashboard-tab-container {
            margin-bottom: 20px;
          }
          
          .dashboard-tab-button {
            padding: 10px 16px;
            font-size: 13px;
          }
          
          .dashboard-search-input {
            padding: 10px 14px;
            font-size: 13px;
          }
          
          .dashboard-card {
            padding: 20px;
            border-radius: 12px;
          }
        }
        
        @media (max-width: 480px) {
          .dashboard-title {
            font-size: 24px;
            gap: 8px;
            flex-direction: column;
            align-items: flex-start;
          }
          
          .dashboard-subtitle {
            font-size: 14px;
            margin: 0 0 20px 0;
          }
          
          .dashboard-stat-card {
            padding: 16px;
            border-radius: 10px;
          }
          
          .dashboard-stat-icon {
            width: 36px;
            height: 36px;
            margin: 0 auto 10px;
            font-size: 18px;
          }
          
          .dashboard-stat-value {
            font-size: 20px;
          }
          
          .dashboard-stat-label {
            font-size: 12px;
          }
          
          .dashboard-section-title {
            font-size: 18px;
            margin: 0 0 16px 0;
            gap: 8px;
          }
          
          .dashboard-quick-launch-item {
            padding: 16px;
            border-radius: 10px;
          }
          
          .dashboard-quick-launch-icon {
            width: 32px;
            height: 32px;
            margin: 0 auto 10px;
            font-size: 16px;
          }
          
          .dashboard-quick-launch-label {
            font-size: 12px;
          }
          
          .dashboard-tab-container {
            margin-bottom: 16px;
            gap: 6px;
          }
          
          .dashboard-tab-button {
            padding: 8px 12px;
            font-size: 12px;
            gap: 6px;
          }
          
          .dashboard-search-input {
            padding: 8px 12px;
            font-size: 12px;
          }
          
          .dashboard-card {
            padding: 16px;
            border-radius: 10px;
          }
        }
        
        /* Mobile sidebar improvements */
        @media (max-width: 768px) {
          .mobile-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 280px !important;
            height: 100vh !important;
            z-index: 1000 !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
          }
          
          .mobile-sidebar.open {
            transform: translateX(0);
          }
          
          .mobile-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0, 0, 0, 0.5) !important;
            z-index: 999 !important;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
          }
          
          .mobile-overlay.open {
            opacity: 1;
            visibility: visible;
          }
          
          /* Improve mobile content area */
          .dashboard-content-area {
            margin-top: 60px !important;
          }
          
          /* Better mobile spacing */
          .dashboard-sidebar-section {
            padding: 0 16px !important;
            margin-bottom: 24px !important;
          }
          
          .dashboard-sidebar-item {
            padding: 12px 16px !important;
            margin-bottom: 4px !important;
            border-radius: 8px !important;
          }
        }
        
        @media (max-width: 480px) {
          .mobile-sidebar {
            width: 100% !important;
          }
          
          .dashboard-sidebar-section {
            padding: 0 12px !important;
            margin-bottom: 20px !important;
          }
          
          .dashboard-sidebar-item {
            padding: 10px 12px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
    </>
  )
}
