import React, { useState } from 'react'

function Section({ section, selectedTopic, onSelectTopic }) {
  const [open, setOpen] = useState(false)
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {section.topics.map((t) => (
            <div
              key={t}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                background: selectedTopic === t ? '#eef2ff' : 'transparent',
                color: selectedTopic === t ? '#3730a3' : '#111827',
              }}
              onClick={() => onSelectTopic?.(t)}
              role="button"
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SectionsPanel({ sections, selectedTopic, onSelectTopic }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {sections?.map((sec) => (
        <Section key={sec.id} section={sec} selectedTopic={selectedTopic} onSelectTopic={onSelectTopic} />
      ))}
    </div>
  )
}


