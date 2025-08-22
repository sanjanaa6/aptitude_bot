import React, { useMemo, useRef, useState } from 'react'
import { chat as chatApi } from '../api.js'

const containerBase = {
	border: '1px solid #e5e7eb',
	borderRadius: 8,
	padding: 12,
	display: 'flex',
	flexDirection: 'column',
}

const messagesBox = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  paddingRight: 4,
}

const bubble = (role) => ({
  alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
  background: role === 'user' ? '#e0f2fe' : '#f3f4f6',
  color: '#111827',
  padding: '8px 10px',
  borderRadius: 12,
  maxWidth: '80%',
  whiteSpace: 'pre-wrap',
})

export default function Chat({ height = 'calc(100vh - 130px)' }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await chatApi(newMessages)
      setMessages([...newMessages, { role: 'assistant', content: res.content || '' }])
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error contacting backend.' }])
    } finally {
      setLoading(false)
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0)
    }
  }

  return (
    <div style={{ ...containerBase, height }}>
      <div style={messagesBox}>
        {messages.map((m, idx) => (
          <div key={idx} style={bubble(m.role)}>
            {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          style={{ flex: 1, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{
            background: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 14px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}


