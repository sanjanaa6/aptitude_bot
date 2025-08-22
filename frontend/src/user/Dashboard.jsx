import React, { useEffect, useMemo, useState } from 'react'
import { getSections, explainTopic, me, getUserProgress, getProgressSummary, updateProgress } from '../api.js'
import SectionsPanel from '../components/SectionsPanel.jsx'
import ExplanationView from '../components/ExplanationView.jsx'
import Chat from '../components/Chat.jsx'
import Quiz from '../components/Quiz.jsx'
import Bookmarks from '../components/Bookmarks.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import { useNavigate } from 'react-router-dom'

const pageStyle = { minHeight: '100vh', background: '#f7fafc', fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', display: 'flex', flexDirection: 'column' }
const headerStyle = { background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', padding: '16px', color: 'white' }
const headerInnerStyle = { width: '100%', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }
const contentWrapStyle = { width: '100vw', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: '360px 1fr', gap: 0, flex: 1 }
const statPill = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: '6px 10px', fontSize: 12 }
const cardStyle = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 0, padding: 16 }
const sectionScrollStyle = { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }

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

	return (
		<div style={pageStyle}>
			<header style={headerStyle}>
				<div style={headerInnerStyle}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
						<div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 12l2-2 4 4 8-8 2 2-10 10z"/></svg>
						</div>
						<div>
							<div style={{ fontWeight: 700 }}>Quantitative Tutor</div>
							<div style={{ fontSize: 12, opacity: 0.85 }}>Welcome, {userLabel}</div>
						</div>
					</div>
					<div style={{ marginLeft: 'auto' }}>
						<button onClick={() => { const el = document.getElementById('chatCard'); if (el) el.scrollIntoView({ behavior: 'smooth' }) }} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', marginRight: 8 }}>Go to Chat</button>
						<button onClick={() => { localStorage.removeItem('qc_token'); navigate('/login') }} style={{ background: 'white', color: '#e11d48', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 600 }}>Logout</button>
					</div>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
					<div style={statPill}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>{progressSummary ? `${progressSummary.progress_percentage}% completed` : 'Loading progress...'}</div>
					<div style={statPill}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2v20"/><path d="M5 9l7-7 7 7"/></svg>{streakDays} day{streakDays === 1 ? '' : 's'} streak</div>
					{badges.map((b, i) => (<div key={i} style={statPill}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 17l-5 3 1-5-4-4 5-1 3-5 3 5 5 1-4 4 1 5z"/></svg>{b}</div>))}
				</div>
			</header>

			<main style={contentWrapStyle}>
				<div style={{ display: 'grid', gap: 0, alignSelf: 'stretch' }}>
					<div style={{ borderRight: '1px solid #e5e7eb' }}><ProgressBar progressSummary={progressSummary} /></div>
					<div style={{ ...cardStyle, borderRight: '1px solid #e5e7eb' }}>
						<div style={{ marginBottom: 8 }}><strong style={{ fontSize: 16 }}>Find a Topic</strong></div>
						<input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search topics..." style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none', marginBottom: 10 }} />
						<div style={sectionScrollStyle}>
							<SectionsPanel sections={filteredSections} selectedTopic={selectedTopic} onSelectTopic={handleSelect} defaultOpen={true} progress={progress} />
						</div>
					</div>
				</div>
				<div id="chatCard" style={cardStyle}>
					<div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
						<div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4 }}>
							<button onClick={() => setTab('explanation')} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: tab === 'explanation' ? 'white' : 'transparent', cursor: 'pointer' }}>Explanation</button>
							<button onClick={() => setTab('chat')} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: tab === 'chat' ? 'white' : 'transparent', cursor: 'pointer' }}>Chat</button>
							<button onClick={() => setTab('quiz')} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: tab === 'quiz' ? 'white' : 'transparent', cursor: 'pointer' }}>Quiz</button>
							<button onClick={() => setTab('bookmarks')} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: tab === 'bookmarks' ? 'white' : 'transparent', cursor: 'pointer' }}>Bookmarks</button>
						</div>
						<span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>{selectedTopic ? `Topic: ${selectedTopic}` : 'No topic selected'}</span>
					</div>
					{tab === 'explanation' ? (
						<div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
							<div style={{ fontWeight: 600, marginBottom: 8 }}>Explanation</div>
							<ExplanationView topic={selectedTopic} loading={loading} error={error} content={explanation} />
						</div>
					) : tab === 'chat' ? (
						<div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
							<div style={{ fontWeight: 600, marginBottom: 8 }}>Chat</div>
							<Chat height={'calc(100vh - 200px)'} />
						</div>
					) : tab === 'quiz' ? (
						<div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
							<div style={{ fontWeight: 600, marginBottom: 8 }}>Quiz</div>
							<Quiz selectedTopic={selectedTopic} onClose={() => setTab('explanation')} />
						</div>
					) : (
						<div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
							<div style={{ fontWeight: 600, marginBottom: 8 }}>Bookmarks</div>
							<Bookmarks selectedTopic={selectedTopic} />
						</div>
					)}
				</div>
			</main>
		</div>
	)
}


