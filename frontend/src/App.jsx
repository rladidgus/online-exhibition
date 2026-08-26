import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Works from './pages/Works'
import WorkDetail from './pages/WorkDetail'
import Designers from './pages/Designers'
import DesignerDetail from './pages/DesignerDetail'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/works" element={<Works />} />
        <Route path="/works/:slug" element={<WorkDetail />} />
        <Route path="/designers" element={<Designers />} />
        <Route path="/designers/:id" element={<DesignerDetail />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
