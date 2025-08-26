import React, { useState, useEffect } from 'react'
import { getQuizQuestions } from '../api.js'
// import { VoiceButton } from './VoiceUtils.jsx'

// Clean Professional UI Components
const containerStyle = {
  padding: '24px',
  background: '#f8fafc',
  minHeight: '100vh',
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
  padding: '24px',
  background: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0'
}

const questionStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '32px',
  marginBottom: '24px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e2e8f0'
}

const optionStyle = (selected, correct, showResults) => {
  let background = 'white'
  let borderColor = '#e2e8f0'
  let textColor = '#475569'
  
  if (showResults) {
    if (correct) {
      background = '#f0fdf4'
      borderColor = '#10b981'
      textColor = '#065f46'
    } else if (selected && !correct) {
      background = '#fef2f2'
      borderColor = '#ef4444'
      textColor = '#991b1b'
    }
  } else if (selected) {
    background = '#eff6ff'
    borderColor = '#3b82f6'
    textColor = '#1e40af'
  }
  
  return {
    padding: '20px 24px',
    marginBottom: '16px',
    borderRadius: '8px',
    border: `1px solid ${borderColor}`,
    background: background,
    color: textColor,
    cursor: showResults ? 'default' : 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    overflow: 'hidden'
  }
}

const buttonStyle = {
  padding: '16px 32px',
  border: 'none',
  borderRadius: '8px',
  background: '#3b82f6',
  color: 'white',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: '600',
  transition: 'all 0.2s ease'
}

const disabledButtonStyle = {
  ...buttonStyle,
  background: '#9ca3af',
  cursor: 'not-allowed'
}

const timerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '18px',
  fontWeight: '600',
  color: '#475569',
  padding: '12px 20px',
  background: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)'
}

const progressBar = {
  width: '100%',
  height: '8px',
  background: '#e5e7eb',
  borderRadius: '4px',
  overflow: 'hidden',
  marginBottom: '24px'
}

const progressFill = (percentage) => ({
  height: '100%',
  width: `${percentage}%`,
  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
  borderRadius: '4px',
  transition: 'width 0.3s ease'
})

const resultCard = {
  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  border: '1px solid #f59e0b',
  borderRadius: '20px',
  padding: '32px',
  textAlign: 'center',
  marginBottom: '24px'
}

const emptyState = {
  textAlign: 'center',
  color: '#6b7280',
  padding: '80px 20px'
}

const emptyTitle = {
  fontSize: '32px',
  marginBottom: '16px',
  color: '#374151'
}

const emptyText = {
  fontSize: '18px',
  marginBottom: '24px',
  lineHeight: '1.6'
}

export default function Quiz({ selectedTopic }) {
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    if (selectedTopic) {
      loadQuiz()
    }
  }, [selectedTopic])

  useEffect(() => {
    let interval
    if (quizStarted && !showResults) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [quizStarted, showResults])

  const loadQuiz = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getQuizQuestions(selectedTopic, null, 10)
      console.log('Quiz data:', response.questions)
      setQuestions(response.questions || [])
      setSelectedAnswers(new Array(response.questions?.length || 0).fill(null))
      setCurrentQuestionIndex(0)
      setShowResults(false)
      setTimeElapsed(0)
      setQuizStarted(false)
    } catch (error) {
      setError(error.message || 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex) => {
    if (showResults) return
    
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const finishQuiz = () => {
    console.log('Finish quiz called!')
    setShowResults(true)
    setQuizStarted(false)
  }

  const restartQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers(new Array(questions.length).fill(null))
    setShowResults(false)
    setTimeElapsed(0)
    setQuizStarted(false)
  }

  const startQuiz = () => {
    setQuizStarted(true)
  }

  const getScore = () => {
    let correct = 0
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index]?.correct_answer) {
        correct++
      }
    })
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) }
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#10b981'
    if (percentage >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return '🎉 Excellent! You\'re a master!'
    if (percentage >= 80) return '🌟 Great job! You really know your stuff!'
    if (percentage >= 70) return '👍 Good work! Keep learning!'
    if (percentage >= 60) return '📚 Not bad! Review and try again!'
    return '📖 Keep studying! Practice makes perfect!'
  }

  // Safety check for current question
  if (!questions || questions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={emptyState}>
          <div style={emptyTitle}>📚 No Quiz Available</div>
          <div style={emptyText}>
            This topic doesn't have any quiz questions yet.<br />
            Admins need to add questions through the Quiz Manager first.
          </div>
          <button onClick={loadQuiz} style={buttonStyle}>
            🔄 Check Again
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={emptyState}>
          <div style={emptyTitle}>⏳ Loading Quiz...</div>
          <div style={emptyText}>Preparing your quiz questions...</div>
        </div>
      </div>
    )
  }

  if (error && questions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={emptyState}>
          <div style={emptyTitle}>❌ Error Loading Quiz</div>
          <div style={emptyText}>{error}</div>
          <button onClick={loadQuiz} style={buttonStyle}>
            🔄 Retry
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  
  // Safety check for current question
  if (!currentQuestion) {
    return (
      <div style={containerStyle}>
        <div style={emptyState}>
          <div style={emptyTitle}>❌ Error Loading Question</div>
          <div style={emptyText}>Unable to load question {currentQuestionIndex + 1}</div>
          <button onClick={loadQuiz} style={buttonStyle}>
            🔄 Retry
          </button>
        </div>
      </div>
    )
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const allAnswered = selectedAnswers.every(answer => answer !== null)

  if (!quizStarted) {
    return (
      <div style={containerStyle}>
        <div style={questionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, color: '#1f2937', fontSize: '32px', fontWeight: '700' }}>
                Quiz: {selectedTopic}
              </h2>
              {/* <VoiceButton
                text={`Quiz: ${selectedTopic}. Test your knowledge with ${questions.length} questions about ${selectedTopic}. Take your time and think carefully about each answer!`}
                type="output"
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  fontSize: '16px',
                  flexShrink: 0
                }}
              /> */}
            </div>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '18px', lineHeight: '1.6' }}>
              Test your knowledge with {questions.length} questions about {selectedTopic}.<br />
              Take your time and think carefully about each answer!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ padding: '12px 20px', background: '#f3f4f6', borderRadius: '12px', fontSize: '14px' }}>
                📝 {questions.length} Questions
              </div>
              <div style={{ padding: '12px 20px', background: '#f3f4f6', borderRadius: '12px', fontSize: '14px' }}>
                ⏱️ No Time Limit
              </div>
              <div style={{ padding: '12px 20px', background: '#f3f4f6', borderRadius: '12px', fontSize: '14px' }}>
                🎯 Multiple Choice
              </div>
            </div>
          </div>
          <button onClick={startQuiz} style={buttonStyle}>
            🚀 Start Quiz
          </button>
        </div>
      </div>
    )
  }

  if (showResults) {
    const score = getScore()
    return (
      <div style={containerStyle}>
        <div style={resultCard}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, color: '#92400e', fontSize: '32px', fontWeight: '700' }}>
              Quiz Complete!
            </h2>
            {/* <VoiceButton
              text={`Quiz Complete! You got ${score.correct} out of ${score.total} correct. That's ${score.percentage}%. ${getScoreMessage(score.percentage)}`}
              type="output"
              style={{ 
                width: '40px', 
                height: '40px', 
                fontSize: '16px',
                flexShrink: 0
              }}
            /> */}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
            {score.correct} out of {score.total} correct
          </div>
          <div style={{ fontSize: '18px', color: '#92400e', marginBottom: '24px' }}>
            {score.percentage}% Score
          </div>
          <div style={{ fontSize: '16px', color: '#92400e', marginBottom: '32px', fontStyle: 'italic' }}>
            {getScoreMessage(score.percentage)}
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={restartQuiz} style={buttonStyle}>
              🔄 Try Again
            </button>
            <button onClick={loadQuiz} style={buttonStyle}>
              📚 New Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '24px', fontWeight: '700' }}>
            🧠 Quiz: {selectedTopic}
          </h3>
          <div style={{ color: '#6b7280', fontSize: '16px' }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        <div style={timerStyle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={progressBar}>
        <div style={progressFill(((currentQuestionIndex + 1) / questions.length) * 100)}></div>
      </div>

      {/* Question */}
      <div style={questionStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
          <h4 style={{ margin: 0, color: '#111827', fontSize: '20px', fontWeight: '600', lineHeight: '1.6', flex: 1 }}>
            {currentQuestion.question}
          </h4>
          {/* <VoiceButton
            text={currentQuestion.question}
            type="output"
            style={{ 
              width: '40px', 
              height: '40px', 
              fontSize: '16px',
              flexShrink: 0,
              marginTop: '4px'
            }}
          /> */}
        </div>
        
        {/* Options */}
        {currentQuestion.options && currentQuestion.options.map((option, index) => (
          <div
            key={index}
            style={optionStyle(
              selectedAnswers[currentQuestionIndex] === index,
              index === currentQuestion.correct_answer,
              showResults
            )}
            onClick={() => handleAnswerSelect(index)}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid currentColor',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {String.fromCharCode(65 + index)}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{option}</span>
              {/* <VoiceButton
                text={option}
                type="output"
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  fontSize: '12px',
                  flexShrink: 0
                }}
              /> */}
            </div>
            {showResults && index === currentQuestion.correct_answer && (
              <div style={{ marginLeft: 'auto', fontSize: '20px' }}>✅</div>
            )}
            {showResults && selectedAnswers[currentQuestionIndex] === index && index !== currentQuestion.correct_answer && (
              <div style={{ marginLeft: 'auto', fontSize: '20px' }}>❌</div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          style={currentQuestionIndex === 0 ? disabledButtonStyle : buttonStyle}
        >
          ← Previous
        </button>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={finishQuiz} style={buttonStyle}>
            🏁 Finish Quiz
          </button>
          
          {!isLastQuestion && (
            <button
              onClick={nextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === null}
              style={selectedAnswers[currentQuestionIndex] === null ? disabledButtonStyle : buttonStyle}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
