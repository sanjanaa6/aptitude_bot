import React, { useState } from 'react'
import { generateCurriculumFromTopic } from './learningPath/utils.js'
import { explainTopic } from '../api.js'

const wrap = { display: 'flex', flexDirection: 'column', gap: 12 }
const inputRow = { display: 'flex', alignItems: 'center', gap: 8 }
const bigInput = { flex: 1, fontSize: 18, padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white' }
const btn = (primary) => ({ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: primary ? '#111827' : 'white', color: primary ? 'white' : '#111827', cursor: 'pointer', fontWeight: 600 })
const layout = { display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 12 }
const col = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14 }
const moduleRow = { display: 'grid', gridTemplateColumns: '24px 1fr 84px 24px', alignItems: 'center', padding: '8px 6px', borderBottom: '1px solid #f5f7fb' }
const subList = { marginTop: 6, marginLeft: 30, display: 'flex', flexDirection: 'column', gap: 6 }
const subItem = { display: 'grid', gridTemplateColumns: '24px 1fr 70px', alignItems: 'center', padding: '8px 10px', borderRadius: 10, background: '#f9fafb', border: '1px solid #eef2f7', cursor: 'pointer' }
const minutePill = { fontSize: 11, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 999, padding: '2px 8px', textAlign: 'center' }
const sectionTitle = { fontWeight: 700, color: '#0f172a', marginBottom: 6 }

export default function LearningPathGenerator() {
  const [topic, setTopic] = useState('')
  const [curriculum, setCurriculum] = useState([])
  const [selected, setSelected] = useState(null)
  const [expanded, setExpanded] = useState(new Set())
  const [detailTab, setDetailTab] = useState('content') // 'content' | 'quiz'
  const [loadingExplain, setLoadingExplain] = useState(false)

  const onGenerate = () => {
    setCurriculum(generateCurriculumFromTopic(topic))
    setSelected(null)
  }

  const onReset = () => {
    setTopic('')
    setCurriculum([])
    setSelected(null)
  }

  const openSubmodule = async (sub, mod) => {
    setLoadingExplain(true)
    try {
      const res = await explainTopic(`${mod.title} - ${sub.title}`)
      const sanitize = (text) => {
        if (!text) return ''
        let t = String(text)
          .replace(/\r/g, '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/`+/g, '')
          .replace(/^\s{0,3}#{1,6}\s*/gm, '')
          .replace(/^\s*>\s?/gm, '')
          .replace(/[\*_|~]+/g, '')
          .replace(/^\s*[-*+•·]\s*/gm, '- ')
          .replace(/\|/g, ' ')
          .replace(/^\s*[-=]{3,}\s*$/gm, '')
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .replace(/[\t ]{2,}/g, ' ')
        t = t.replace(/\n{3,}/g, '\n\n').trim()
        return t
      }
      setSelected({ sub, mod, explanation: sanitize(res?.content || '') })
    } catch (e) {
      setSelected({ sub, mod, explanation: 'Failed to load explanation.' })
    } finally {
      setLoadingExplain(false)
    }
  }

  const toggleExpand = (id) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id); else next.add(id)
    setExpanded(next)
  }

  return (
    <div style={wrap}>
      <div style={inputRow}>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Type a topic (e.g. n8n)" style={bigInput} />
        <button style={btn(true)} onClick={onGenerate}>Generate</button>
        <button style={btn(false)} onClick={onReset}>Reset</button>
      </div>

      {curriculum.length === 0 && (
        <div style={{ color: '#94a3b8', fontSize: 14 }}>No syllabus yet — write your topic above and press Generate.</div>
      )}

      {curriculum.length > 0 && (
        <div style={layout}>
          <div style={col}>
            <div style={sectionTitle}>{topic || 'Your Topic'}</div>
            {curriculum.map((mod) => (
              <div key={mod.id}>
                <div style={moduleRow}>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{mod.id}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{mod.title}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{mod.description}</div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{mod.submodules?.length || 0} modules</div>
                  <button onClick={() => toggleExpand(mod.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    {expanded.has(mod.id) ? '▾' : '▸'}
                  </button>
                </div>
                {expanded.has(mod.id) && (
                  <div style={subList}>
                    {mod.submodules?.map((s) => (
                      <div key={s.id} style={subItem} onClick={() => openSubmodule(s, mod)}>
                        <div style={{ color: '#64748b', fontSize: 12 }}>{s.id}</div>
                        <div>{s.title}</div>
                        <div style={minutePill}>{s.minutes} min</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={col}>
            {!selected && (
              <div>
                <div style={{ color: '#64748b', marginBottom: 10 }}>Selected</div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{curriculum[0]?.title || 'Select a unit'}</div>
                <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 10 }}>~40m · {curriculum[0]?.level || ''}</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Modules</div>
                {curriculum[0]?.submodules?.map((s) => (
                  <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 40px', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>{s.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>{s.minutes}m</div>
                  </div>
                ))}
              </div>
            )}
            {selected && (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>{selected.sub.id}</span>
                  <div style={{ fontWeight: 700 }}>{selected.sub.title}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <button onClick={() => setDetailTab('content')} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: detailTab==='content'?'#eef2ff':'white', color: detailTab==='content'?'#3730a3':'#111827', cursor: 'pointer' }}>Module Content</button>
                  <button onClick={() => setDetailTab('quiz')} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: detailTab==='quiz'?'#eef2ff':'white', color: detailTab==='quiz'?'#3730a3':'#111827', cursor: 'pointer' }}>Knowledge Check</button>
                </div>
                {detailTab === 'content' && (
                  loadingExplain ? (
                    <div style={{ color: '#64748b' }}>Loading...</div>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: 1.6 }}>{selected.explanation || 'No explanation.'}</div>
                  )
                )}
                {detailTab === 'quiz' && (
                  <div style={{ color: '#64748b' }}>Quiz placeholder — integrate with existing Quiz component if needed.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
