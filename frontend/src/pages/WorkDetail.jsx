import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPart } from '../data/parts'
import { findWork } from '../data/works'
import { toEmbedUrl } from '../lib/embed'
import './WorkDetail.css'

// 리뷰·좋아요 더미 — 유지/삭제는 별도 결정. 그때까지 기존 UI 그대로 둠
const DUMMY_REVIEWS = [
  { id: 1, author: '관람객A', content: '정말 인상 깊은 작품이었습니다.', created_at: '2025-02-10' },
  { id: 2, author: '관람객B', content: '아이디어가 신선하네요!', created_at: '2025-02-11' },
]

export default function WorkDetail() {
  const { slug } = useParams()
  const work = findWork(slug)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(12)
  const [review, setReview] = useState('')
  const [reviews, setReviews] = useState(DUMMY_REVIEWS)

  if (!work) {
    return (
      <main className="detail-page page-offset">
        <div className="detail-inner">
          <Link to="/works" className="detail-back">← Works</Link>
          <p className="detail-empty">작품을 찾을 수 없습니다.</p>
        </div>
      </main>
    )
  }

  const part = getPart(work.part_slug)
  const episodes = work.episodes ?? []

  const handleLike = () => {
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (!review.trim()) return
    setReviews(prev => [...prev, {
      id: Date.now(),
      author: '나',
      content: review,
      created_at: new Date().toISOString().slice(0, 10)
    }])
    setReview('')
  }

  return (
    <main className="detail-page page-offset">
      <div className="detail-inner">
        {/* 뒤로가기 — 같은 파트 목록으로 */}
        <Link to={`/works?part=${work.part_slug}`} className="detail-back">← {part.label}</Link>

        {/* 대표 이미지 */}
        <div className="detail-image">
          <img src={work.cover_path} alt={work.title} />
        </div>

        {/* 정보 */}
        <div className="detail-content">
          <div className="detail-meta">
            <span className="detail-category">{part.label}</span>
            <button
              className={`detail-like ${liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              {liked ? '♥' : '♡'} {likeCount}
            </button>
          </div>
          <h1 className="detail-title">{work.title}</h1>

          {work.genres.length > 0 && (
            <ul className="detail-genres">
              {work.genres.map(genre => (
                <li key={genre}>
                  <Link to={`/works?part=${work.part_slug}&genre=${genre}`}>#{genre}</Link>
                </li>
              ))}
            </ul>
          )}

          <ul className="detail-authors">
            {work.authors.map(author => (
              <li key={author.name} className="detail-author">
                <span className="detail-author-name">{author.name}</span>
                {author.role && <span className="detail-author-role">{author.role}</span>}
                {author.contact_url && (
                  <a
                    className="detail-author-contact"
                    href={author.contact_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {author.contact_type || '링크'}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {work.synopsis && (
            <section className="detail-section">
              <h2 className="detail-section-title">시놉시스 / 기획의도</h2>
              <p className="detail-description">{work.synopsis}</p>
            </section>
          )}

          {work.world_setting && (
            <section className="detail-section">
              <h2 className="detail-section-title">세계관</h2>
              <p className="detail-description">{work.world_setting}</p>
            </section>
          )}
        </div>

        {/* 회차 (웹툰) — 뷰어 라우트 /works/:slug/ep/:no 는 다음 작업에서 연결 */}
        {episodes.length > 0 && (
          <section className="detail-episodes">
            <h2 className="detail-section-title">회차 <span>{episodes.length}</span></h2>
            <ul className="episode-list">
              {episodes.map(ep => (
                <li key={ep.no} className="episode-item">
                  <span className="episode-no">{ep.no}화</span>
                  <span className="episode-title">{ep.title}</span>
                  <span className="episode-pages">{ep.pages.length}장</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 상세 이미지 / 영상 — 배열 순서대로 */}
        {work.media.length > 0 && (
          <section className="detail-media">
            {work.media.map((item, i) => (
              <figure key={i} className={`media-item ${item.kind === 'video' ? 'media-video' : ''}`}>
                {item.kind === 'video' ? (
                  toEmbedUrl(item.video_url) ? (
                    <iframe
                      src={toEmbedUrl(item.video_url)}
                      title={item.caption || `${work.title} 영상 ${i + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <a href={item.video_url} target="_blank" rel="noreferrer">{item.video_url}</a>
                  )
                ) : (
                  <img src={item.path} alt={item.caption || `${work.title} ${i + 1}`} loading="lazy" />
                )}
                {item.caption && <figcaption>{item.caption}</figcaption>}
              </figure>
            ))}
          </section>
        )}

        {/* 리뷰 (기존 UI 유지) */}
        <div className="detail-reviews">
          <h2 className="reviews-title">Reviews <span>{reviews.length}</span></h2>

          <form className="review-form" onSubmit={handleReviewSubmit}>
            <input
              className="review-input"
              type="text"
              placeholder="감상을 남겨주세요"
              value={review}
              onChange={e => setReview(e.target.value)}
            />
            <button className="review-submit" type="submit">등록</button>
          </form>

          <ul className="review-list">
            {reviews.map(r => (
              <li key={r.id} className="review-item">
                <div className="review-header">
                  <span className="review-author">{r.author}</span>
                  <span className="review-date">{r.created_at}</span>
                </div>
                <p className="review-content">{r.content}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
