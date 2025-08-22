import axios from 'axios'

const API_BASE = 'http://localhost:8000'

// Auth APIs
export const register = async (userData) => {
  console.log('Register API call with userData:', userData)
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, userData)
    console.log('Register API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Register API error:', error.response?.data || error.message)
    throw error
  }
}

export const login = async (credentials) => {
  console.log('Login API call with credentials:', credentials)
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials)
    console.log('Login API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message)
    throw error
  }
}

export const me = async () => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// Topic and Progress APIs
export const getSections = async () => {
  const response = await axios.get(`${API_BASE}/sections`)
  return response.data
}

export const explainTopic = async (topic) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.post(`${API_BASE}/explain-topic`, { topic }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const getUserProgress = async () => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.get(`${API_BASE}/progress`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const getProgressSummary = async () => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.get(`${API_BASE}/progress/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const updateProgress = async (topic, completed) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.post(`${API_BASE}/progress/update`, { topic, completed }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// Chat API
export const chat = async (messages) => {
  const response = await axios.post(`${API_BASE}/chat`, { messages })
  return response.data
}

// Quiz APIs
export const getQuizTopics = async () => {
  const response = await axios.get(`${API_BASE}/quiz/topics`)
  return response.data
}

export const getQuizQuestions = async (topic, difficulty, questionCount) => {
  console.log('API call - getQuizQuestions:', { topic, difficulty, questionCount })
  try {
    const response = await axios.post(`${API_BASE}/quiz/questions`, {
      topic,
      difficulty,
      question_count: questionCount
    })
    console.log('API response:', response.data)
    return response.data
  } catch (error) {
    console.error('API error:', error)
    throw error
  }
}

export const submitQuiz = async (quizId, answers, timeTaken) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.post(`${API_BASE}/quiz/submit`, {
    quiz_id: quizId,
    answers,
    time_taken: timeTaken
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const getQuizResults = async () => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.get(`${API_BASE}/quiz/results`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// Bookmark APIs
export const createBookmark = async (topic, title, content) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.post(`${API_BASE}/bookmarks/`, {
    topic,
    title,
    content
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const getBookmarks = async (topic = null) => {
  const token = localStorage.getItem('qc_token')
  const params = topic ? { topic } : {}
  const response = await axios.get(`${API_BASE}/bookmarks/`, {
    params,
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const updateBookmark = async (bookmarkId, title, content) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.put(`${API_BASE}/bookmarks/${bookmarkId}`, {
    title,
    content
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const deleteBookmark = async (bookmarkId) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.delete(`${API_BASE}/bookmarks/${bookmarkId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// Note APIs
export const createNote = async (topic, title, content) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.post(`${API_BASE}/bookmarks/notes`, {
    topic,
    title,
    content
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const getNotes = async (topic = null) => {
  const token = localStorage.getItem('qc_token')
  const params = topic ? { topic } : {}
  const response = await axios.get(`${API_BASE}/bookmarks/notes`, {
    params,
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const updateNote = async (noteId, title, content) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.put(`${API_BASE}/bookmarks/notes/${noteId}`, {
    title,
    content
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const deleteNote = async (noteId) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.delete(`${API_BASE}/bookmarks/notes/${noteId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const getBookmarksNotesSummary = async () => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.get(`${API_BASE}/bookmarks/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// Admin APIs
export const adminListUsers = async () => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.get(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminCreateUser = async (payload) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.post(`${API_BASE}/admin/users`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminUpdateUser = async (userId, payload) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.put(`${API_BASE}/admin/users/${userId}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminDeleteUser = async (userId) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.delete(`${API_BASE}/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminListSections = async () => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.get(`${API_BASE}/admin/sections`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminCreateSection = async (section) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.post(`${API_BASE}/admin/sections`, section, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminUpdateSection = async (sectionId, section) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.put(`${API_BASE}/admin/sections/${sectionId}`, section, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminDeleteSection = async (sectionId) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.delete(`${API_BASE}/admin/sections/${sectionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminSeedDefaultSections = async () => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.post(`${API_BASE}/admin/sections/seed-defaults`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// Quiz Management APIs
export const adminListQuizQuestions = async (section = null, topic = null) => {
  const token = localStorage.getItem('qc_token')
  const params = {}
  if (section) params.section = section
  if (topic) params.topic = topic
  
  const response = await axios.get(`${API_BASE}/admin/quiz/questions`, {
    params,
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminCreateQuizQuestion = async (questionData) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.post(`${API_BASE}/admin/quiz/questions`, questionData, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminUpdateQuizQuestion = async (questionId, questionData) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.put(`${API_BASE}/admin/quiz/questions/${questionId}`, questionData, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminDeleteQuizQuestion = async (questionId) => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.delete(`${API_BASE}/admin/quiz/questions/${questionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

export const adminGetQuizStats = async () => {
  const token = localStorage.getItem('qc_token')
  const response = await axios.get(`${API_BASE}/admin/quiz/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}


