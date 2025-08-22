import React from 'react'

const progressBarStyle = {
  background: '#f1f5f9',
  borderRadius: 8,
  height: 8,
  overflow: 'hidden',
  marginBottom: 8,
}

const progressFillStyle = (percentage) => ({
  background: '#3b82f6',
  height: '100%',
  width: `${percentage}%`,
  transition: 'width 0.2s ease',
})

const statsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 14,
  color: '#64748b',
}

const percentageStyle = {
  fontSize: 18,
  fontWeight: 600,
  color: '#3b82f6',
}

export default function ProgressBar({ progressSummary }) {
  if (!progressSummary) return null

  const { total_topics, completed_topics, progress_percentage } = progressSummary

  return (
    <div style={{ padding: '16px', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
          Learning Progress
        </h3>
      </div>
      
      <div style={progressBarStyle}>
        <div style={progressFillStyle(progress_percentage)} />
      </div>
      
      <div style={statsStyle}>
        <span>{completed_topics} of {total_topics} topics completed</span>
        <span style={percentageStyle}>{progress_percentage}%</span>
      </div>
    </div>
  )
}
