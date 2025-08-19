import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ExplanationView({ topic, loading, error, content }) {
  if (!topic) {
    return (
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <div style={{ color: '#6b7280' }}>Select a topic to see the explanation.</div>
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, overflow: 'auto' }}>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
      {!loading && !error && (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || 'No content'}</ReactMarkdown>
      )}
    </div>
  )
}


