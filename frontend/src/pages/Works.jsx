import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import CategoryFilter from '../components/CategoryFilter'
import { PARTS, PARTICIPANTS } from '../data/participants'
import '../styles/part-list.css'
import './Works.css'

export default function Works() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const category = searchParams.get('category') || 'all'

  const setCategory = (cat) => {
    if (cat === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: cat })
    }
  }

  const keyword = search.trim()

  // 카테고리 + 검색어로 걸러낸 파트별 참여자
  const sections = PARTS
    .filter(part => category === 'all' || part.label === category)
    .map(part => ({
      ...part,
      people: PARTICIPANTS[part.slug].filter(p => p.name.includes(keyword)),
    }))
    .filter(section => section.people.length > 0)

  const total = sections.reduce((sum, s) => sum + s.people.length, 0)

  return (
    <main className="works-page page-offset">
      <div className="works-header">
        <div className="works-header-top">
          <h1 className="works-title">Works</h1>
          <p className="works-count">{total}명의 참여자</p>
        </div>
      </div>

      <div className="works-toolbar">
        <CategoryFilter active={category} onChange={setCategory} />
        <input
          className="works-search"
          type="text"
          placeholder="참여자 이름 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {sections.length === 0 ? (
        <div className="works-empty">검색 결과가 없습니다.</div>
      ) : (
        sections.map(section => (
          <section className="part-section" key={section.slug}>
            <div className="part-header">
              <h2 className="part-title">{section.label}</h2>
              <span className="part-en">{section.en}</span>
              <span className="part-count">{section.people.length}명</span>
            </div>

            <ul className="part-name-list">
              {section.people.map(person => (
                <li key={person.id}>
                  <Link to={`/designers/${person.id}`} className="part-name">
                    {person.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  )
}
