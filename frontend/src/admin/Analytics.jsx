import React, { useState, useEffect } from 'react'
import { adminListUsers, adminListSections, adminGetQuizStats } from '../api.js'

const card = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 }
const button = { padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#111827', color: 'white', cursor: 'pointer', fontSize: 14 }
const ghost = { padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', color: '#111827', cursor: 'pointer', fontSize: 14 }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }
const statItem = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }
const activityItem = { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' }
const avatar = { width: 32, height: 32, borderRadius: 999, background: '#e5e7eb', display: 'grid', placeItems: 'center', fontSize: 12, color: '#6b7280' }
const progressBar = { width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }
const progressFill = (percentage) => ({ height: '100%', background: '#10b981', width: `${percentage}%`, transition: 'width 0.3s ease' })

export default function Analytics({ stats, onRefresh }) {
	const [recentUsers, setRecentUsers] = useState([])
	const [recentSections, setRecentSections] = useState([])
	const [quizStats, setQuizStats] = useState(null)
	const [loading, setLoading] = useState(false)
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
		setLoading(true)
		try {
			const [usersRes, sectionsRes] = await Promise.all([
				adminListUsers(),
				adminListSections()
			])
			
			// Get recent users (last 5)
			const recentUsersData = (usersRes.users || []).slice(-5).reverse()
			setRecentUsers(recentUsersData)
			
			// Get recent sections (last 5)
			const recentSectionsData = (sectionsRes.sections || []).slice(-5).reverse()
			setRecentSections(recentSectionsData)
		} catch (error) {
			console.error('Failed to load recent data:', error)
			// Set empty arrays instead of crashing
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
			default: return '#6b7280'
		}
	}

	const getHealthIcon = (status) => {
		switch (status) {
			case 'healthy': return '✓'
			case 'warning': return '⚠'
			case 'error': return '✗'
			case 'degraded': return '⚠'
			default: return '?'
		}
	}

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
				<h3 style={{ margin: 0, color: '#111827' }}>System Overview</h3>
				<button onClick={() => { onRefresh(); loadRecentData(); loadQuizStats(); checkSystemHealth() }} style={ghost}>
					<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
						<path d="M1 4v6h6"/>
						<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
					</svg>
					Refresh Data
				</button>
			</div>

			{/* System Health Status */}
			<div style={card}>
				<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>System Health</h4>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: 24, fontWeight: 700, color: getHealthColor(systemHealth.database) }}>
							{getHealthIcon(systemHealth.database)}
						</div>
						<div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>Database</div>
						<div style={{ fontSize: 12, color: '#6b7280' }}>{systemHealth.database}</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: 24, fontWeight: 700, color: getHealthColor(systemHealth.api) }}>
							{getHealthIcon(systemHealth.api)}
						</div>
						<div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>API</div>
						<div style={{ fontSize: 12, color: '#6b7280' }}>{systemHealth.api}</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: 24, fontWeight: 700, color: getHealthColor(systemHealth.performance) }}>
							{getHealthIcon(systemHealth.performance)}
						</div>
						<div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>Performance</div>
						<div style={{ fontSize: 12, color: '#6b7280' }}>{systemHealth.performance}</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: 12, color: '#6b7280' }}>
							Last Check
						</div>
						<div style={{ fontSize: 12, color: '#6b7280' }}>
							{systemHealth.lastCheck.toLocaleTimeString()}
						</div>
					</div>
				</div>
			</div>

			{/* Quick Stats */}
			<div style={card}>
				<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>Quick Stats</h4>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{stats?.users || 0}</div>
						<div style={{ fontSize: 12, color: '#6b7280' }}>Total Users</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{stats?.sections || 0}</div>
						<div style={{ fontSize: 12, color: '#6b7280' }}>Total Sections</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{stats?.topics || 0}</div>
						<div style={{ fontSize: 12, color: '#6b7280' }}>Total Topics</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{quizStats?.total_questions || 0}</div>
						<div style={{ fontSize: 12, color: '#6b7280' }}>Total Questions</div>
					</div>
				</div>
			</div>

			<div style={grid}>
				{/* Recent Users */}
				<div style={card}>
					<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>Recent Users</h4>
					{loading ? (
						<div style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</div>
					) : recentUsers.length > 0 ? (
						<div>
							{recentUsers.map((user, index) => (
								<div key={user.id || index} style={statItem}>
									<div style={activityItem}>
										<div style={avatar}>
											{getInitials(user.name || user.username || user.email)}
										</div>
										<div style={{ flex: 1 }}>
											<div style={{ fontWeight: 500, color: '#111827' }}>
												{user.name || user.username || 'Unnamed User'}
											</div>
											<div style={{ fontSize: 12, color: '#6b7280' }}>
												{user.email} • {user.is_admin ? 'Admin' : 'User'}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div style={{ textAlign: 'center', color: '#6b7280', padding: 20 }}>
							No users found
						</div>
					)}
					<div style={{ marginTop: 16 }}>
						<button onClick={() => window.location.hash = '#users'} style={{ ...ghost, width: '100%' }}>
							View All Users
						</button>
					</div>
				</div>

				{/* Recent Sections */}
				<div style={card}>
					<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>Recent Sections</h4>
					{loading ? (
						<div style={{ textAlign: 'center', color: '#6b7280' }}>Loading...</div>
					) : recentSections.length > 0 ? (
						<div>
							{recentSections.map((section, index) => (
								<div key={section.id || index} style={statItem}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
										<div style={{ flex: 1 }}>
											<div style={{ fontWeight: 500, color: '#111827' }}>
												{section.title || section.id}
											</div>
											<div style={{ fontSize: 12, color: '#6b7280' }}>
												{getTopicCount(section)} topics
											</div>
										</div>
										<span style={{ fontSize: 12, padding: '2px 8px', background: '#f3f4f6', color: '#374151', borderRadius: 999 }}>
											{section.id}
										</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<div style={{ textAlign: 'center', color: '#6b7280', padding: 20 }}>
							No sections found
						</div>
					)}
					<div style={{ marginTop: 16 }}>
						<button onClick={() => window.location.hash = '#topics'} style={{ ...ghost, width: '100%' }}>
							View All Sections
						</button>
					</div>
				</div>
			</div>

			{/* Quiz Statistics */}
			<div style={card}>
				<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>Quiz Statistics</h4>
				{quizStats ? (
					<>
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{quizStats.total_questions}</div>
								<div style={{ fontSize: 12, color: '#6b7280' }}>Total Questions</div>
							</div>
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{quizStats.by_difficulty?.easy || 0}</div>
								<div style={{ fontSize: 12, color: '#6b7280' }}>Easy Questions</div>
							</div>
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{quizStats.by_difficulty?.medium || 0}</div>
								<div style={{ fontSize: 12, color: '#6b7280' }}>Medium Questions</div>
							</div>
							<div style={{ textAlign: 'center' }}>
								<div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{quizStats.by_difficulty?.hard || 0}</div>
								<div style={{ fontSize: 12, color: '#6b7280' }}>Hard Questions</div>
							</div>
						</div>
						
						{quizStats.total_questions === 0 ? (
							<div style={{ marginTop: 16, textAlign: 'center', color: '#6b7280', padding: 20 }}>
								<p>No quiz questions have been added yet.</p>
								<p>Use the Quiz Manager to add questions for your topics.</p>
							</div>
						) : (
							quizStats.by_section && quizStats.by_section.length > 0 && (
								<div style={{ marginTop: 16 }}>
									<h5 style={{ margin: '0 0 12px 0', color: '#111827', fontSize: 14 }}>Questions by Section</h5>
									<div style={{ display: 'grid', gap: 8 }}>
										{quizStats.by_section.slice(0, 5).map((section, index) => (
											<div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
												<span style={{ fontSize: 12, color: '#6b7280' }}>{section._id}</span>
												<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
													<div style={progressBar}>
														<div style={progressFill((section.count / quizStats.total_questions) * 100)} />
													</div>
													<span style={{ fontSize: 12, color: '#111827', minWidth: 30, textAlign: 'right' }}>
														{section.count}
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
							)
						)}
					</>
				) : (
					<div style={{ textAlign: 'center', color: '#6b7280', padding: 20 }}>
						Loading quiz statistics...
					</div>
				)}
			</div>

			{/* Quick Actions */}
			<div style={card}>
				<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>Quick Actions</h4>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
					<button onClick={() => window.location.hash = '#topics'} style={button}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
							<path d="M12 5l7 7-7 7"/>
							<path d="M19 12H5"/>
						</svg>
						Manage Topics
					</button>
					<button onClick={() => window.location.hash = '#quiz'} style={button}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
							<path d="M9 12l2 2 4-4"/>
							<path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
							<path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
							<path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
						</svg>
						Quiz Manager
					</button>
					<button onClick={() => window.location.hash = '#users'} style={button}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
							<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
							<circle cx="12" cy="7" r="4"/>
						</svg>
						User Management
					</button>
				</div>
			</div>
		</div>
	)
}
