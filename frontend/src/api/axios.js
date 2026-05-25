import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

let accessToken = null

export function getToken() {
  return accessToken
}

export function setToken(token) {
  accessToken = token
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken')
}

export function setRefreshToken(token) {
  localStorage.setItem('refreshToken', token)
}

export function clearTokens() {
  accessToken = null
  localStorage.removeItem('refreshToken')
}

// JWT payload 디코딩 (email 추출용)
export function parseToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return { email: payload.sub }
  } catch {
    return null
  }
}

// request 인터셉터: Authorization 헤더 자동 주입
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// response 인터셉터: 401 시 토큰 재발급 후 재요청
let isRefreshing = false
let refreshQueue = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const skipUrls = ['/api/members/login', '/api/members/signup']
    const isAuthRequest = skipUrls.some((url) => originalRequest.url?.includes(url))

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then(() => {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(
          `${API_URL}/api/members/reissue`,
          null,
          { headers: { RefreshToken: refreshToken } }
        )
        setToken(res.data.accessToken)
        setRefreshToken(res.data.refreshToken)
        refreshQueue.forEach((p) => p.resolve())
        refreshQueue = []
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`
        return api(originalRequest)
      } catch {
        clearTokens()
        refreshQueue.forEach((p) => p.reject(error))
        refreshQueue = []
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
