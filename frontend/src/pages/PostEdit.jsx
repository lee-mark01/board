import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchPost, updatePost } from '../api/posts'
import { useAuth } from '../context/AuthContext'

export default function PostEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [form, setForm] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  useEffect(() => {
    fetchPost(id)
      .then((post) => {
        setForm({ title: post.title, content: post.content })
        setLoading(false)
      })
      .catch(() => {
        alert('게시글을 불러올 수 없습니다.')
        navigate('/')
      })
  }, [id, navigate])

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await updatePost(id, form)
      navigate(`/posts/${id}`)
    } catch (e) {
      alert(e.message)
      setSubmitting(false)
    }
  }

  if (loading || authLoading)
    return <p className="text-center py-16 text-gray-400">로딩 중...</p>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">글 수정</h1>
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
            to={`/posts/${id}`}
            className="px-5 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-sm text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? '수정 중...' : '수정'}
          </button>
        </div>
      </form>
    </div>
  )
}
