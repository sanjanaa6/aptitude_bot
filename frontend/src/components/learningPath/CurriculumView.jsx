import React, { useMemo, useState } from 'react'
import { explainTopic } from '../../src/api.js'

const layout = { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }
const modulesCol = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }
const detailCol = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }
const moduleRow = { display: 'grid', gridTemplateColumns: '28px 1fr 90px', alignItems: 'center', padding: '12px 8px', borderBottom: '1px solid #f1f5f9' }
const moduleTitle = { margin: 0, fontWeight: 700, color: '#0f172a' }
const subList = { marginTop: 8, marginLeft: 36, display: 'flex', flexDirection: 'column', gap: 8 }
const subItem = (active) => ({ display: 'grid', gridTemplateColumns: '28px 1fr 90px', alignItems: 'center', padding: '8px', borderRadius: 8, background: active ? '#eef2ff' : '#f8fafc', border: '1px solid #e5e7eb', cursor: 'pointer' })

export default function CurriculumView({ curriculum = [], onSelectSubmodule }) {
  return (
    <div style={layout}>
      <div style={modulesCol}>
        <div style={{ fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>Curriculum</div>
        {curriculum.map((mod) => (
          <div key={mod.id}>
            <div style={moduleRow}>
              <div style={{ color: '#64748b', fontSize: 12 }}>{mod.id}</div>
              <div>
                <h4 style={moduleTitle}>{mod.title}</h4>
                <div style={{ color: '#64748b', fontSize: 13 }}>{mod.description}</div>
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>{mod.submodules?.length || 0} modules</div>
            </div>
            <div style={subList}>
              {mod.submodules?.map((s) => (
                <div key={s.id} style={subItem(false)} onClick={() => onSelectSubmodule?.(s, mod)}>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{s.id}</div>
                  <div>{s.title}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{s.minutes} min</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={detailCol}>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Select a unit to view details</div>
      </div>
    </div>
  )
}


