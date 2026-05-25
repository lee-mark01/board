import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchPosts } from '../api/posts'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">게시판</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="제목 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all w-60"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            검색
          </button>
        </form>
      </div>

      {loading && <p className="text-center py-16 text-gray-400">로딩 중...</p>}
      {error && <p className="text-center py-16 text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {posts.length === 0 ? (
            <p className="text-center py-16 text-gray-400">게시글이 없습니다.</p>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {posts.map((post, i) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${
                    i !== posts.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[15px] text-gray-900 truncate">{post.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{post.userName}</p>
                  </div>
                  <span className="text-sm text-gray-400 shrink-0 ml-4">
                    {formatDate(post.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              disabled={page === 0}
              onClick={() => goPage(page - 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
            >
              <ChevronLeft size={16} />
              이전
            </button>
            <span className="text-sm text-gray-400">{page + 1} 페이지</span>
            <button
              disabled={posts.length < PAGE_SIZE}
              onClick={() => goPage(page + 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
            >
              다음
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
