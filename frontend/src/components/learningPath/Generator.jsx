import React, { useEffect, useState } from 'react'
import { generateCurriculumFromTopic } from './utils.js'
import { explainTopic } from '../../api.js'

const wrap = { display: 'flex', flexDirection: 'column', gap: 16 }
const inputRow = { display: 'flex', alignItems: 'center', gap: 12 }
const bigInput = { flex: 1, fontSize: 24, padding: '16px 18px', borderRadius: 12, border: '1px solid #e5e7eb' }
const btn = (primary) => ({ padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb', background: primary ? '#111827' : 'white', color: primary ? 'white' : '#111827', cursor: 'pointer', fontWeight: 600 })
const layout = { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }
const col = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }
const moduleRow = { display: 'grid', gridTemplateColumns: '28px 1fr 90px', alignItems: 'center', padding: '10px 8px', borderBottom: '1px solid #f1f5f9' }
const subList = { marginTop: 8, marginLeft: 36, display: 'flex', flexDirection: 'column', gap: 8 }
const subItem = { display: 'grid', gridTemplateColumns: '28px 1fr 90px', alignItems: 'center', padding: '8px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e5e7eb', cursor: 'pointer' }

export default function Generator() {
  const [topic, setTopic] = useState('')
  const [curriculum, setCurriculum] = useState([])
  const [selected, setSelected] = useState(null) // { sub, mod, explanation }
  const [loadingExplain, setLoadingExplain] = useState(false)
  

  useEffect(() => {
    try {
      const savedTopic = sessionStorage.getItem('lp_topic')
      const savedCurriculum = sessionStorage.getItem('lp_curriculum')
      if (savedTopic) setTopic(savedTopic)
      if (savedCurriculum) setCurriculum(JSON.parse(savedCurriculum))
    } catch (_) {}
  }, [])

  const sanitize = (text) => {
    if (!text) return ''
    let t = String(text)
      .replace(/\r/g, '')
      // Remove code fences and inline backticks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`+/g, '')
      // Strip markdown headings and blockquotes
      .replace(/^\s{0,3}#{1,6}\s*/gm, '')
      .replace(/^\s*>\s?/gm, '')
      // Remove emphasis/bold/strikethrough/underscore markers
      .replace(/[\*_|~]+/g, '')
      // Normalize bullets and remove decorative bullets
      .replace(/^\s*[-*+•·]\s*/gm, '- ')
      // Remove markdown tables pipes and separators
      .replace(/\|/g, ' ')
      .replace(/^\s*[-=]{3,}\s*$/gm, '')
      // Remove stray backslashes and zero-width chars
      .replace(/\\/g, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Collapse excessive spaces
      .replace(/[\t ]{2,}/g, ' ')
    t = t.replace(/\n{3,}/g, '\n\n').trim()
    return t
  }

  const onGenerate = () => {
    const next = generateCurriculumFromTopic(topic)
    setCurriculum(next)
    setSelected(null)
    try {
      sessionStorage.setItem('lp_topic', topic)
      sessionStorage.setItem('lp_curriculum', JSON.stringify(next))
    } catch (_) {}
  }

  const onReset = () => {
    setTopic('')
    setCurriculum([])
    setSelected(null)
    try {
      sessionStorage.removeItem('lp_topic')
      sessionStorage.removeItem('lp_curriculum')
    } catch (_) {}
  }

  const openSubmodule = async (sub, mod) => {
    setLoadingExplain(true)
    try {
      const res = await explainTopic(`${mod.title} - ${sub.title}`)
      const cleaned = sanitize(res?.content || '')
      try {
        sessionStorage.setItem('lp_topic', topic)
        sessionStorage.setItem('lp_curriculum', JSON.stringify(curriculum))
      } catch (_) {}
      setSelected({ sub, mod, explanation: cleaned })
    } catch (e) {
      setSelected({ sub, mod, explanation: 'Failed to load explanation.' })
    } finally {
      setLoadingExplain(false)
    }
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
            <div style={{ fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>{topic || 'Your Topic'}</div>
            {curriculum.map((mod) => (
              <div key={mod.id}>
                <div style={moduleRow}>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{mod.id}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{mod.title}</div>
                    <div style={{ color: '#64748b', fontSize: 13 }}>{mod.description}</div>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{mod.submodules?.length || 0} modules</div>
                </div>
                <div style={subList}>
                  {mod.submodules?.map((s) => (
                    <div key={s.id} style={subItem} onClick={() => openSubmodule(s, mod)}>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{s.id}</div>
                      <div>{s.title}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{s.minutes} min</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={col}>
            {loadingExplain ? <div style={{ color: '#64748b' }}>Loading...</div> : <div style={{ color: '#94a3b8', fontSize: 14 }}>Select a unit to open full-page explanation</div>}
          </div>
        </div>
      )}
    </div>
  )
}


