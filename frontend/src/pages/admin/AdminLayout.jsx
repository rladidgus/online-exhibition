import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { signIn, signOut, currentEmail, isAdmin } from '../../lib/admin'
import { guestbookEnabled } from '../../lib/guestbook'
import './Admin.css'

const NAV = [
  { to: '/admin', label: '대시보드', end: true },
  { to: '/admin/works', label: '작품 관리' },
  { to: '/admin/guestbook', label: '방명록·댓글' },
  { to: '/admin/settings', label: '사이트 설정' },
  { to: '/admin/password', label: '비밀번호' },
]

// 지금 로그인 상태: login(로그인 전) / denied(로그인했지만 관리자 명단에 없음) / ok
async function loadAccess() {
  const email = await currentEmail()
  if (!email) return { state: 'login', email: '' }
  return { state: (await isAdmin()) ? 'ok' : 'denied', email }
}

// 관리자 화면 공통 틀 — 로그인 게이트 + 관리자 명단 확인 + 상단 메뉴.
export default function AdminLayout() {
  const [state, setState] = useState(guestbookEnabled() ? 'loading' : 'noenv')
  const [email, setEmail] = useState('')

  async function check() {
    const access = await loadAccess()
    setEmail(access.email)
    setState(access.state)
  }

  useEffect(() => {
    // 검색엔진에 관리자 화면이 잡히지 않게
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  useEffect(() => {
    if (!guestbookEnabled()) return
    loadAccess().then(access => {
      setEmail(access.email)
      setState(access.state)
    })
  }, [])

  async function handleLogout() {
    await signOut()
    setState('login')
  }

  if (state === 'loading') return <div className="admin"><p className="a-empty">불러오는 중…</p></div>

  if (state === 'noenv') {
    return (
      <div className="admin a-gate">
        <p className="a-msg a-msg--err">Supabase 연결 값(.env)이 없어 관리자 화면을 열 수 없습니다.</p>
      </div>
    )
  }

  if (state === 'login') return <LoginGate onDone={check} />

  if (state === 'denied') {
    return (
      <div className="admin a-gate">
        <div className="a-gate__box">
          <h1 className="a-gate__title">관리자 명단에 없는 계정입니다</h1>
          <p className="a-gate__lead">{email} 계정은 관리자로 등록되어 있지 않습니다. 담당자에게 등록을 요청해 주세요.</p>
          <button className="a-btn" type="button" onClick={handleLogout}>로그아웃</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin">
      <header className="a-top">
        <div className="a-wrap a-top__inner">
          <div className="a-top__brand"><Link to="/admin">졸업전시 관리자</Link></div>
          <nav className="a-nav">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'is-on' : undefined)}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="a-top__right">
            <span className="a-user">{email}</span>
            <a className="a-btn a-btn--sm" href="/" target="_blank" rel="noopener">사이트 보기</a>
            <button className="a-btn a-btn--sm" type="button" onClick={handleLogout}>로그아웃</button>
          </div>
        </div>
      </header>

      <main className="a-main">
        <div className="a-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function LoginGate({ onDone }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email.trim(), password)
      await onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin a-gate">
      <div className="a-gate__box">
        <h1 className="a-gate__title">졸업전시 관리자</h1>
        <p className="a-gate__lead">준비위원회에 발급된 계정으로 로그인해 주세요.</p>
        <div className="a-card">
          <form onSubmit={handleSubmit}>
            <div className="a-field">
              <label htmlFor="a-email">이메일</label>
              <input id="a-email" type="email" autoComplete="username" required
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="a-field">
              <label htmlFor="a-password">비밀번호</label>
              <input id="a-password" type="password" autoComplete="current-password" required
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="a-btn a-btn--primary" type="submit" disabled={busy}
              style={{ width: '100%', justifyContent: 'center' }}>
              로그인
            </button>
            {error && <p className="a-msg a-msg--err" style={{ margin: '0.9rem 0 0' }}>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
