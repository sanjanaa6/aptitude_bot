import React from 'react'

const itemStyle = (active) => ({
  padding: '8px 10px',
  borderRadius: 6,
  cursor: 'pointer',
  background: active ? '#eef2ff' : 'transparent',
  color: active ? '#3730a3' : '#111827',
})

export default function TopicsPanel({ topics, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {topics?.map((t) => (
        <div
          key={t}
          style={itemStyle(selected === t)}
          onClick={() => onSelect?.(t)}
          role="button"
        >
          {t}
        </div>
      ))}
    </div>
  )
}


