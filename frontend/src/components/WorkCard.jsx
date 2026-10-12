import { Link } from 'react-router-dom'
import { getPart } from '../data/parts'
import { formatAuthors } from '../data/works'
import './WorkCard.css'

// row = 가로형 (작은 썸네일 왼쪽 + 글 오른쪽) — 작품 상세의 '다른 참여자 작품'에서 씀
export default function WorkCard({ work, row = false }) {
  const part = getPart(work.part_slug)

  return (
    <Link to={`/works/${work.slug}`} className={`work-card${row ? ' work-card--row' : ''}`}>
      <div className="work-card-image">
        <img src={work.cover_path} alt={work.title} loading="lazy" />
      </div>
      <div className="work-card-info">
        <span className="work-card-category">
          {[part?.label, ...work.genres].filter(Boolean).join(' · ')}
        </span>
        <h3 className="work-card-title">{work.title}</h3>
        <p className="work-card-author">{formatAuthors(work)}</p>
      </div>
    </Link>
  )
}
