import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PostList from './pages/PostList'
import PostDetail from './pages/PostDetail'
import PostWrite from './pages/PostWrite'
import PostEdit from './pages/PostEdit'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import OAuth2Callback from './pages/OAuth2Callback'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/write" element={<PostWrite />} />
        <Route path="/posts/:id/edit" element={<PostEdit />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
      </Routes>
    </Layout>
  )
}

export default App
