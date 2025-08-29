import React, { useState } from 'react'
import { generateCurriculumFromTopic, generateCurriculumFromTopicAI } from './learningPath/utils.js'
import { explainTopic, getQuizQuestions, generateQuizQuestions } from '../api.js'

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

// Knowledge Check (Quiz) styles
const quizContainer = { background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginTop: '16px' }
const quizButton = { padding: '8px 16px', borderRadius: '6px', border: '1px solid #3b82f6', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s ease' }
const questionStyle = { background: '#f8fafc', borderRadius: '8px', padding: '16px', marginBottom: '12px', border: '1px solid #e2e8f0' }
const optionStyle = (selected, correct, showResults) => {
  let background = 'white'
  let borderColor = '#e2e8f0'
  let textColor = '#475569'
  if (showResults) {
    if (correct) { background = '#f0fdf4'; borderColor = '#10b981'; textColor = '#065f46' }
    else if (selected && !correct) { background = '#fef2f2'; borderColor = '#ef4444'; textColor = '#991b1b' }
  } else if (selected) { background = '#eff6ff'; borderColor = '#3b82f6'; textColor = '#1e40af' }
  return { padding: '12px 16px', marginBottom: '8px', borderRadius: '6px', border: `1px solid ${borderColor}`, background, color: textColor, cursor: showResults ? 'default' : 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px' }
}
const resultCard = { background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #f59e0b', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '16px' }
const progressBar = { width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }
const progressFill = (percentage) => ({ height: '100%', width: `${percentage}%`, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', borderRadius: '3px', transition: 'width 0.3s ease' })

export default function LearningPathGenerator() {
  const [topic, setTopic] = useState('')
  const [curriculum, setCurriculum] = useState([])
  const [selected, setSelected] = useState(null)
  const [expanded, setExpanded] = useState(new Set())
  const [detailTab, setDetailTab] = useState('content') // 'content' | 'quiz'
  const [loadingExplain, setLoadingExplain] = useState(false)
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [showQuizResults, setShowQuizResults] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [quizError, setQuizError] = useState('')
  const [generatingQuiz, setGeneratingQuiz] = useState(false)

  const onGenerate = async () => {
    setSelected(null)
    const next = await generateCurriculumFromTopicAI(topic)
    setCurriculum(next)
  }

  const onReset = () => {
    setTopic('')
    setCurriculum([])
    setSelected(null)
    resetQuiz()
  }

  const resetQuiz = () => {
    setQuizQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setShowQuizResults(false)
    setQuizStarted(false)
    setLoadingQuiz(false)
    setQuizError('')
    setGeneratingQuiz(false)
  }

  const openSubmodule = async (sub, mod) => {
    setLoadingExplain(true)
    resetQuiz()
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

  const loadQuiz = async () => {
    if (!selected) return
    
    setLoadingQuiz(true)
    setQuizError('')
    try {
      const quizTopic = `${selected.mod.title} - ${selected.sub.title}`
      
      // First try to get existing questions
      try {
        const response = await getQuizQuestions(quizTopic, null, 5)
        if (response.questions && response.questions.length > 0) {
          console.log('Found existing quiz questions:', response.questions)
          setQuizQuestions(response.questions || [])
          setSelectedAnswers(new Array(response.questions?.length || 0).fill(null))
          setCurrentQuestionIndex(0)
          setShowQuizResults(false)
          setQuizStarted(false)
          return
        }
      } catch (error) {
        console.log('No existing questions found, will generate new ones')
      }
      
      // If no existing questions, generate new ones using AI
      setGeneratingQuiz(true)
      const aiResponse = await generateQuizQuestions(quizTopic, selected.explanation, 5)
      console.log('Generated AI quiz questions:', aiResponse.questions)
      setQuizQuestions(aiResponse.questions || [])
      setSelectedAnswers(new Array(aiResponse.questions?.length || 0).fill(null))
      setCurrentQuestionIndex(0)
      setShowQuizResults(false)
      setQuizStarted(false)
      
    } catch (error) {
      setQuizError(error.message || 'Failed to load or generate quiz questions')
    } finally {
      setLoadingQuiz(false)
      setGeneratingQuiz(false)
    }
  }

  const startQuiz = () => {
    setQuizStarted(true)
  }

  const handleAnswerSelect = (answerIndex) => {
    if (showQuizResults) return
    
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const finishQuiz = () => {
    setShowQuizResults(true)
    setQuizStarted(false)
  }

  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers(new Array(quizQuestions.length).fill(null))
    setShowQuizResults(false)
    setQuizStarted(false)
  }

  const getScore = () => {
    let correct = 0
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index]?.correct_answer) {
        correct++
      }
    })
    return { correct, total: quizQuestions.length, percentage: Math.round((correct / quizQuestions.length) * 100) }
  }

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return '🎉 Excellent! You\'ve mastered this topic!'
    if (percentage >= 80) return '🌟 Great job! You really understand this!'
    if (percentage >= 70) return '👍 Good work! Keep learning!'
    if (percentage >= 60) return '📚 Not bad! Review and try again!'
    return '📖 Keep studying! Practice makes perfect!'
  }

  const toggleExpand = (id) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id); else next.add(id)
    setExpanded(next)
  }

  // Load quiz when switching to quiz tab
  const handleTabChange = (tab) => {
    setDetailTab(tab)
    if (tab === 'quiz' && quizQuestions.length === 0 && !loadingQuiz && !generatingQuiz) {
      loadQuiz()
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
                  <button 
                    onClick={() => handleTabChange('content')} 
                    style={{ 
                      padding: '6px 10px', 
                      borderRadius: 8, 
                      border: '1px solid #e5e7eb', 
                      background: detailTab==='content'?'#eef2ff':'white', 
                      color: detailTab==='content'?'#3730a3':'#111827', 
                      cursor: 'pointer' 
                    }}
                  >
                    Module Content
                  </button>
                  <button 
                    onClick={() => handleTabChange('quiz')} 
                    style={{ 
                      padding: '6px 10px', 
                      borderRadius: 8, 
                      border: '1px solid #e5e7eb', 
                      background: detailTab==='quiz'?'#eef2ff':'white', 
                      color: detailTab==='quiz'?'#3730a3':'#111827', 
                      cursor: 'pointer' 
                    }}
                  >
                    Knowledge Check
                  </button>
                </div>
                
                {detailTab === 'content' && (
                  loadingExplain ? (
                    <div style={{ color: '#64748b' }}>Loading...</div>
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: 1.6 }}>{selected.explanation || 'No explanation.'}</div>
                  )
                )}
                
                {detailTab === 'quiz' && (
                  <div style={quizContainer}>
                    {loadingQuiz && (
                      <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>⏳ Loading Knowledge Check...</div>
                        <div style={{ fontSize: '14px' }}>Preparing quiz questions...</div>
                      </div>
                    )}
                    
                    {generatingQuiz && (
                      <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>🤖 Generating Quiz Questions...</div>
                        <div style={{ fontSize: '14px' }}>AI is creating questions based on the topic content...</div>
                      </div>
                    )}
                    
                    {quizError && (
                      <div style={{ textAlign: 'center', color: '#ef4444', padding: '20px' }}>
                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>❌ Error Loading Quiz</div>
                        <div style={{ fontSize: '14px', marginBottom: '16px' }}>{quizError}</div>
                        <button onClick={loadQuiz} style={quizButton}>
                          🔄 Retry
                        </button>
                      </div>
                    )}
                    
                    {!loadingQuiz && !generatingQuiz && !quizError && quizQuestions.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>📚 No Quiz Available</div>
                        <div style={{ fontSize: '14px', marginBottom: '16px' }}>
                          This module doesn't have quiz questions yet.
                        </div>
                        <button onClick={loadQuiz} style={quizButton}>
                          🔄 Check Again
                        </button>
                      </div>
                    )}
                    
                    {!loadingQuiz && !generatingQuiz && !quizError && quizQuestions.length > 0 && !quizStarted && !showQuizResults && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', marginBottom: '8px' }}>🧠</div>
                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                          Knowledge Check: {selected.sub.title}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                          Test your understanding with {quizQuestions.length} questions
                        </div>
                        <button onClick={startQuiz} style={quizButton}>
                          🚀 Start Quiz
                        </button>
                      </div>
                    )}
                    
                    {!loadingQuiz && !generatingQuiz && !quizError && quizQuestions.length > 0 && quizStarted && !showQuizResults && (
                      <div>
                        {/* Progress Bar */}
                        <div style={progressBar}>
                          <div style={progressFill(((currentQuestionIndex + 1) / quizQuestions.length) * 100)}></div>
                        </div>
                        
                        {/* Question */}
                        <div style={questionStyle}>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                              Question {currentQuestionIndex + 1} of {quizQuestions.length}
                            </div>
                            <div style={{ fontWeight: '600', fontSize: '16px', lineHeight: '1.5' }}>
                              {quizQuestions[currentQuestionIndex]?.question}
                            </div>
                          </div>
                          
                          {/* Options */}
                          {quizQuestions[currentQuestionIndex]?.options?.map((option, index) => (
                            <div
                              key={index}
                              style={optionStyle(
                                selectedAnswers[currentQuestionIndex] === index,
                                index === quizQuestions[currentQuestionIndex]?.correct_answer,
                                showQuizResults
                              )}
                              onClick={() => handleAnswerSelect(index)}
                            >
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: '2px solid currentColor',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: '600'
                              }}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span>{option}</span>
                              {showQuizResults && index === quizQuestions[currentQuestionIndex]?.correct_answer && (
                                <div style={{ marginLeft: 'auto', fontSize: '16px' }}>✅</div>
                              )}
                              {showQuizResults && selectedAnswers[currentQuestionIndex] === index && index !== quizQuestions[currentQuestionIndex]?.correct_answer && (
                                <div style={{ marginLeft: 'auto', fontSize: '16px' }}>❌</div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Navigation */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                          <button
                            onClick={previousQuestion}
                            disabled={currentQuestionIndex === 0}
                            style={{
                              ...quizButton,
                              background: currentQuestionIndex === 0 ? '#9ca3af' : '#3b82f6',
                              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            ← Previous
                          </button>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={finishQuiz} style={quizButton}>
                              🏁 Finish
                            </button>
                            
                            {currentQuestionIndex < quizQuestions.length - 1 && (
                              <button
                                onClick={nextQuestion}
                                disabled={selectedAnswers[currentQuestionIndex] === null}
                                style={{
                                  ...quizButton,
                                  background: selectedAnswers[currentQuestionIndex] === null ? '#9ca3af' : '#3b82f6',
                                  cursor: selectedAnswers[currentQuestionIndex] === null ? 'not-allowed' : 'pointer'
                                }}
                              >
                                Next →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!loadingQuiz && !generatingQuiz && !quizError && showQuizResults && (
                      <div>
                        <div style={resultCard}>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                          <div style={{ fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>
                            Knowledge Check Complete!
                          </div>
                          {(() => {
                            const score = getScore()
                            return (
                              <>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                                  {score.correct} out of {score.total} correct
                                </div>
                                <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '12px' }}>
                                  {score.percentage}% Score
                                </div>
                                <div style={{ fontSize: '12px', color: '#92400e', fontStyle: 'italic', marginBottom: '16px' }}>
                                  {getScoreMessage(score.percentage)}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button onClick={restartQuiz} style={quizButton}>
                                    🔄 Try Again
                                  </button>
                                  <button onClick={loadQuiz} style={quizButton}>
                                    📚 New Quiz
                                  </button>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
