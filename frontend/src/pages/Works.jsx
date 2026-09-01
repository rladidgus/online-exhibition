import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CategoryFilter from '../components/CategoryFilter'
import GenreFilter from '../components/GenreFilter'
import WorkCard from '../components/WorkCard'
import { PARTS, getPart } from '../data/parts'
import { WORKS, authorNames, sortByAuthor } from '../data/works'
import '../styles/part-list.css'
import './Works.css'

export default function Works() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')

  // URL: /works?part=webtoon&genre=학원
  const partSlug = searchParams.get('part') || 'all'
  const genre = searchParams.get('genre') || ''
  const part = getPart(partSlug) // 'all' 이면 undefined

  const setPart = (slug) => {
    // 파트를 바꾸면 장르는 초기화 (파트마다 어휘가 다름)
    setSearchParams(slug === 'all' ? {} : { part: slug })
  }

  const setGenre = (value) => {
    setSearchParams(value ? { part: partSlug, genre: value } : { part: partSlug })
  }

  const keyword = search.trim().toLowerCase()
  const matches = (work) =>
    (!genre || work.genres.includes(genre)) &&
    (!keyword ||
      work.title.toLowerCase().includes(keyword) ||
      authorNames(work).some(name => name.toLowerCase().includes(keyword)))

  // 파트별 섹션 — 결과가 있는 파트만
  const sections = PARTS
    .filter(p => !part || p.slug === part.slug)
    .map(p => ({ ...p, works: sortByAuthor(WORKS.filter(w => w.part_slug === p.slug && matches(w))) }))
    .filter(section => section.works.length > 0)

  const total = sections.reduce((sum, s) => sum + s.works.length, 0)

  return (
    <main className="works-page page-offset">
      <div className="works-header">
        <div className="works-header-top">
          <h1 className="works-title">Works</h1>
          <p className="works-count">{total}개의 작품</p>
        </div>
      </div>

      <div className="works-filters">
        <div className="works-toolbar">
          <CategoryFilter active={partSlug} onChange={setPart} />
          <input
            className="works-search"
            type="text"
            placeholder="작품명·작가명 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {part && (
          <GenreFilter genres={part.genres} active={genre} onChange={setGenre} />
        )}
      </div>

      {sections.length === 0 ? (
        <div className="works-empty">검색 결과가 없습니다.</div>
      ) : (
        sections.map(section => (
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
        ))
      )}
    </main>
  )
}
