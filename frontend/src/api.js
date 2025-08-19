import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000',
  timeout: 60000,
})

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qc_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const detail = error?.response?.data?.detail
    const message = typeof detail === 'string' ? detail : (detail?.message || error.message)
    return Promise.reject(new Error(message || 'Request failed'))
  }
)

export async function getTopics() {
  const { data } = await api.get('/topics')
  return data
}

export async function getSections() {
  const { data } = await api.get('/sections')
  return data
}

export async function explainTopic(topic, model) {
  const { data } = await api.post('/explain-topic', { topic, model })
  return data
}

export async function chat(messages, model) {
  const { data } = await api.post('/chat', { messages, model })
  return data
}

export async function register({ email, password, username, name }) {
  const { data } = await api.post('/auth/register', { email, password, username, name })
  return data
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export async function me() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function logout() {
  const { data } = await api.post('/auth/logout')
  return data
}


