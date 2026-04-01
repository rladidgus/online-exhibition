import './CategoryFilter.css'

const CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: '창업', label: '창업' },
  { key: '웹툰', label: '웹툰' },
  { key: '영상', label: '영상' },
  { key: '게임', label: '게임' },
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
