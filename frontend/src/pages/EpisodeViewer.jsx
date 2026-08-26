import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { findWork } from '../data/works'
import './EpisodeViewer.css'

// 웹툰 회차 뷰어 — 원고를 세로로 이어 붙여 스크롤로 읽는다
export default function EpisodeViewer() {
  const { slug, no } = useParams()
  const work = findWork(slug)
  const episodes = work?.episodes ?? []
  const index = episodes.findIndex(ep => ep.no === Number(no))
  const episode = episodes[index]
  const prev = episodes[index - 1]
  const next = episodes[index + 1]

  // 회차 이동 시 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug, no])

  if (!work || !episode) {
    return (
      <main className="viewer-page page-offset">
        <div className="viewer-empty">
          <Link to={work ? `/works/${work.slug}` : '/works'} className="detail-back">← {work ? work.title : 'Works'}</Link>
          <p>회차를 찾을 수 없습니다.</p>
        </div>
      </main>
    )
  }

  const prevLink = prev
    ? <Link to={`/works/${work.slug}/ep/${prev.no}`} className="btn-ghost">← {prev.no}화</Link>
    : <span className="btn-ghost is-off">← 이전화</span>
  const nextLink = next
    ? <Link to={`/works/${work.slug}/ep/${next.no}`} className="btn-ghost">{next.no}화 →</Link>
    : <span className="btn-ghost is-off">다음화 →</span>

  return (
    <main className="viewer-page page-offset">
      {/* 상단 바 — 스크롤해도 따라옴 */}
      <header className="viewer-bar">
        <div className="viewer-bar-inner">
          <Link to={`/works/${work.slug}`} className="viewer-back">← 작품</Link>
          <div className="viewer-heading">
            <p className="viewer-work">{work.title}</p>
            <h1 className="viewer-title">
              {episode.no}화{episode.title && <span> · {episode.title}</span>}
            </h1>
          </div>
          <div className="viewer-bar-nav">
            {prevLink}
            {nextLink}
          </div>
        </div>
      </header>

      {/* 원고 — 앞 2장만 즉시 로드, 나머지는 스크롤 따라 */}
      <div className="viewer-pages">
        {episode.pages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${work.title} ${episode.no}화 ${i + 1}쪽`}
            loading={i < 2 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>

      <nav className="viewer-nav" aria-label="회차 이동">
        {prevLink}
        <Link to={`/works/${work.slug}`} className="btn-primary">회차 목록</Link>
        {nextLink}
      </nav>
    </main>
  )
}
