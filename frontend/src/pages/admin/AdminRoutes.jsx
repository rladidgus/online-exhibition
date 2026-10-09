import { Routes, Route } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import AdminHome from './AdminHome'
import AdminWorks from './AdminWorks'
import AdminWorkEdit from './AdminWorkEdit'
import AdminGuestbook from './AdminGuestbook'
import AdminSettings from './AdminSettings'
import AdminPassword from './AdminPassword'

// /admin 아래 화면 전부. App.jsx 가 따로 불러와서(lazy) 관람객은 이 코드를 내려받지 않는다.
export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="works" element={<AdminWorks />} />
        <Route path="works/:id" element={<AdminWorkEdit />} />
        <Route path="guestbook" element={<AdminGuestbook />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="password" element={<AdminPassword />} />
      </Route>
    </Routes>
  )
}
