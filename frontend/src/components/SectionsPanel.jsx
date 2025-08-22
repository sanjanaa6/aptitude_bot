import React, { useState } from 'react'
import { getQuizQuestions } from '../api.js'

// Clean Professional UI Components
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
}

const sectionStyle = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '12px',
  transition: 'all 0.2s ease',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
}

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
  cursor: 'pointer',
  padding: '8px 0'
}

const sectionTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e293b',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 0'
}

const sectionIconStyle = {
  width: '24px',
  height: '24px',
  transition: 'transform 0.2s ease',
  color: '#64748b'
}

const topicsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginLeft: '8px',
  marginTop: '8px'
}

const sectionProgressStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '12px',
  color: '#64748b',
  marginTop: '8px',
  padding: '4px 8px',
  background: '#f8fafc',
  borderRadius: '4px'
}

const progressBarStyle = {
  flex: 1,
  height: '4px',
  background: '#e2e8f0',
  borderRadius: '2px',
  overflow: 'hidden'
}

const progressFillStyle = (percentage) => ({
  height: '100%',
  background: '#3b82f6',
  width: `${percentage}%`,
  transition: 'width 0.3s ease'
})

const topicItemStyle = (isSelected, hasQuiz, isCompleted) => {
  let background = '#f8fafc'
  let borderColor = '#e2e8f0'
  let textColor = '#475569'
  
  if (isSelected) {
    background = '#3b82f6'
    borderColor = '#3b82f6'
    textColor = 'white'
  }
  
  if (isCompleted && !isSelected) {
    background = '#f0fdf4'
    borderColor = '#10b981'
    textColor = '#065f46'
  }
  
  return {
    padding: '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    background: background,
    border: `1px solid ${borderColor}`,
    color: textColor,
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '6px'
  }
}

const topicContentStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1
}

const topicIconStyle = {
  width: '16px',
  height: '16px',
  opacity: 0.8
}

const quizBadgeStyle = {
  padding: '4px 8px',
  borderRadius: '8px',
  fontSize: '10px',
  fontWeight: '600',
  background: '#f0fdf4',
  color: '#10b981',
  border: '1px solid #10b981'
}

const progressBadgeStyle = {
  padding: '4px 8px',
  borderRadius: '8px',
  fontSize: '10px',
  fontWeight: '600',
  background: '#eff6ff',
  color: '#3b82f6',
  border: '1px solid #3b82f6'
}

const emptyStateStyle = {
  textAlign: 'center',
  color: '#64748b',
  padding: '40px 20px',
  fontSize: '14px'
}

export default function SectionsPanel({ sections = [], selected, onSelect, progress = [] }) {
  const [expandedSections, setExpandedSections] = useState(new Set())
  const [topicsWithQuizzes, setTopicsWithQuizzes] = useState(new Set())

  // Check which topics have quizzes
  React.useEffect(() => {
    const checkQuizAvailability = async () => {
      const availableTopics = new Set()
      
      for (const section of sections) {
        for (const topic of section.topics || []) {
          try {
            const response = await getQuizQuestions(topic, null, 1)
            if (response && response.questions && response.questions.length > 0) {
              availableTopics.add(topic)
            }
          } catch (error) {
            // Topic doesn't have quizzes
          }
        }
      }
      
      setTopicsWithQuizzes(availableTopics)
    }

    if (sections.length > 0) {
      checkQuizAvailability()
    }
  }, [sections])

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const isTopicCompleted = (topic) => {
    return progress.some(p => p.topic === topic && p.completed)
  }

  const getTopicProgress = (topic) => {
    const topicProgress = progress.find(p => p.topic === topic)
    return topicProgress?.completed ? 100 : 0
  }

  const getSectionProgress = (section) => {
    const sectionTopics = section.topics || []
    if (sectionTopics.length === 0) return 0
    
    const completedTopics = sectionTopics.filter(topic => 
      progress.some(p => p.topic === topic && p.completed)
    )
    
    return Math.round((completedTopics.length / sectionTopics.length) * 100)
  }

  if (!sections || sections.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1" style={{ marginBottom: '8px' }}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <div>No sections available</div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
          Contact an administrator to add content
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {sections.map((section) => (
        <div key={section.id} style={sectionStyle}>
          <div 
            style={sectionHeaderStyle}
            onClick={() => toggleSection(section.id)}
          >
            <h3 style={sectionTitleStyle}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{
                  ...sectionIconStyle,
                  transform: expandedSections.has(section.id) ? 'rotate(90deg)' : 'rotate(0deg)'
                }}
              >
                <polyline points="9,18 15,12 9,6"/>
              </svg>
              {section.title || section.id}
            </h3>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {section.topics?.length || 0} topics
            </div>
          </div>
          
          {/* Section Progress */}
          <div style={sectionProgressStyle}>
            <span>{getSectionProgress(section)}%</span>
            <div style={progressBarStyle}>
              <div style={progressFillStyle(getSectionProgress(section))} />
            </div>
            <span>{section.topics?.length || 0}</span>
          </div>
          
          
          {expandedSections.has(section.id) && (
            <div style={topicsListStyle}>
              {section.topics?.map((topic, index) => {
                const isSelected = selected === topic
                const hasQuiz = topicsWithQuizzes.has(topic)
                const isCompleted = isTopicCompleted(topic)
                const progressValue = getTopicProgress(topic)
                
                return (
                  <div
                    key={index}
                    style={topicItemStyle(isSelected, hasQuiz, isCompleted)}
                    onClick={() => onSelect(topic)}
                  >
                    <div style={topicContentStyle}>
                      <div style={topicIconStyle}>
                        {isCompleted ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                        )}
                      </div>
                      <span style={{ flex: 1 }}>{topic}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {hasQuiz && (
                        <span style={quizBadgeStyle}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                            <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                            <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
                          </svg>
                          Quiz
                        </span>
                      )}
                      {isCompleted && (
                        <span style={progressBadgeStyle}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                          Done
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {(!section.topics || section.topics.length === 0) && (
                <div style={{ 
                  padding: '12px 16px', 
                  color: '#64748b', 
                  fontSize: '13px',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  No topics in this section
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}


