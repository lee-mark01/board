import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createPost } from '../api/posts'

export default function PostWrite() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    userName: '',
    password: '',
    title: '',
    content: '',
  })
  const [submitting, setSubmitting] = useState(false)

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

  return (
    <div>
      <h2 className="page-title">새 글 작성</h2>
      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-row">
          <div className="form-group">
            <label>작성자</label>
            <input
              type="text"
              value={form.userName}
              onChange={update('userName')}
              placeholder="작성자 이름"
              required
            />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="수정/삭제 시 필요"
              required
            />
          </div>
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
          <Link to="/">
            <button type="button">취소</button>
          </Link>
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? '작성 중...' : '작성'}
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
