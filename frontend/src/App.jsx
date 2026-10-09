import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Works from './pages/Works'
import WorkDetail from './pages/WorkDetail'
import EpisodeViewer from './pages/EpisodeViewer'
import Search from './pages/Search'
import Guestbook from './pages/Guestbook'
import Designers from './pages/Designers'
import DesignerDetail from './pages/DesignerDetail'

// 관리자 화면은 /admin 에 들어올 때만 내려받는다
const AdminRoutes = lazy(() => import('./pages/admin/AdminRoutes'))

// 관리자 화면은 자체 상단바를 쓰므로 공개 사이트 네비를 숨긴다
function PublicNavbar() {
  const { pathname } = useLocation()
  return pathname.startsWith('/admin') ? null : <Navbar />
}

function App() {
  return (
    <BrowserRouter>
      <PublicNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/works" element={<Works />} />
        <Route path="/works/:slug" element={<WorkDetail />} />
        <Route path="/works/:slug/ep/:no" element={<EpisodeViewer />} />
        <Route path="/search" element={<Search />} />
        <Route path="/guestbook" element={<Guestbook />} />
        <Route path="/designers" element={<Designers />} />
        <Route path="/designers/:id" element={<DesignerDetail />} />
        <Route path="/login" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={<Suspense fallback={null}><AdminRoutes /></Suspense>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
