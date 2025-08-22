import React, { useState, useEffect } from 'react'
import { getQuizQuestions, submitQuiz } from '../api.js'

const containerStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 130px)',
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: '1px solid #e5e7eb',
}

const questionStyle = {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
}

const optionStyle = (isSelected, isCorrect, showResults) => ({
  padding: '12px 16px',
  margin: '8px 0',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  cursor: showResults ? 'default' : 'pointer',
  background: showResults 
    ? isCorrect 
      ? '#dcfce7' 
      : isSelected && !isCorrect 
        ? '#fecaca' 
        : 'white'
    : isSelected 
      ? '#e0f2fe' 
      : 'white',
  color: showResults && isCorrect ? '#166534' : '#111827',
  transition: 'all 0.2s',
})

const buttonStyle = {
  background: '#111827',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  padding: '12px 24px',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
}

const disabledButtonStyle = {
  ...buttonStyle,
  background: '#9ca3af',
  cursor: 'not-allowed',
}

const timerStyle = {
  fontSize: 14,
  color: '#6b7280',
  fontWeight: 500,
}

const resultsStyle = {
  background: '#f8fafc',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 16,
  marginTop: 16,
}

export default function Quiz({ selectedTopic, onClose }) {
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  useEffect(() => {
    if (selectedTopic) {
      loadQuiz()
    }
  }, [selectedTopic])

  useEffect(() => {
    let interval
    if (startTime && !quizCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [startTime, quizCompleted])

  const loadQuiz = async () => {
    if (!selectedTopic) return
    
    setLoading(true)
    setError('')
    try {
      console.log('Loading quiz for topic:', selectedTopic)
      const response = await getQuizQuestions(selectedTopic)
      console.log('Quiz response:', response)
      
      if (!response || !response.questions) {
        throw new Error('Invalid response format from server')
      }
      
      setQuestions(response.questions)
      setSelectedAnswers(new Array(response.questions.length).fill(null))
      setCurrentQuestionIndex(0)
      setStartTime(Date.now())
      setTimeElapsed(0)
      setShowResults(false)
      setQuizCompleted(false)
      
      console.log('Questions loaded:', response.questions.length)
    } catch (err) {
      console.error('Quiz loading error:', err)
      setError(err.message || 'Failed to load quiz')
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

  const submitQuizAnswers = async () => {
    if (selectedAnswers.some(answer => answer === null)) {
      setError('Please answer all questions before submitting')
      return
    }

    setLoading(true)
    try {
      const quizId = `quiz_${Date.now()}`
      await submitQuiz(quizId, selectedAnswers, timeElapsed)
      setQuizCompleted(true)
      setShowResults(true)
    } catch (err) {
      setError(err.message || 'Failed to submit quiz')
    } finally {
      setLoading(false)
    }
  }

  const restartQuiz = () => {
    loadQuiz()
  }

  if (!selectedTopic) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <h3>Select a topic to start a quiz</h3>
          <p>Choose a topic from the left panel to begin practicing</p>
        </div>
      </div>
    )
  }

  if (loading && questions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center' }}>
          <div>Loading quiz...</div>
        </div>
      </div>
    )
  }

  if (error && questions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <div>Error: {error}</div>
          <button 
            onClick={loadQuiz} 
            style={{ ...buttonStyle, marginTop: 16 }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Safety check for current question
  if (!questions || questions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <h3>No quiz here</h3>
          <p>This topic doesn't have any quiz questions yet.</p>
          <p>Admins need to add questions through the Quiz Manager first.</p>
          <button onClick={loadQuiz} style={{ ...buttonStyle, marginTop: 16 }}>
            Check Again
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
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <h3>Error loading question</h3>
          <p>Unable to load question {currentQuestionIndex + 1}</p>
          <button onClick={loadQuiz} style={{ ...buttonStyle, marginTop: 16 }}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const allAnswered = selectedAnswers.every(answer => answer !== null)

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h3 style={{ margin: 0, color: '#111827' }}>Quiz: {selectedTopic}</h3>
          <div style={timerStyle}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        <div style={timerStyle}>
          Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Question */}
      <div style={questionStyle}>
        <h4 style={{ margin: '0 0 16px 0', color: '#111827' }}>
          {currentQuestion.question}
        </h4>
        
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
            {String.fromCharCode(65 + index)}. {option}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          style={currentQuestionIndex === 0 ? disabledButtonStyle : buttonStyle}
        >
          Previous
        </button>

        {!isLastQuestion ? (
          <button
            onClick={nextQuestion}
            style={buttonStyle}
          >
            Next
          </button>
        ) : (
          <button
            onClick={submitQuizAnswers}
            disabled={!allAnswered || loading}
            style={!allAnswered || loading ? disabledButtonStyle : buttonStyle}
          >
            {loading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      {/* Results */}
      {showResults && (
        <div style={resultsStyle}>
          <h4 style={{ margin: '0 0 12px 0', color: '#111827' }}>Quiz Results</h4>
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '4px 0' }}>
              <strong>Score:</strong> {selectedAnswers.filter((answer, index) => 
                answer === questions[index].correct_answer
              ).length} / {questions.length}
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong>Time:</strong> {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={restartQuiz} style={buttonStyle}>
              Take Quiz Again
            </button>
            <button onClick={onClose} style={{ ...buttonStyle, background: '#6b7280' }}>
              Close Quiz
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: 8, 
          padding: 12, 
          marginTop: 16,
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
