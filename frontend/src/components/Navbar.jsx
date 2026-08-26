import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // 로그인/로그아웃 상태 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const links = [
    { to: '/', label: 'Home' },
    { to: '/works', label: 'Works' },
    { to: '/designers', label: 'Designers' },
    { to: '/search', label: 'Search' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          2026 졸업전시
        </Link>

        <ul className="navbar-links">
          {links.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          
          {user ? (
            <li>
              <button 
                className="navbar-link logout-btn" 
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Logout
              </button>
            </li>
          ) : (
            <li>
              <Link
                to="/login"
                className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Login
              </Link>
            </li>
          )}
        </ul>

        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="메뉴 열기"
        >
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="navbar-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              className="navbar-mobile-link"
              onClick={() => {
                handleLogout()
                setMenuOpen(false)
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="navbar-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
