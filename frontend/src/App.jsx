import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { getSections, explainTopic, me } from './api.js'
import SectionsPanel from './components/SectionsPanel.jsx'
import ExplanationView from './components/ExplanationView.jsx'
import Chat from './components/Chat.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

const containerStyle = {
  display: 'flex',
  height: '100vh',
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
}

const sidebarStyle = {
  width: 300,
  borderRight: '1px solid #e5e7eb',
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
}

const contentStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
}

const topBarStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const mainContentStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
  padding: 16,
  height: '100%',
}

function Dashboard() {
  const [sections, setSections] = useState([])
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(!!localStorage.getItem('qc_token'))
  const navigate = useNavigate()

  useEffect(() => {
    getSections()
      .then((res) => setSections(res.sections || []))
      .catch(() => setSections([]))
  }, [])

  useEffect(() => {
    if (!authed) return
    me().then((r) => {
      const el = document.getElementById('userDisplay')
      if (el) {
        el.textContent = r?.user?.username || r?.user?.email || 'Signed in'
      }
    }).catch(() => {
      // ignore
    })
  }, [authed])

  const handleSelect = async (topic) => {
    setSelectedTopic(topic)
    setExplanation('')
    setError('')
    setLoading(true)
    try {
      const res = await explainTopic(topic)
      setExplanation(res.content || '')
    } catch (e) {
      setError(e.message || 'Failed to fetch explanation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={containerStyle}>
      <aside style={sidebarStyle}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <h3 style={{ margin: '8px 0 12px 0' }}>Sections</h3>
          <SectionsPanel sections={sections} selectedTopic={selectedTopic} onSelectTopic={handleSelect} />
        </div>
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          {authed ? (
            <>
              <span id="userDisplay" style={{ color: '#374151', fontWeight: 600 }}>Signed in</span>
              <button
                onClick={() => { localStorage.removeItem('qc_token'); setAuthed(false); navigate('/login') }}
                style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </div>
          )}
        </div>
      </aside>

      <section style={contentStyle}>
        <div style={topBarStyle}>
          <strong style={{ fontSize: 16 }}>Quantitative Tutor</strong>
          {selectedTopic && (
            <span style={{ color: '#6b7280' }}>— {selectedTopic}</span>
          )}
          <div style={{ marginLeft: 'auto' }}>
            {authed ? (
              <button
                onClick={() => { localStorage.removeItem('qc_token'); setAuthed(false); navigate('/login') }}
                style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>

        <div style={mainContentStyle}>
          <ExplanationView
            topic={selectedTopic}
            loading={loading}
            error={error}
            content={explanation}
          />

          <Chat />
        </div>
      </section>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}


