import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchPost, deletePost } from '../api/posts'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDelete, setShowDelete] = useState(false)
  const [authForm, setAuthForm] = useState({ password: '' })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchPost(id)
      .then(setPost)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async (e) => {
    e.preventDefault()
    setDeleting(true)
    try {
      await deletePost({
        id: parseInt(id),
        password: authForm.password,
      })
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

  if (loading) return <p className="status-msg">로딩 중...</p>
  if (error) return <p className="status-msg error">{error}</p>
  if (!post) return null

  return (
    <div>
      <article className="post-detail">
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <span>{post.userName}</span>
          <span className="separator">·</span>
          <span>{formatDate(post.createAt)}</span>
          {post.updateAt !== post.createAt && (
            <>
              <span className="separator">·</span>
              <span>수정됨 {formatDate(post.updateAt)}</span>
            </>
          )}
        </div>
        <div className="post-content">{post.content}</div>
      </article>

      <div className="post-actions">
        <Link to={`/posts/${id}/edit`}>
          <button>수정</button>
        </Link>
        <button className="danger" onClick={() => setShowDelete(!showDelete)}>
          삭제
        </button>
      </div>

      {showDelete && (
        <form onSubmit={handleDelete} className="auth-form">
          <p className="auth-label">삭제하려면 비밀번호를 입력하세요</p>
          <input
            type="password"
            placeholder="비밀번호"
            value={authForm.password}
            onChange={(e) =>
              setAuthForm({ ...authForm, password: e.target.value })
            }
            required
          />
          <button type="submit" className="danger" disabled={deleting}>
            {deleting ? '삭제 중...' : '삭제 확인'}
          </button>
        </form>
      )}

      <div className="back-link">
        <Link to="/">&lt; 목록으로</Link>
      </div>

      <style>{`
        .post-detail {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 32px;
          margin-bottom: 16px;
        }
        .post-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 12px;
          font-family: var(--font-mono);
        }
        .post-meta {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }
        .separator {
          margin: 0 8px;
        }
        .post-content {
          white-space: pre-wrap;
          line-height: 1.8;
        }
        .post-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .auth-form {
          background: var(--surface);
          border: 1px solid var(--danger);
          border-radius: var(--radius);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }
        .auth-label {
          font-size: 13px;
          color: var(--danger);
        }
        .back-link {
          margin-top: 24px;
        }
        .status-msg {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }
        .status-msg.error {
          color: var(--danger);
        }
      `}</style>
    </div>
  )
}
