import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../api/members'

export default function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', userName: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signup(form)
      navigate('/login')
    } catch {
      setError('회원가입에 실패했습니다. 이메일이 이미 사용 중일 수 있습니다.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto pt-12">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">회원가입</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
          <input
            type="text"
            value={form.userName}
            onChange={update('userName')}
            placeholder="이름"
            required
            className="w-full px-4 py-2.5 text-[15px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
          <input
            type="email"
            value={form.email}
            onChange={update('email')}
            placeholder="email@example.com"
            required
            className="w-full px-4 py-2.5 text-[15px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            placeholder="비밀번호"
            required
            className="w-full px-4 py-2.5 text-[15px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-8">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-gray-900 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
