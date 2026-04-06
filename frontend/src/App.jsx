import { Routes, Route, Link } from 'react-router-dom'
import PostList from './pages/PostList'
import PostDetail from './pages/PostDetail'
import PostWrite from './pages/PostWrite'
import PostEdit from './pages/PostEdit'
import './App.css'

function App() {
  return (
    <div className="container">
      <header className="header">
        <Link to="/">
          <span className="prompt">&gt;_</span> Board
        </Link>
      </header>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/write" element={<PostWrite />} />
        <Route path="/posts/:id/edit" element={<PostEdit />} />
      </Routes>
    </div>
  )
}

export default App
