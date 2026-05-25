import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PenSquare, LogIn, LogOut } from 'lucide-react'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-600 transition-colors">
            Board
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/write"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <PenSquare size={16} />
                  <span>새 글</span>
                </Link>
                <span className="text-sm text-gray-400">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogIn size={16} />
                <span>로그인</span>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}
