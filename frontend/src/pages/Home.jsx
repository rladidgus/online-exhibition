import { Link } from 'react-router-dom'
import { PARTS } from '../data/parts'
import { WORKS } from '../data/works'
import { SITE, formatPeriod } from '../data/site'
import { toEmbedUrl } from '../lib/embed'
import './Home.css'

export default function Home() {
  const period = formatPeriod(SITE.exhibit_start, SITE.exhibit_end)
  const openingEmbed = toEmbedUrl(SITE.opening_video_url)
  const introParagraphs = SITE.intro_body.split('\n\n')

  // 첫 화면(커버)을 클릭하면 본문 시작 지점으로 이동
  const enter = () => {
    document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="home">
      {/* 커버 — 전체 화면 키비주얼. 클릭하면 본문으로 */}
      <section className="home-cover" onClick={enter}>
        <img
          className="home-cover-image"
          src={SITE.cover_path}
          alt={`${SITE.exhibition_title} 키비주얼`}
          fetchPriority="high"
        />

        <div className="home-cover-inner">
          <p className="home-cover-sub bounce delay-1">
            {SITE.exhibition_title} · {SITE.department_name}
          </p>
          <h1 className="home-cover-title bounce delay-2">{SITE.slogan}</h1>
          <div className="home-cover-info bounce delay-3">
            <p className="home-cover-venue">{SITE.venue_name}</p>
            <p className="home-cover-address">{SITE.venue_address}</p>
            <p className="home-cover-period">{period}</p>
          </div>
        </div>

        <button className="home-cover-enter" type="button" onClick={enter}>
          <span>ENTER</span>
          <span className="home-cover-arrow">↓</span>
        </button>
      </section>

      {/* 기획의도 */}
      <section className="home-intro" id="start">
        <div className="home-intro-inner tline">
          <div className="section-header">
            <span className="section-label">Statement</span>
            <h2 className="section-title">{SITE.intro_title}</h2>
          </div>
          <div className="home-intro-body">
            {introParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
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
            {PARTS.map((part, i) => (
              <Link
                to={`/works?part=${part.slug}`}
                key={part.slug}
                className={`category-card bounce delay-${i + 3}`}
              >
                <span className="category-card-num">0{i + 1}</span>
                <div className="category-card-text">
                  <p className="category-card-en">{part.en}</p>
                  <p className="category-card-label">{part.label}</p>
                </div>
                <span className="category-card-count">
                  {WORKS.filter(w => w.part_slug === part.slug).length}
                </span>
                <span className="category-card-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 오프닝 영상 — URL 없으면 섹션 자체를 숨김 */}
      {openingEmbed && (
        <section className="home-video">
          <div className="home-video-inner tline">
            <div className="section-header">
              <span className="section-label">Opening</span>
              <h2 className="section-title">오프닝 영상</h2>
            </div>
            <div className="home-video-embed">
              <iframe
                src={openingEmbed}
                title={`${SITE.exhibition_title} 오프닝 영상`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* 오시는 길 + SNS */}
      <section className="home-visit" id="visit">
        <div className="home-visit-inner tline">
          <div className="home-visit-info">
            <div className="section-header">
              <span className="section-label">Visit</span>
              <h2 className="section-title">오시는 길</h2>
            </div>
            <dl className="home-visit-list">
              <div><dt>기간</dt><dd>{period}</dd></div>
              <div><dt>장소</dt><dd>{SITE.venue_name}</dd></div>
              <div><dt>주소</dt><dd>{SITE.venue_address}</dd></div>
              <div><dt>교통</dt><dd>{SITE.venue_directions}</dd></div>
            </dl>
            {SITE.venue_map_url && (
              <a className="btn-ghost" href={SITE.venue_map_url} target="_blank" rel="noreferrer">
                지도에서 보기
              </a>
            )}
          </div>

          <div className="home-visit-sns">
            <span className="section-label">Follow</span>
            <p className="home-visit-sns-lead">전시 소식은 SNS에서 먼저 전해드립니다.</p>
            <ul>
              {SITE.sns_instagram && (
                <li><a href={SITE.sns_instagram} target="_blank" rel="noreferrer">Instagram →</a></li>
              )}
              {SITE.sns_x && (
                <li><a href={SITE.sns_x} target="_blank" rel="noreferrer">X →</a></li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <h2 className="home-cta-title">모든 작품을 한눈에</h2>
          <Link to="/works" className="btn-primary">전체 작품 보기</Link>
        </div>
      </section>
    </main>
  )
}
