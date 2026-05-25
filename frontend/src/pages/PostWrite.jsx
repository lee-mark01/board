import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createPost } from '../api/posts'
import { useAuth } from '../context/AuthContext'

export default function PostWrite() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [form, setForm] = useState({ title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const post = await createPost(form)
      navigate(`/posts/${post.id}`)
    } catch (e) {
      alert(e.message)
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">새 글 작성</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">제목</label>
          <input
            type="text"
            value={form.title}
            onChange={update('title')}
            placeholder="제목을 입력하세요"
            required
            className="w-full px-4 py-2.5 text-[15px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">내용</label>
          <textarea
            value={form.content}
            onChange={update('content')}
            placeholder="내용을 입력하세요"
            required
            rows={12}
            className="w-full px-4 py-2.5 text-[15px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all resize-y"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/"
            className="px-5 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? '작성 중...' : '작성'}
          </button>
        </div>
      </form>
    </div>
  )
}
