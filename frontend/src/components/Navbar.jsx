import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/works', label: 'Works' },
    { to: '/designers', label: 'Designers' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          2025 졸업전시
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
        </div>
      )}
    </nav>
  )
}
