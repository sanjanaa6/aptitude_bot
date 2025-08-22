import React, { useEffect, useState } from 'react'
import { adminListSections, adminCreateSection, adminUpdateSection, adminDeleteSection, adminSeedDefaultSections } from '../api.js'
import TopicsPanel from '../components/TopicsPanel.jsx'

const card = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 }
const input = { padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, width: '100%', fontSize: 14 }
const textarea = { padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, width: '100%', fontSize: 14, minHeight: 140, resize: 'vertical' }
const button = { padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#111827', color: 'white', cursor: 'pointer', fontSize: 14 }
const ghost = { padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', color: '#111827', cursor: 'pointer', fontSize: 14 }
const danger = { padding: '8px 16px', border: '1px solid #dc2626', borderRadius: 8, background: 'white', color: '#dc2626', cursor: 'pointer', fontSize: 14 }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }
const searchInput = { padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, width: '100%', fontSize: 14, background: 'white' }
const sectionCard = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12 }
const badge = { fontSize: 12, padding: '4px 8px', background: '#eef2ff', color: '#3730a3', borderRadius: 999, border: '1px solid #e5e7eb' }
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }

export default function Topics() {
	const [sections, setSections] = useState([])
	const [filteredSections, setFilteredSections] = useState([])
	const [loading, setLoading] = useState(false)
	const [form, setForm] = useState({ id: '', title: '', topics: '' })
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedSection, setSelectedSection] = useState(null)
	const [showForm, setShowForm] = useState(false)
	const [bulkSelection, setBulkSelection] = useState([])

	const load = async () => {
		setLoading(true)
		setError('')
		try {
			const res = await adminListSections()
			const sectionsData = res.sections || []
			setSections(sectionsData)
			setFilteredSections(sectionsData)
		} catch (e) {
			setError(e.message || 'Failed to load sections')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [])

	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredSections(sections)
		} else {
			const filtered = sections.filter(section => 
				section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				section.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
				section.topics?.some(topic => 
					topic.toLowerCase().includes(searchTerm.toLowerCase())
				)
			)
			setFilteredSections(filtered)
		}
	}, [searchTerm, sections])

	const create = async () => {
		try {
			const payload = { id: form.id, title: form.title, topics: form.topics.split('\n').map(s=>s.trim()).filter(Boolean) }
			await adminCreateSection(payload)
			setForm({ id: '', title: '', topics: '' })
			setShowForm(false)
			await load()
		} catch (e) {
			alert(e.message || 'Failed to create section')
		}
	}

	const save = async (sec) => {
		try {
			await adminUpdateSection(sec.id, sec)
			await load()
		} catch (e) { alert('Update failed') }
	}

	const remove = async (sec) => {
		if (!confirm('Delete section?')) return
		try { await adminDeleteSection(sec.id) ; await load() } catch (e) { alert('Delete failed') }
	}

	const bulkDelete = async () => {
		if (!confirm(`Are you sure you want to delete ${bulkSelection.length} sections?`)) return
		try {
			await Promise.all(bulkSelection.map(id => adminDeleteSection(id)))
			setBulkSelection([])
			await load()
		} catch (e) {
			alert('Bulk delete failed')
		}
	}

	const toggleBulkSelection = (sectionId) => {
		setBulkSelection(prev => 
			prev.includes(sectionId) 
				? prev.filter(id => id !== sectionId)
				: [...prev, sectionId]
		)
	}

	const getTotalTopics = () => sections.reduce((sum, sec) => sum + (sec.topics?.length || 0), 0)
	const getAverageTopicsPerSection = () => sections.length > 0 ? (getTotalTopics() / sections.length).toFixed(1) : 0

	return (
		<div>
			{/* Header with Stats */}
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
				<h3 style={{ margin: 0, color: '#111827' }}>Topics & Sections Management</h3>
				<div style={{ display: 'flex', gap: 8 }}>
					<button onClick={() => setShowForm(!showForm)} style={button}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
							<path d="M12 5v14M5 12h14"/>
						</svg>
						{showForm ? 'Cancel' : 'Add Section'}
					</button>
					<button onClick={async ()=>{ await adminSeedDefaultSections(); await load() }} style={ghost}>
						<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 8 }}>
							<path d="M1 4v6h6"/>
							<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
						</svg>
						Seed Defaults
					</button>
				</div>
			</div>

			{/* Stats Overview */}
			<div style={statsGrid}>
				<div style={card}>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{sections.length}</div>
						<div style={{ fontSize: 12, color: '#6b7280' }}>Total Sections</div>
					</div>
				</div>
				<div style={card}>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{getTotalTopics()}</div>
						<div style={{ fontSize: 12, color: '#6b7280' }}>Total Topics</div>
					</div>
				</div>
				<div style={card}>
					<div style={{ textAlign: 'center' }}>
						<div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{getAverageTopicsPerSection()}</div>
						<div style={{ fontSize: 12, color: '#6b7280' }}>Avg Topics/Section</div>
					</div>
				</div>
			</div>

			{loading ? <div style={{ textAlign: 'center', color: '#6b7280', padding: 20 }}>Loading...</div> : null}
			{error ? <div style={{ color: '#b91c1c', padding: 16, background: '#fef2f2', borderRadius: 8, marginBottom: 16 }}>{error}</div> : null}

			{/* Create Section Form */}
			{showForm && (
				<div style={card}>
					<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>Create New Section</h4>
					<div style={{ display: 'grid', gap: 12 }}>
						<div>
							<label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
								Section ID (unique identifier)
							</label>
							<input 
								style={input} 
								placeholder="e.g., arithmetic-ability" 
								value={form.id} 
								onChange={e=>setForm({...form, id:e.target.value})} 
							/>
						</div>
						<div>
							<label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
								Section Title
							</label>
							<input 
								style={input} 
								placeholder="e.g., Section I: Arithmetical Ability" 
								value={form.title} 
								onChange={e=>setForm({...form, title:e.target.value})} 
							/>
						</div>
						<div>
							<label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
								Topics (one per line)
							</label>
							<textarea 
								style={textarea} 
								placeholder="1. Number System\n2. H.C.F. and L.C.M. of Numbers\n3. Decimal Fractions..." 
								value={form.topics} 
								onChange={e=>setForm({...form, topics:e.target.value})} 
							/>
						</div>
						<div style={{ display: 'flex', gap: 8 }}>
							<button onClick={create} style={button}>Create Section</button>
							<button onClick={() => setShowForm(false)} style={ghost}>Cancel</button>
						</div>
					</div>
				</div>
			)}

			{/* Search and Bulk Actions */}
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
				<div style={{ flex: 1, maxWidth: 400 }}>
					<input
						style={searchInput}
						placeholder="Search sections, topics, or IDs..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				{bulkSelection.length > 0 && (
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<span style={{ fontSize: 14, color: '#6b7280' }}>
							{bulkSelection.length} selected
						</span>
						<button onClick={bulkDelete} style={danger}>
							Delete Selected
						</button>
					</div>
				)}
			</div>

			<div style={grid}>
				{/* All Topics Overview */}
				<div>
					<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>All Topics Overview</h4>
					<div style={card}>
						<TopicsPanel
							topics={[...new Set(sections.flatMap(s => s.topics || []))]}
							selected={null}
							onSelect={() => {}}
							enableAdd={sections.length > 0}
							onAdd={(t) => {
								const first = sections[0]
								if (!first) return
								const updated = { ...first, topics: [...(first.topics || []), t] }
								save(updated)
							}}
						/>
					</div>
				</div>

				{/* Sections Management */}
				<div>
					<h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>
						Sections ({filteredSections.length})
					</h4>
					<div style={{ display: 'grid', gap: 12 }}>
						{filteredSections.map((sec) => (
							<div key={sec.id} style={sectionCard}>
								{/* Bulk Selection Checkbox */}
								<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
									<input
										type="checkbox"
										checked={bulkSelection.includes(sec.id)}
										onChange={() => toggleBulkSelection(sec.id)}
										style={{ margin: 0 }}
									/>
									<span style={{ fontSize: 12, color: '#6b7280' }}>
										{sec.topics?.length || 0} topics
									</span>
								</div>

								{/* Section ID and Title */}
								<div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
									<input 
										value={sec.id} 
										readOnly 
										style={{ ...input, width: 140, background: '#f9fafb' }} 
									/>
									<input 
										value={sec.title} 
										onChange={e=>setSections(sections.map(s=>s.id===sec.id?{...s, title:e.target.value}:s))} 
										style={{ ...input, flex: 1 }} 
									/>
								</div>

								{/* Topics Textarea */}
								<div>
									<textarea 
										rows={6} 
										value={(sec.topics || []).join('\n')} 
										onChange={e=>setSections(sections.map(s=>s.id===sec.id?{...s, topics:e.target.value.split('\n')}:s))} 
										style={{ ...textarea, minHeight: 120 }} 
									/>
								</div>

								{/* Action Buttons */}
								<div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
									<button onClick={() => save(sec)} style={ghost}>
										<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 6 }}>
											<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
											<polyline points="17,21 17,13 7,13 7,21"/>
											<polyline points="7,3 7,8 15,8"/>
										</svg>
										Save
									</button>
									<button onClick={() => remove(sec)} style={danger}>
										<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: 6 }}>
											<polyline points="3,6 5,6 21,6"/>
											<path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
										</svg>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
					
					{filteredSections.length === 0 && (
						<div style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>
							{searchTerm ? 'No sections match your search' : 'No sections found'}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}