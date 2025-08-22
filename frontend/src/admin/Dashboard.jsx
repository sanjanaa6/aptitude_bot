import React, { useEffect, useState } from 'react'
import { me, adminListUsers, adminListSections } from '../api.js'
import Users from './Users.jsx'
import Topics from './Topics.jsx'
import Analytics from './Analytics.jsx'
import QuizManager from './QuizManager.jsx'
import { Navigate } from 'react-router-dom'

const layout = { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh', background: '#f8fafc' }
const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #e5e7eb', background: 'white', position: 'sticky', top: 0, zIndex: 10 }
const sidebar = { background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }
const brand = { display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderBottom: '1px solid #f1f5f9' }
const navBtn = (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', margin: '6px 10px', borderRadius: 10, border: '1px solid #e5e7eb', background: active ? '#eef2ff' : 'white', color: active ? '#3730a3' : '#111827', cursor: 'pointer' })
const content = { padding: 16 }
const badge = { fontSize: 12, padding: '4px 8px', background: '#eef2ff', color: '#3730a3', borderRadius: 999, border: '1px solid #e5e7eb' }

export default function AdminDashboard() {
	const [tab, setTab] = useState('overview')
	const [isAdmin, setIsAdmin] = useState(false)
	const [loading, setLoading] = useState(true)
	const [adminName, setAdminName] = useState('Admin')
	const [stats, setStats] = useState({ users: 0, sections: 0, topics: 0 })

	useEffect(() => {
		me().then((r) => {
			setIsAdmin(!!r?.user?.is_admin)
			setAdminName(r?.user?.username || r?.user?.email || 'Admin')
		}).catch(() => setIsAdmin(false)).finally(() => setLoading(false))
	}, [])

	useEffect(() => {
		loadStats()
	}, [])

	const loadStats = async () => {
		try {
			const [usersRes, sectionsRes] = await Promise.all([
				adminListUsers(),
				adminListSections()
			])
			
			const totalUsers = usersRes.users?.length || 0
			const totalSections = sectionsRes.sections?.length || 0
			const totalTopics = sectionsRes.sections?.reduce((sum, section) => sum + (section.topics?.length || 0), 0) || 0
			
			setStats({
				users: totalUsers,
				sections: totalSections,
				topics: totalTopics
			})
		} catch (error) {
			console.error('Failed to load stats:', error)
		}
	}

	const renderContent = () => {
		switch (tab) {
			case 'overview':
				return <Analytics stats={stats} onRefresh={loadStats} />
			case 'users':
				return <Users />
			case 'topics':
				return <Topics />
			case 'quiz':
				return <QuizManager />
			default:
				return <Analytics stats={stats} onRefresh={loadStats} />
		}
	}

	const getTabTitle = () => {
		switch (tab) {
			case 'overview': return 'System Overview'
			case 'users': return 'User Management'
			case 'topics': return 'Topics Management'
			case 'quiz': return 'Quiz Manager'
			default: return 'System Overview'
		}
	}

	const getTabBadge = () => {
		switch (tab) {
			case 'overview': return 'Dashboard'
			case 'users': return 'CRUD'
			case 'topics': return 'Sections & Topics'
			case 'quiz': return 'Questions'
			default: return 'Dashboard'
		}
	}

	if (loading) return <div style={{ padding: 16 }}>Loading...</div>
	if (!isAdmin) return <Navigate to="/dashboard" replace />

	return (
		<div style={layout}>
			{/* Sidebar */}
			<aside style={sidebar}>
				<div style={brand}>
					<div style={{ width: 32, height: 32, borderRadius: 8, background: '#111827', display: 'grid', placeItems: 'center' }}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="2"><path d="M3 12l2-2 4 4 8-8 2 2-10 10z"/></svg>
					</div>
					<div>
						<div style={{ fontWeight: 700 }}>Admin</div>
						<div style={{ fontSize: 12, color: '#64748b' }}>Console</div>
					</div>
				</div>
				
				{/* Navigation Buttons */}
				<button onClick={() => setTab('overview')} style={navBtn(tab==='overview')}>
					<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
					Overview
				</button>
				<button onClick={() => setTab('users')} style={navBtn(tab==='users')}>
					<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
					Users
				</button>
				<button onClick={() => setTab('topics')} style={navBtn(tab==='topics')}>
					<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
					Topics
				</button>
				<button onClick={() => setTab('quiz')} style={navBtn(tab==='quiz')}>
					<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2"><path d="M9 12l2 2 4-4"/><path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/><path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/><path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/></svg>
					Quiz Manager
				</button>
				
				<div style={{ marginTop: 'auto', padding: 12, fontSize: 12, color: '#6b7280' }}>v1.0</div>
			</aside>

			{/* Main */}
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<div style={header}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
						<h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>{getTabTitle()}</h2>
						<span style={badge}>{getTabBadge()}</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<span style={{ fontSize: 13, color: '#6b7280' }}>{adminName}</span>
						<div style={{ width: 28, height: 28, borderRadius: 999, background: '#e5e7eb', display: 'grid', placeItems: 'center' }}>
							<svg width="14" height="14" viewBox="0 0 24 24" stroke="#374151" fill="none" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
						</div>
					</div>
				</div>
				<main style={content}>
					{renderContent()}
				</main>
			</div>
		</div>
	)
}


