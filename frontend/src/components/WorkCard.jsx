import { Link } from 'react-router-dom'
import './WorkCard.css'

export default function WorkCard({ work }) {
  return (
    <Link to={`/works/${work.id}`} className="work-card">
      <div className="work-card-image">
        <img src={work.image_url || '/placeholder.jpg'} alt={work.title} loading="lazy" />
      </div>
      <div className="work-card-info">
        <span className="work-card-category">{work.category}</span>
        <h3 className="work-card-title">{work.title}</h3>
        <p className="work-card-author">{work.author}</p>
      </div>
    </Link>
  )
}
