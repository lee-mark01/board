import api, { setToken, setRefreshToken, clearTokens, getRefreshToken } from './axios'

export async function signup({ email, password, userName }) {
  await api.post('/api/members/signup', { email, password, userName })
}

export async function login({ email, password }) {
  const res = await api.post('/api/members/login', { email, password })
  setToken(res.data.accessToken)
  setRefreshToken(res.data.refreshToken)
  return res.data
}

export async function logout() {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    try {
      await api.post('/api/members/logout', null, {
        headers: { RefreshToken: refreshToken },
      })
    } catch {
      // 로그아웃 실패해도 로컬 토큰은 삭제
    }
  }
  clearTokens()
}

export async function reissue() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')
  const res = await api.post('/api/members/reissue', null, {
    headers: { RefreshToken: refreshToken },
  })
  setToken(res.data.accessToken)
  setRefreshToken(res.data.refreshToken)
  return res.data
}
