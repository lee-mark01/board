import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchPost, updatePost } from '../api/posts'

export default function PostEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    content: '',
    password: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPost(id)
      .then((post) => {
        setForm((f) => ({ ...f, title: post.title, content: post.content }))
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
      await updatePost({ id: parseInt(id), ...form })
      navigate(`/posts/${id}`)
    } catch (e) {
      alert(e.message)
      setSubmitting(false)
    }
  }

  if (loading) return <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>로딩 중...</p>

  return (
    <div>
      <h2 className="page-title">글 수정</h2>
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            placeholder="수정하려면 비밀번호를 입력하세요"
            required
          />
        </div>
        <div className="form-group">
          <label>제목</label>
          <input
            type="text"
            value={form.title}
            onChange={update('title')}
            placeholder="제목을 입력하세요"
            required
          />
        </div>
        <div className="form-group">
          <label>내용</label>
          <textarea
            value={form.content}
            onChange={update('content')}
            placeholder="내용을 입력하세요"
            required
          />
        </div>
        <div className="form-actions">
          <Link to={`/posts/${id}`}>
            <button type="button">취소</button>
          </Link>
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? '수정 중...' : '수정'}
          </button>
        </div>
      </form>

      <style>{`
        .page-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 24px;
          font-family: var(--font-mono);
        }
        .post-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-row {
          display: flex;
          gap: 16px;
        }
        .form-row .form-group {
          flex: 1;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  )
}
