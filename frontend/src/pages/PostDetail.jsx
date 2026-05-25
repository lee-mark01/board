import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchPost, deletePost } from '../api/posts'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchPost(id)
      .then(setPost)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setDeleting(true)
    try {
      await deletePost(id)
      navigate('/')
    } catch (e) {
      alert(e.message)
      setDeleting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString('ko-KR')
  }

  if (loading) return <p className="text-center py-16 text-gray-400">로딩 중...</p>
  if (error) return <p className="text-center py-16 text-red-500">{error}</p>
  if (!post) return null

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        목록으로
      </Link>

      <article className="bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400 pb-6 border-b border-gray-100">
          <span className="text-gray-600">{post.userName}</span>
          <span>·</span>
          <span>{formatDate(post.createAt)}</span>
          {post.updateAt !== post.createAt && (
            <>
              <span>·</span>
              <span>수정됨</span>
            </>
          )}
        </div>
        <div className="pt-6 text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      {user && (
        <div className="flex gap-2 mt-4">
          <Link
            to={`/posts/${id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Pencil size={14} />
            수정
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={14} />
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      )}
    </div>
  )
}
