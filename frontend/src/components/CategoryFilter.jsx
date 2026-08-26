import { PARTS } from '../data/parts'
import './CategoryFilter.css'

// 파트 필터 — key 는 파트 slug (URL ?part= 와 동일)
const CATEGORIES = [
  { key: 'all', label: '전체' },
  ...PARTS.map(part => ({ key: part.slug, label: part.label })),
]

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="category-filter">
      {CATEGORIES.map(cat => (
        <button
          key={cat.key}
          className={`category-btn ${active === cat.key ? 'active' : ''}`}
          onClick={() => onChange(cat.key)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
