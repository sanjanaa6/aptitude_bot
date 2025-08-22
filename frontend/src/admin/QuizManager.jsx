import React, { useState, useEffect } from 'react'
import { adminListSections, adminListQuizQuestions, adminCreateQuizQuestion, adminUpdateQuizQuestion, adminDeleteQuizQuestion, adminGetQuizStats } from '../api.js'

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
const inputFocus = { 
  ...input, 
  borderColor: '#3b82f6',
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
}

const textarea = { 
  ...input, 
  minHeight: '120px', 
  resize: 'vertical',
  fontFamily: 'inherit'
}

const select = { ...input, cursor: 'pointer' }

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

const searchInput = { 
  ...input, 
  maxWidth: '400px',
  background: 'white',
  border: '1px solid #e5e7eb'
}

const filterBar = {
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  marginBottom: '24px',
  flexWrap: 'wrap'
}

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

export default function QuizManager() {
  const [questions, setQuestions] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'medium',
    topic: '',
    section: ''
  })
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterTopic, setFilterTopic] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadSections()
    loadQuestions()
    loadStats()
  }, [])

  const loadSections = async () => {
    try {
      const res = await adminListSections()
      setSections(res.sections || [])
    } catch (error) {
      console.error('Failed to load sections:', error)
    }
  }

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const res = await adminListQuizQuestions()
      setQuestions(res.questions || [])
    } catch (error) {
      console.error('Failed to load questions:', error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await adminGetQuizStats()
      setStats(res)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const getTopicsForSection = (sectionId) => {
    const section = sections.find(s => s.id === sectionId)
    return section?.topics || []
  }

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.section.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSection = !filterSection || q.section === filterSection
    const matchesTopic = !filterTopic || q.topic === filterTopic
    const matchesDifficulty = !filterDifficulty || q.difficulty === filterDifficulty
    
    return matchesSearch && matchesSection && matchesTopic && matchesDifficulty
  })

  const addOption = () => {
    setForm({ ...form, options: [...form.options, ''] })
  }

  const removeOption = (index) => {
    if (form.options.length > 2) {
      const newOptions = form.options.filter((_, i) => i !== index)
      const newCorrectAnswer = form.correctAnswer >= index ? Math.max(0, form.correctAnswer - 1) : form.correctAnswer
      setForm({ ...form, options: newOptions, correctAnswer: newCorrectAnswer })
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options]
    newOptions[index] = value
    setForm({ ...form, options: newOptions })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.question.trim() || !form.topic || !form.section) {
      alert('Please fill in all required fields')
      return
    }

    if (form.options.some(opt => !opt.trim())) {
      alert('Please fill in all options')
      return
    }

    // Validate correctAnswer is a valid number
    if (typeof form.correctAnswer !== 'number' || form.correctAnswer < 0 || form.correctAnswer >= form.options.length) {
      alert('Please select a valid correct answer')
      return
    }

    try {
      console.log('Submitting question data:', form)
      
      // Ensure all required fields are present and properly formatted
      const questionData = {
        question: form.question.trim(),
        options: form.options.map(opt => opt.trim()),
        correctAnswer: parseInt(form.correctAnswer),
        explanation: form.explanation.trim(),
        difficulty: form.difficulty,
        topic: form.topic,
        section: form.section
      }
      
      console.log('Processed question data:', questionData)
      
      if (editingQuestion) {
        // Update existing question
        console.log('Updating question:', editingQuestion.id)
        const response = await adminUpdateQuizQuestion(editingQuestion.id, questionData)
        console.log('Update response:', response)
        setEditingQuestion(null)
      } else {
        // Add new question
        console.log('Creating new question')
        const response = await adminCreateQuizQuestion(questionData)
        console.log('Create response:', response)
      }
      
      // Reset form
      setForm({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        difficulty: 'medium',
        topic: '',
        section: ''
      })
      
      // Reload questions
      await loadQuestions()
      await loadStats()
    } catch (error) {
      console.error('Failed to save question:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      let errorMessage = 'Failed to save question'
      if (error.response?.data?.detail) {
        errorMessage += `: ${error.response.data.detail}`
      } else if (error.message) {
        errorMessage += `: ${error.message}`
      }
      
      alert(errorMessage)
    }
  }

  const editQuestion = (question) => {
    setEditingQuestion(question)
    setForm({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic: question.topic,
      section: question.section
    })
  }

  const deleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    
    try {
      await adminDeleteQuizQuestion(questionId)
      await loadQuestions()
      await loadStats()
    } catch (error) {
      console.error('Failed to delete question:', error)
      alert('Failed to delete question')
    }
  }

  const seedSampleQuestions = async () => {
    const sampleQuestions = [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        explanation: "Paris is the capital and largest city of France.",
        difficulty: "easy",
        topic: "Geography",
        section: "World Capitals"
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        explanation: "Mars is called the Red Planet due to iron oxide on its surface.",
        difficulty: "medium",
        topic: "Astronomy",
        section: "Solar System"
      }
    ]

    try {
      for (const question of sampleQuestions) {
        await adminCreateQuizQuestion(question)
      }
      await loadQuestions()
      await loadStats()
      alert('Sample questions added successfully!')
    } catch (error) {
      console.error('Failed to add sample questions:', error)
      alert('Failed to add sample questions')
    }
  }

  const exportQuestions = () => {
    const dataStr = JSON.stringify(questions, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'quiz_questions.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterSection('')
    setFilterTopic('')
    setFilterDifficulty('')
  }

  return (
    <div style={container}>
      {/* Header */}
      <div style={header}>
        <div>
          <div style={title}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
              <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
              <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
            </svg>
            Quiz Manager
          </div>
          <div style={subtitle}>
            Create, edit, and manage quiz questions for your topics
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={seedSampleQuestions} style={buttonSecondary}>
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Seed Sample
          </button>
          <button onClick={exportQuestions} style={buttonSecondary}>
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div style={grid}>
          <div style={statsCard('#3b82f6')}>
            <div style={statsNumber('#3b82f6')}>{stats.total_questions || 0}</div>
            <div style={statsLabel}>Total Questions</div>
          </div>
          <div style={statsCard('#10b981')}>
            <div style={statsNumber('#10b981')}>{stats.by_difficulty?.easy || 0}</div>
            <div style={statsLabel}>Easy Questions</div>
          </div>
          <div style={statsCard('#f59e0b')}>
            <div style={statsNumber('#f59e0b')}>{stats.by_difficulty?.medium || 0}</div>
            <div style={statsLabel}>Medium Questions</div>
          </div>
          <div style={statsCard('#ef4444')}>
            <div style={statsNumber('#ef4444')}>{stats.by_difficulty?.hard || 0}</div>
            <div style={statsLabel}>Hard Questions</div>
          </div>
        </div>
      )}

      {/* Form */}
      <div style={card}>
        <h3 style={{ margin: '0 0 24px 0', color: '#111827', fontSize: '20px', fontWeight: '600' }}>
          {editingQuestion ? 'Edit Question' : 'Add New Question'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={grid}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Section *
              </label>
              <select
                value={form.section}
                onChange={(e) => {
                  setForm({ ...form, section: e.target.value, topic: '' })
                }}
                style={select}
                required
              >
                <option value="">Select Section</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>{section.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Topic *
              </label>
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                style={select}
                required
                disabled={!form.section}
              >
                <option value="">Select Topic</option>
                {getTopicsForSection(form.section).map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Question *
            </label>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Enter your question here..."
              style={textarea}
              required
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Options *
            </label>
            {form.options.map((option, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={form.correctAnswer === index}
                  onChange={() => setForm({ ...form, correctAnswer: index })}
                  style={{ margin: 0 }}
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  style={input}
                  required
                />
                {form.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    style={{ ...buttonSecondary, padding: '8px 12px', minWidth: 'auto' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              style={{ ...buttonSecondary, marginTop: '8px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Add Option
            </button>
          </div>

          <div style={grid}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                style={select}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Explanation
              </label>
              <textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                placeholder="Explain why this answer is correct..."
                style={textarea}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button type="submit" style={editingQuestion ? buttonSuccess : button}>
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </button>
            {editingQuestion && (
              <button
                type="button"
                onClick={() => {
                  setEditingQuestion(null)
                  setForm({
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    explanation: '',
                    difficulty: 'medium',
                    topic: '',
                    section: ''
                  })
                }}
                style={buttonSecondary}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filters */}
      <div style={card}>
        <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '600' }}>
          Filter Questions
        </h3>
        
        <div style={filterBar}>
          <input
            type="text"
            placeholder="Search questions, topics, or sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInput}
          />
          
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            style={select}
          >
            <option value="">All Sections</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>{section.title}</option>
            ))}
          </select>
          
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            style={select}
            disabled={!filterSection}
          >
            <option value="">All Topics</option>
            {getTopicsForSection(filterSection).map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
          
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            style={select}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          
          <button onClick={clearFilters} style={buttonSecondary}>
            Clear Filters
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Showing {filteredQuestions.length} of {questions.length} questions
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {loading ? 'Loading...' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div style={card}>
        <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '20px', fontWeight: '600' }}>
          Questions ({filteredQuestions.length})
        </h3>
        
        {filteredQuestions.length > 0 ? (
          <table style={table}>
            <thead>
              <tr>
                <th style={tableHeader}>Question</th>
                <th style={tableHeader}>Topic</th>
                <th style={tableHeader}>Section</th>
                <th style={tableHeader}>Difficulty</th>
                <th style={tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((question, index) => (
                <tr key={question.id || index} style={tableRow} onMouseEnter={(e) => e.target.closest('tr').style.background = '#f9fafb'}>
                  <td style={tableCell}>
                    <div style={{ maxWidth: '300px' }}>
                      <div style={{ fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                        {question.question.length > 80 ? question.question.substring(0, 80) + '...' : question.question}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {question.options.length} options
                      </div>
                    </div>
                  </td>
                  <td style={tableCell}>
                    <span style={badge('#3b82f6')}>{question.topic}</span>
                  </td>
                  <td style={tableCell}>
                    <span style={badge('#10b981')}>{question.section}</span>
                  </td>
                  <td style={tableCell}>
                    <span style={badge(getDifficultyColor(question.difficulty))}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => editQuestion(question)}
                        style={{ ...buttonSecondary, padding: '8px 12px', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        style={{ ...buttonDanger, padding: '8px 12px', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px 20px' }}>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>
              {loading ? 'Loading questions...' : 'No questions found'}
            </div>
            <div style={{ fontSize: '14px' }}>
              {!loading && 'Try adjusting your filters or add some questions to get started.'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'easy': return '#10b981'
    case 'medium': return '#f59e0b'
    case 'hard': return '#ef4444'
    default: return '#6b7280'
  }
}
