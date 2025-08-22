import React, { useState, useEffect } from 'react'
import { getQuizQuestions } from '../api.js'

const itemStyle = (active, hasQuiz) => ({
  padding: '8px 10px',
  borderRadius: 6,
  cursor: 'pointer',
  background: active ? '#eef2ff' : 'transparent',
  color: active ? '#3730a3' : '#111827',
  border: hasQuiz ? '1px solid #10b981' : '1px solid transparent',
  position: 'relative'
})

const quizBadge = {
  position: 'absolute',
  right: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '10px',
  padding: '2px 6px',
  background: '#10b981',
  color: 'white',
  borderRadius: '10px',
  fontWeight: '500'
}

export default function TopicsPanel({ topics, selected, onSelect, enableAdd = false, onAdd }) {
  const [newTopic, setNewTopic] = useState('')
  const [topicsWithQuizzes, setTopicsWithQuizzes] = useState(new Set())

  useEffect(() => {
    // Check which topics have quizzes
    const checkQuizAvailability = async () => {
      const availableTopics = new Set()
      
      for (const topic of topics || []) {
        try {
          const response = await getQuizQuestions(topic, null, 1) // Just check if any questions exist
          if (response && response.questions && response.questions.length > 0) {
            availableTopics.add(topic)
          }
        } catch (error) {
          // Topic doesn't have quizzes
        }
      }
      
      setTopicsWithQuizzes(availableTopics)
    }

    if (topics && topics.length > 0) {
      checkQuizAvailability()
    }
  }, [topics])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {enableAdd && (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Add new topic"
            style={{ flex: 1, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          <button
            onClick={() => { const t = newTopic.trim(); if (!t) return; onAdd?.(t); setNewTopic('') }}
            style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#111827', color: 'white', cursor: 'pointer' }}
          >
            Add
          </button>
        </div>
      )}
      {topics?.map((t) => {
        const hasQuiz = topicsWithQuizzes.has(t)
        return (
          <div
            key={t}
            style={itemStyle(selected === t, hasQuiz)}
            onClick={() => onSelect?.(t)}
            role="button"
          >
            {t}
            {hasQuiz && <span style={quizBadge}>Quiz</span>}
          </div>
        )
      })}
    </div>
  )
}


