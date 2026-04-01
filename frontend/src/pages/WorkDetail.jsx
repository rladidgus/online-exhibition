import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './WorkDetail.css'

// 임시 더미 데이터
const DUMMY_WORKS = {
  1: { id: 1, title: '스타트업 플랫폼', author: '김민준', category: '창업', image_url: 'https://picsum.photos/seed/1/800/600', description: '소상공인과 소비자를 연결하는 로컬 커머스 플랫폼입니다. 지역 기반 서비스로 골목 상권 활성화를 목표로 합니다.' },
}

const DUMMY_REVIEWS = [
  { id: 1, author: '관람객A', content: '정말 인상 깊은 작품이었습니다.', created_at: '2025-02-10' },
  { id: 2, author: '관람객B', content: '아이디어가 신선하네요!', created_at: '2025-02-11' },
]

export default function WorkDetail() {
  const { id } = useParams()
  const work = DUMMY_WORKS[id] || DUMMY_WORKS[1]
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(12)
  const [review, setReview] = useState('')
  const [reviews, setReviews] = useState(DUMMY_REVIEWS)

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
        {/* 뒤로가기 */}
        <Link to="/works" className="detail-back">← Works</Link>

        {/* 이미지 */}
        <div className="detail-image">
          <img src={work.image_url} alt={work.title} />
        </div>

        {/* 정보 */}
        <div className="detail-content">
          <div className="detail-meta">
            <span className="detail-category">{work.category}</span>
            <button
              className={`detail-like ${liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              {liked ? '♥' : '♡'} {likeCount}
            </button>
          </div>
          <h1 className="detail-title">{work.title}</h1>
          <p className="detail-author">{work.author}</p>
          <p className="detail-description">{work.description}</p>
        </div>

        {/* 리뷰 */}
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
