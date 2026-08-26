import './GenreFilter.css'

// 파트별 장르 칩 — 파트가 하나 선택됐을 때만 노출 (파트마다 어휘가 다르므로)
export default function GenreFilter({ genres, active, onChange }) {
  return (
    <div className="genre-filter">
      <button
        className={`genre-chip ${!active ? 'active' : ''}`}
        onClick={() => onChange('')}
      >
        전체
      </button>
      {genres.map(genre => (
        <button
          key={genre}
          className={`genre-chip ${active === genre ? 'active' : ''}`}
          onClick={() => onChange(active === genre ? '' : genre)}
        >
          #{genre}
        </button>
      ))}
    </div>
  )
}
