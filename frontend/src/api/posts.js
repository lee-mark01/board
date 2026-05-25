import api from './axios'

export async function fetchPosts(page = 0, size = 10, keyword = '') {
  const params = { page, size }
  if (keyword) params.keyword = keyword
  const res = await api.get('/api/posts', { params })
  return res.data
}

export async function fetchPost(id) {
  const res = await api.get(`/api/posts/${id}`)
  return res.data
}

export async function createPost({ title, content }) {
  const res = await api.post('/api/posts', { title, content })
  return res.data
}

export async function updatePost(id, { title, content }) {
  const res = await api.put(`/api/posts/${id}`, { title, content })
  return res.data
}

export async function deletePost(id) {
  await api.delete(`/api/posts/${id}`)
}
