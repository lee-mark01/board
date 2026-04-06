import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchPosts } from '../api/posts'

const PAGE_SIZE = 10

export default function PostList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '0')
  const keyword = searchParams.get('keyword') || ''

  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState(keyword)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchPosts(page, PAGE_SIZE, keyword)
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, keyword])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams(search ? { keyword: search, page: 0 } : {})
  }

  const goPage = (p) => {
    const params = { page: p }
    if (keyword) params.keyword = keyword
    setSearchParams(params)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div>
      <div className="list-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="제목 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">검색</button>
        </form>
        <Link to="/write">
          <button className="primary">+ 새 글</button>
        </Link>
      </div>

      {loading && <p className="status-msg">로딩 중...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && (
        <>
          {posts.length === 0 ? (
            <p className="status-msg">게시글이 없습니다.</p>
          ) : (
            <table className="post-table">
              <thead>
                <tr>
                  <th className="col-title">제목</th>
                  <th className="col-author">작성자</th>
                  <th className="col-date">날짜</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="col-title">
                      <Link to={`/posts/${post.id}`}>{post.title}</Link>
                    </td>
                    <td className="col-author">{post.userName}</td>
                    <td className="col-date">{formatDate(post.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="pagination">
            <button disabled={page === 0} onClick={() => goPage(page - 1)}>
              &lt; 이전
            </button>
            <span className="page-info">page {page + 1}</span>
            <button
              disabled={posts.length < PAGE_SIZE}
              onClick={() => goPage(page + 1)}
            >
              다음 &gt;
            </button>
          </div>
        </>
      )}

      <style>{`
        .list-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .search-form {
          display: flex;
          gap: 8px;
          flex: 1;
          max-width: 400px;
        }
        .search-form input {
          flex: 1;
        }
        .post-table {
          width: 100%;
          border-collapse: collapse;
        }
        .post-table th,
        .post-table td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .post-table th {
          color: var(--text-muted);
          font-weight: 400;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .post-table tbody tr:hover {
          background: var(--surface);
        }
        .col-author { width: 120px; }
        .col-date { width: 110px; color: var(--text-muted); font-size: 13px; }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
        }
        .page-info {
          color: var(--text-muted);
          font-size: 13px;
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
