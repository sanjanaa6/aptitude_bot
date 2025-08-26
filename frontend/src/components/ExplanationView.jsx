import React, { useState, useMemo } from 'react'
import { VoiceButton } from './VoiceUtils.jsx'

// Clean Professional UI Components
const containerStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0',
  minHeight: '400px'
}

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '24px',
  paddingBottom: '20px',
  borderBottom: '1px solid #e2e8f0'
}

const topicIconStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  background: '#3b82f6',
  display: 'grid',
  placeItems: 'center',
  color: 'white'
}

const titleStyle = {
  margin: 0,
  fontSize: '28px',
  fontWeight: '700',
  color: '#1e293b',
  lineHeight: '1.3'
}

const subtitleStyle = {
  margin: '8px 0 0 0',
  fontSize: '16px',
  color: '#64748b',
  fontWeight: '400'
}

const contentStyle = {
  fontSize: '16px',
  lineHeight: '1.8',
  color: '#475569',
  marginBottom: '24px'
}

const filterContainerStyle = {
  display: 'flex',
  gap: '12px',
  marginBottom: '20px',
  flexWrap: 'wrap'
}

const filterButtonStyle = (active) => ({
  padding: '8px 16px',
  border: 'none',
  borderRadius: '6px',
  background: active ? '#3b82f6' : '#f1f5f9',
  color: active ? 'white' : '#475569',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease'
})

const contentSectionStyle = {
  marginBottom: '24px',
  padding: '20px',
  background: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0'
}

const sectionTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}

const mathExpressionStyle = {
  background: '#f1f5f9',
  padding: '8px 12px',
  borderRadius: '6px',
  fontFamily: 'monospace',
  fontSize: '14px',
  color: '#1e293b',
  margin: '8px 0',
  border: '1px solid #e2e8f0'
}

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px',
  color: '#64748b'
}

const loadingIconStyle = {
  width: '48px',
  height: '48px',
  marginBottom: '16px',
  animation: 'spin 1s linear infinite'
}

const errorStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px',
  color: '#dc2626',
  textAlign: 'center'
}

const errorIconStyle = {
  width: '48px',
  height: '48px',
  marginBottom: '16px'
}

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px',
  color: '#64748b',
  textAlign: 'center'
}

const emptyIconStyle = {
  width: '64px',
  height: '64px',
  marginBottom: '16px',
  opacity: 0.5
}

const actionButtonsStyle = {
  display: 'flex',
  gap: '16px',
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '2px solid #f3f4f6',
  flexWrap: 'wrap'
}

const buttonStyle = {
  padding: '12px 24px',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  background: 'white',
  color: '#374151',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}

const primaryButtonStyle = {
  ...buttonStyle,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
}

const contentWrapperStyle = {
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px'
}

const contentHeaderStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}

const contentTextStyle = {
  fontSize: '16px',
  lineHeight: '1.8',
  color: '#374151',
  margin: 0,
  whiteSpace: 'pre-wrap'
}

export default function ExplanationView({ topic, explanation, loading, error }) {
  const [activeFilter, setActiveFilter] = useState('all')
  
  // Parse and structure the explanation content
  const structuredContent = useMemo(() => {
    if (!explanation) return null
    
    const sections = {
      concepts: [],
      rules: [],
      examples: [],
      summary: []
    }
    
    const lines = explanation.split('\n')
    let currentSection = 'concepts'
    
    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine.toLowerCase().includes('key concept') || trimmedLine.toLowerCase().includes('definition')) {
        currentSection = 'concepts'
      } else if (trimmedLine.toLowerCase().includes('rule') || trimmedLine.toLowerCase().includes('law')) {
        currentSection = 'rules'
      } else if (trimmedLine.toLowerCase().includes('example') || trimmedLine.toLowerCase().includes('solve')) {
        currentSection = 'examples'
      } else if (trimmedLine.toLowerCase().includes('summary') || trimmedLine.toLowerCase().includes('conclusion')) {
        currentSection = 'summary'
      }
      
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        sections[currentSection].push(trimmedLine)
      }
    })
    
    return sections
  }, [explanation])
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={loadingIconStyle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Loading Explanation...
          </div>
          <div style={{ fontSize: '14px' }}>
            Preparing your learning content
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          <div style={errorIconStyle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Error Loading Content
          </div>
          <div style={{ fontSize: '14px', maxWidth: '400px' }}>
            {error}
          </div>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div style={containerStyle}>
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
            Select a Topic to Learn
          </div>
          <div style={{ fontSize: '14px', maxWidth: '400px' }}>
            Choose a topic from the left sidebar to start your learning journey
          </div>
        </div>
      </div>
    )
  }

  if (!explanation) {
    return (
      <div style={containerStyle}>
        <div style={emptyStateStyle}>
          <div style={emptyIconStyle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
            No Content Available
          </div>
          <div style={{ fontSize: '14px', maxWidth: '400px' }}>
            This topic doesn't have any explanation content yet
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={topicIconStyle}>
          📚
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={titleStyle}>{topic}</h2>
            <VoiceButton
              text={`${topic}. Learning Module for Quantitative Concepts.`}
              type="output"
              style={{ 
                width: '40px', 
                height: '40px', 
                fontSize: '16px',
                flexShrink: 0
              }}
            />
          </div>
          <p style={subtitleStyle}>
            Learning Module • Quantitative Concepts
          </p>
        </div>
      </div>

      {/* Content Filters */}
      {structuredContent && (
        <div style={filterContainerStyle}>
          <button 
            style={filterButtonStyle(activeFilter === 'all')}
            onClick={() => setActiveFilter('all')}
          >
            All Content
          </button>
          <button 
            style={filterButtonStyle(activeFilter === 'concepts')}
            onClick={() => setActiveFilter('concepts')}
          >
            Key Concepts
          </button>
          <button 
            style={filterButtonStyle(activeFilter === 'rules')}
            onClick={() => setActiveFilter('rules')}
          >
            Rules & Formulas
          </button>
          <button 
            style={filterButtonStyle(activeFilter === 'examples')}
            onClick={() => setActiveFilter('examples')}
          >
            Examples
          </button>
          <button 
            style={filterButtonStyle(activeFilter === 'summary')}
            onClick={() => setActiveFilter('summary')}
          >
            Summary
          </button>
        </div>
      )}

      {/* Content */}
      <div style={contentWrapperStyle}>
        <div style={contentHeaderStyle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          Explanation
        </div>
        
        {structuredContent && activeFilter !== 'all' ? (
          <div style={contentSectionStyle}>
            <div style={sectionTitleStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              {activeFilter === 'concepts' && 'Key Concepts'}
              {activeFilter === 'rules' && 'Rules & Formulas'}
              {activeFilter === 'examples' && 'Examples & Solutions'}
              {activeFilter === 'summary' && 'Summary'}
            </div>
            <div style={contentTextStyle}>
              {structuredContent[activeFilter].map((line, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  {line.includes('=') || line.includes('√') || line.includes('×') ? (
                    <div style={mathExpressionStyle}>{line}</div>
                  ) : (
                    line
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={contentTextStyle}>
              {explanation}
            </div>
            <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
              <VoiceButton
                text={explanation}
                type="output"
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  fontSize: '14px',
                  flexShrink: 0
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={actionButtonsStyle}>
        <button style={primaryButtonStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
            <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
            <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
          </svg>
          Take Quiz
        </button>
        
        <button style={buttonStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          Bookmark
        </button>
        
        <button style={buttonStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Ask Questions
        </button>
      </div>

      {/* CSS for loading animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}


