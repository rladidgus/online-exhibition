import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import CategoryFilter from '../components/CategoryFilter'
import WorkCard from '../components/WorkCard'
import { PARTS } from '../data/parts'
import { WORKS, authorNames } from '../data/works'
import { ALL_PARTICIPANTS } from '../data/participants'
import '../styles/part-list.css'
import './Search.css'

// 검색 — 작품명·작가명·장르·시놉시스 + 참여자 이름. 결과는 타이핑 즉시, URL(?q=)은 Enter 로 확정
export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const partSlug = searchParams.get('part') || 'all'
  const [input, setInput] = useState(searchParams.get('q') || '')
  const keyword = input.trim().toLowerCase()

  const setPart = (slug) => {
    const params = {}
    if (keyword) params.q = input.trim()
    if (slug !== 'all') params.part = slug
    setSearchParams(params)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setPart(partSlug)
  }

  const haystack = (work) =>
    [work.title, ...authorNames(work), ...work.genres, work.synopsis ?? '']
      .join(' ')
      .toLowerCase()

  const hits = keyword
    ? WORKS.filter(w => (partSlug === 'all' || w.part_slug === partSlug) && haystack(w).includes(keyword))
    : []

  const sections = PARTS
    .map(p => ({ ...p, works: hits.filter(w => w.part_slug === p.slug) }))
    .filter(section => section.works.length > 0)

  const people = keyword
    ? ALL_PARTICIPANTS.filter(p => (partSlug === 'all' || p.id.startsWith(partSlug)) && p.name.includes(input.trim()))
    : []

  return (
    <main className="search-page page-offset">
      <div className="search-header">
        <h1 className="search-title">Search</h1>
        <p className="search-lead">작품명, 작가명, 장르로 찾을 수 있습니다.</p>

        <form className="search-box" onSubmit={handleSubmit}>
          <input
            type="search"
            placeholder="예: 도서부, 홍길동, 판타지"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
          />
        </form>

        <CategoryFilter active={partSlug} onChange={setPart} />
      </div>

      {!keyword ? null : hits.length === 0 && people.length === 0 ? (
        <div className="works-empty">검색 결과가 없습니다. 다른 단어로 찾아보세요.</div>
      ) : (
        <>
          <p className="search-count">작품 {hits.length}개{people.length > 0 && ` · 참여자 ${people.length}명`}</p>

          {sections.map(section => (
            <section className="part-section" key={section.slug}>
              <div className="part-header">
                <h2 className="part-title">{section.label}</h2>
                <span className="part-en">{section.en}</span>
                <span className="part-count">{section.works.length}개</span>
              </div>
              <div className="works-grid">
                {section.works.map(work => (
                  <WorkCard key={work.slug} work={work} />
                ))}
              </div>
            </section>
          ))}

          {people.length > 0 && (
            <section className="part-section">
              <div className="part-header">
                <h2 className="part-title">참여자</h2>
                <span className="part-en">Designers</span>
                <span className="part-count">{people.length}명</span>
              </div>
              <ul className="search-people">
                {people.map(person => (
                  <li key={person.id}>
                    <Link to={`/designers/${person.id}`} className="designer-sibling">{person.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  )
}
