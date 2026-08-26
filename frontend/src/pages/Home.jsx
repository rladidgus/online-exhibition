import { Link } from 'react-router-dom'
import './Home.css'

const CATEGORIES = [
  { key: 'startup', label: '창업', en: 'Startup' },
  { key: 'webtoon', label: '웹툰', en: 'Webtoon' },
  { key: 'video', label: '영상', en: 'Video' },
  { key: 'game', label: '게임', en: 'Game' },
]

export default function Home() {
  return (
    <main className="home page-offset">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <p className="home-hero-sub bounce delay-1">2026 졸업전시</p>
          <h1 className="home-hero-title bounce delay-2">
            우리의 작품을<br />세상에 선보입니다
          </h1>
          <p className="home-hero-desc bounce delay-3">
            창업, 웹툰, 영상, 게임 — 네 가지 분야의 졸업 작품을 온라인으로 만나보세요.
          </p>
          <div className="home-hero-actions bounce delay-4">
            <Link to="/works" className="btn-primary">작품 보러가기</Link>
            <Link to="/designers" className="btn-ghost">참여자 보기</Link>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="home-categories">
        <div className="home-categories-inner">
          <div className="section-header tline">
            <span className="section-label">Categories</span>
            <h2 className="section-title">분야별 작품</h2>
          </div>

          <div className="category-grid">
            {CATEGORIES.map((cat, i) => (
              <Link
                to={`/works?part=${cat.key}`}
                key={cat.key}
                className={`category-card bounce delay-${i + 3}`}
              >
                <span className="category-card-num">0{i + 1}</span>
                <div className="category-card-text">
                  <p className="category-card-en">{cat.en}</p>
                  <p className="category-card-label">{cat.label}</p>
                </div>
                <span className="category-card-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="home-cta-inner tline">
          <h2 className="home-cta-title">모든 작품을 한눈에</h2>
          <Link to="/works" className="btn-primary">전체 작품 보기</Link>
        </div>
      </section>
    </main>
  )
}
