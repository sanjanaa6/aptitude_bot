import React, { useState } from 'react'

function Section({ section, selectedTopic, onSelectTopic, defaultOpen = false, progress = [] }) {
  const [open, setOpen] = useState(defaultOpen)
  
  const isTopicCompleted = (topic) => {
    return progress.some(p => p.topic === topic && p.completed)
  }
  
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        onClick={() => setOpen(!open)}
        role="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: 6,
          background: '#f3f4f6',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontWeight: 600 }}>{section.title}</span>
        <span style={{ color: '#6b7280' }}>{open ? '−' : '+'}</span>
      </div>
      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 8 }}>
          {section.topics.map((t) => {
            const completed = isTopicCompleted(t)
            return (
              <div
                key={t}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: 'white',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                  boxShadow: selectedTopic === t ? '0 0 0 2px rgba(79,70,229,0.25)' : 'none',
                  position: 'relative',
                }}
                onClick={() => onSelectTopic?.(t)}
                role="button"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{t}</span>
                  {completed && (
                    <div style={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      background: '#10b981', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SectionsPanel({ sections, selectedTopic, onSelectTopic, defaultOpen = false, progress = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {sections?.map((sec) => (
        <Section
          key={sec.id}
          section={sec}
          selectedTopic={selectedTopic}
          onSelectTopic={onSelectTopic}
          defaultOpen={defaultOpen}
          progress={progress}
        />
      ))}
    </div>
  )
}


