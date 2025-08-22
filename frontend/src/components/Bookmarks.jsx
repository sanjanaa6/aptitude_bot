import React, { useState, useEffect } from 'react'
import { 
  getBookmarks, 
  createBookmark, 
  updateBookmark, 
  deleteBookmark,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getBookmarksNotesSummary
} from '../api.js'

const containerStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 130px)',
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: '1px solid #e5e7eb',
}

const tabStyle = (isActive) => ({
  padding: '8px 16px',
  border: 'none',
  background: isActive ? '#111827' : '#f3f4f6',
  color: isActive ? 'white' : '#111827',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
})

const formStyle = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  marginBottom: 12,
  fontSize: 14,
}

const textareaStyle = {
  ...inputStyle,
  minHeight: 100,
  resize: 'vertical',
  fontFamily: 'inherit',
}

const buttonStyle = {
  background: '#111827',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  padding: '10px 20px',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  marginRight: 8,
}

const secondaryButtonStyle = {
  ...buttonStyle,
  background: '#6b7280',
}

const itemStyle = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 16,
  marginBottom: 12,
}

const itemHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 8,
}

const itemTitleStyle = {
  margin: '0 0 4px 0',
  fontSize: 16,
  fontWeight: 600,
  color: '#111827',
}

const itemTopicStyle = {
  fontSize: 12,
  color: '#6b7280',
  margin: 0,
}

const itemContentStyle = {
  margin: '8px 0 0 0',
  color: '#374151',
  lineHeight: 1.5,
}

const actionButtonsStyle = {
  display: 'flex',
  gap: 8,
}

const summaryStyle = {
  background: '#f8fafc',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
  fontSize: 14,
}

export default function Bookmarks({ selectedTopic }) {
  const [activeTab, setActiveTab] = useState('bookmarks')
  const [bookmarks, setBookmarks] = useState([])
  const [notes, setNotes] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form states
  const [showBookmarkForm, setShowBookmarkForm] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ title: '', content: '' })

  useEffect(() => {
    loadData()
  }, [selectedTopic])

    const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      // Fetch all bookmarks and notes, regardless of selectedTopic
      const [bookmarksRes, notesRes, summaryRes] = await Promise.all([
        getBookmarks(), // No topic passed here - will fetch all
        getNotes(),     // No topic passed here - will fetch all
        getBookmarksNotesSummary()
      ])

      setBookmarks(bookmarksRes || [])
      setNotes(notesRes || [])
      setSummary(summaryRes || {})
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) return

    setLoading(true)
    try {
      if (activeTab === 'bookmarks') {
        if (editingItem) {
          await updateBookmark(editingItem.id, formData.title, formData.content)
        } else {
          await createBookmark(selectedTopic, formData.title, formData.content)
        }
      } else {
        if (editingItem) {
          await updateNote(editingItem.id, formData.title, formData.content)
        } else {
          await createNote(selectedTopic, formData.title, formData.content)
        }
      }
      
      setFormData({ title: '', content: '' })
      setEditingItem(null)
      setShowBookmarkForm(false)
      setShowNoteForm(false)
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({ title: item.title, content: item.content })
    if (activeTab === 'bookmarks') {
      setShowBookmarkForm(true)
    } else {
      setShowNoteForm(true)
    }
  }

  const handleDelete = async (item) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    setLoading(true)
    try {
      if (activeTab === 'bookmarks') {
        await deleteBookmark(item.id)
      } else {
        await deleteNote(item.id)
      }
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', content: '' })
    setEditingItem(null)
    setShowBookmarkForm(false)
    setShowNoteForm(false)
  }

  const renderForm = () => {
    const isEditing = !!editingItem
    const showForm = activeTab === 'bookmarks' ? showBookmarkForm : showNoteForm
    
    if (!showForm) return null

    return (
      <div style={formStyle}>
        <h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>
          {isEditing ? 'Edit' : 'Create'} {activeTab === 'bookmarks' ? 'Bookmark' : 'Note'}
        </h4>
        
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={inputStyle}
            required
          />
          
          <textarea
            placeholder="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            style={textareaStyle}
            required
          />
          
          <div>
            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
            </button>
            <button type="button" onClick={resetForm} style={secondaryButtonStyle}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  const renderItems = () => {
    const items = activeTab === 'bookmarks' ? bookmarks : notes
    const itemType = activeTab === 'bookmarks' ? 'bookmark' : 'note'
    
    if (items.length === 0) {
      return (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 20px' }}>
          <p>No {itemType}s yet.</p>
          <p>Create your first {itemType} to get started!</p>
        </div>
      )
    }

    return items.map((item) => (
      <div key={item.id} style={itemStyle}>
        <div style={itemHeaderStyle}>
          <div>
            <h5 style={itemTitleStyle}>{item.title}</h5>
            <p style={itemTopicStyle}>{item.topic}</p>
          </div>
          <div style={actionButtonsStyle}>
            <button onClick={() => handleEdit(item)} style={secondaryButtonStyle}>
              Edit
            </button>
            <button onClick={() => handleDelete(item)} style={{ ...secondaryButtonStyle, background: '#dc2626' }}>
              Delete
            </button>
          </div>
        </div>
        <p style={itemContentStyle}>{item.content}</p>
      </div>
    ))
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={{ margin: 0, color: '#111827' }}>Bookmarks & Notes</h3>
        <button
          onClick={() => {
            if (activeTab === 'bookmarks') {
              setShowBookmarkForm(true)
            } else {
              setShowNoteForm(true)
            }
          }}
          style={buttonStyle}
        >
          Add {activeTab === 'bookmarks' ? 'Bookmark' : 'Note'}
        </button>
      </div>

      {/* Summary */}
      <div style={summaryStyle}>
        <strong>Summary:</strong> {summary.bookmarks_count || 0} bookmarks, {summary.notes_count || 0} notes
        {/* Removed "Filtered by" text as per user request */}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab('bookmarks')}
          style={tabStyle(activeTab === 'bookmarks')}
        >
          Bookmarks
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          style={tabStyle(activeTab === 'notes')}
        >
          Notes
        </button>
      </div>

      {/* Form */}
      {renderForm()}

      {/* Items */}
      {loading && (activeTab === 'bookmarks' ? bookmarks.length === 0 : notes.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          Loading...
        </div>
      ) : (
        renderItems()
      )}

      {/* Error */}
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: 8, 
          padding: 12, 
          marginTop: 16,
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
