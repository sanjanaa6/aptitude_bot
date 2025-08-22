import React, { useEffect, useState } from 'react'
import { adminListSections, adminCreateSection, adminUpdateSection, adminDeleteSection, adminSeedDefaultSections } from '../api.js'
import TopicsPanel from '../components/TopicsPanel.jsx'

// Modern UI Components
const container = { padding: '24px', background: '#f8fafc', minHeight: '100vh' }
const header = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '32px',
  background: 'white',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
}
const title = { margin: 0, fontSize: '28px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }
const subtitle = { margin: '8px 0 0 0', fontSize: '16px', color: '#6b7280', fontWeight: '400' }

const card = { 
  background: 'white', 
  border: '1px solid #e5e7eb', 
  borderRadius: '16px', 
  padding: '24px', 
  marginBottom: '24px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  transition: 'all 0.2s ease'
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }
const miniGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }

const input = { 
  padding: '12px 16px', 
  border: '1px solid #e5e7eb', 
  borderRadius: '12px', 
  width: '100%', 
  fontSize: '14px',
  transition: 'all 0.2s ease',
  background: 'white'
}

const textarea = { 
  ...input, 
  minHeight: '120px', 
  resize: 'vertical',
  fontFamily: 'inherit'
}

const button = { 
  padding: '12px 20px', 
  border: '1px solid #e5e7eb', 
  borderRadius: '12px', 
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
  color: 'white', 
  cursor: 'pointer', 
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
}

const buttonSecondary = { 
  ...button, 
  background: 'white',
  color: '#374151',
  border: '1px solid #e5e7eb'
}

const buttonDanger = { 
  ...button, 
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
}

const buttonSuccess = { 
  ...button, 
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
}

const searchInput = { 
  ...input, 
  maxWidth: '400px',
  background: 'white',
  border: '1px solid #e5e7eb'
}

const table = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '16px',
  background: 'white',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
}

const tableHeader = {
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  borderBottom: '2px solid #e5e7eb',
  padding: '16px 20px',
  textAlign: 'left',
  fontWeight: '600',
  color: '#374151',
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}

const tableRow = {
  borderBottom: '1px solid #f3f4f6',
  transition: 'all 0.2s ease'
}

const tableCell = {
  padding: '16px 20px',
  fontSize: '14px',
  color: '#374151',
  verticalAlign: 'top'
}

const badge = (color) => ({
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  color: color,
  background: `${color}15`,
  border: `1px solid ${color}30`,
  display: 'inline-block'
})

const statsCard = (color) => ({
  background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
  border: `1px solid ${color}20`,
  borderRadius: '16px',
  padding: '20px',
  textAlign: 'center',
  transition: 'all 0.2s ease'
})

const statsNumber = (color) => ({
  fontSize: '32px',
  fontWeight: '800',
  color: color,
  marginBottom: '8px'
})

const statsLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
}

const filterBar = {
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  marginBottom: '24px',
  flexWrap: 'wrap'
}

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
  const [editingSection, setEditingSection] = useState(null)

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
      const payload = { 
        id: form.id, 
        title: form.title, 
        topics: form.topics.split('\n').map(s=>s.trim()).filter(Boolean) 
      }
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
      setEditingSection(null)
    } catch (e) { 
      alert('Update failed') 
    }
	}

	const remove = async (sec) => {
		if (!confirm('Delete section?')) return
    try { 
      await adminDeleteSection(sec.id) 
      await load() 
    } catch (e) { 
      alert('Delete failed') 
    }
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

  const selectAll = () => {
    if (bulkSelection.length === filteredSections.length) {
      setBulkSelection([])
    } else {
      setBulkSelection(filteredSections.map(s => s.id))
    }
  }

  const getTotalTopics = () => {
    return sections.reduce((sum, section) => sum + (section.topics?.length || 0), 0)
  }

  const getTotalSections = () => sections.length

	return (
    <div style={container}>
      {/* Header */}
      <div style={header}>
		<div>
          <div style={title}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
            Topics Management
          </div>
          <div style={subtitle}>
            Organize your content into sections and topics
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setShowForm(!showForm)} style={button}>
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {showForm ? 'Cancel' : 'Add Section'}
          </button>
          <button onClick={adminSeedDefaultSections} style={buttonSecondary}>
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Seed Default
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div style={grid}>
        <div style={statsCard('#3b82f6')}>
          <div style={statsNumber('#3b82f6')}>{getTotalSections()}</div>
          <div style={statsLabel}>Total Sections</div>
        </div>
        <div style={statsCard('#10b981')}>
          <div style={statsNumber('#10b981')}>{getTotalTopics()}</div>
          <div style={statsLabel}>Total Topics</div>
        </div>
        <div style={statsCard('#f59e0b')}>
          <div style={statsNumber('#f59e0b')}>{sections.filter(s => s.topics?.length > 0).length}</div>
          <div style={statsLabel}>Active Sections</div>
        </div>
        <div style={statsCard('#ef4444')}>
          <div style={statsNumber('#ef4444')}>{sections.filter(s => !s.topics?.length).length}</div>
          <div style={statsLabel}>Empty Sections</div>
						</div>
					</div>

      {/* Add Section Form */}
      {showForm && (
						<div style={card}>
          <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '600' }}>
            Add New Section
          </h3>
          
          <div style={grid}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Section ID *
              </label>
              <input
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                placeholder="e.g., math, science, history"
                style={input}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Section Title *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Mathematics, Science, History"
                style={input}
                required
							/>
						</div>
					</div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Topics (one per line) *
            </label>
            <textarea
              value={form.topics}
              onChange={(e) => setForm({ ...form, topics: e.target.value })}
              placeholder="Enter topics, one per line:&#10;Algebra&#10;Geometry&#10;Calculus"
              style={textarea}
              required
            />
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button onClick={create} style={button}>
              Create Section
            </button>
            <button onClick={() => setShowForm(false)} style={buttonSecondary}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div style={card}>
        <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '600' }}>
          Search & Filter
        </h3>
        
        <div style={filterBar}>
          <input
            type="text"
            placeholder="Search sections, topics, or IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInput}
          />
          
          <button onClick={() => setSearchTerm('')} style={buttonSecondary}>
            Clear Search
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Showing {filteredSections.length} of {sections.length} sections
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {loading ? 'Loading...' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkSelection.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '16px', color: '#374151' }}>
              {bulkSelection.length} section(s) selected
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={bulkDelete} style={buttonDanger}>
                <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Delete Selected
              </button>
              <button onClick={() => setBulkSelection([])} style={buttonSecondary}>
                Clear Selection
              </button>
            </div>
          </div>
				</div>
      )}

      {/* Sections Table */}
      <div style={card}>
        <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '600' }}>
          Sections ({filteredSections.length})
        </h3>
        
        {filteredSections.length > 0 ? (
          <table style={table}>
            <thead>
              <tr>
                <th style={tableHeader}>
                  <input
                    type="checkbox"
                    checked={bulkSelection.length === filteredSections.length && filteredSections.length > 0}
                    onChange={selectAll}
                    style={{ margin: 0 }}
                  />
                </th>
                <th style={tableHeader}>Section</th>
                <th style={tableHeader}>Topics</th>
                <th style={tableHeader}>Status</th>
                <th style={tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSections.map((section, index) => (
                <tr key={section.id || index} style={tableRow} onMouseEnter={(e) => e.target.closest('tr').style.background = '#f9fafb'}>
                  <td style={tableCell}>
                    <input
                      type="checkbox"
                      checked={bulkSelection.includes(section.id)}
                      onChange={() => toggleBulkSelection(section.id)}
                      style={{ margin: 0 }}
                    />
                  </td>
                  <td style={tableCell}>
				<div>
                      <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                        {section.title || section.id}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        ID: {section.id}
                      </div>
                    </div>
                  </td>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {section.topics?.map((topic, topicIndex) => (
                        <span key={topicIndex} style={badge('#3b82f6')}>
                          {topic}
                        </span>
                      )) || (
                        <span style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                          No topics
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={tableCell}>
                    <span style={badge(section.topics?.length > 0 ? '#10b981' : '#f59e0b')}>
                      {section.topics?.length > 0 ? 'Active' : 'Empty'}
                    </span>
                  </td>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingSection?.id === section.id ? (
                        <>
                          <button
                            onClick={() => save(editingSection)}
                            style={{ ...buttonSuccess, padding: '8px 12px', fontSize: '12px' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSection(null)}
                            style={{ ...buttonSecondary, padding: '8px 12px', fontSize: '12px' }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingSection(section)}
                            style={{ ...buttonSecondary, padding: '8px 12px', fontSize: '12px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => remove(section)}
                            style={{ ...buttonDanger, padding: '8px 12px', fontSize: '12px' }}
                          >
                            Delete
                          </button>
                        </>
                      )}
								</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px 20px' }}>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>
              {loading ? 'Loading sections...' : 'No sections found'}
								</div>
            <div style={{ fontSize: '14px' }}>
              {!loading && 'Try adjusting your search or create some sections to get started.'}
								</div>
							</div>
        )}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div style={card}>
          <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '600' }}>
            Edit Section: {editingSection.title || editingSection.id}
          </h3>
          
          <div style={grid}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Section Title
              </label>
              <input
                value={editingSection.title || ''}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                style={input}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Topics Count
              </label>
              <div style={{ fontSize: '14px', color: '#6b7280', padding: '12px 16px', background: '#f9fafb', borderRadius: '12px' }}>
                {editingSection.topics?.length || 0} topics
					</div>
				</div>
			</div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Topics (one per line)
            </label>
            <textarea
              value={editingSection.topics?.join('\n') || ''}
              onChange={(e) => setEditingSection({ 
                ...editingSection, 
                topics: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) 
              })}
              placeholder="Enter topics, one per line"
              style={textarea}
            />
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button onClick={() => save(editingSection)} style={buttonSuccess}>
              Save Changes
            </button>
            <button onClick={() => setEditingSection(null)} style={buttonSecondary}>
              Cancel
            </button>
          </div>
        </div>
      )}
		</div>
	)
}