import { Link } from 'react-router-dom'
import { PARTS, PARTICIPANTS, ALL_PARTICIPANTS, DUPLICATE_NAMES, sortByName } from '../data/participants'
import { worksByAuthor } from '../data/works'
import './Designers.css'

export default function Designers() {
  return (
    <main className="designers-page page-offset">
      <div className="designers-header">
        <div className="designers-header-inner">
          <h1 className="designers-title">Designers</h1>
          <p className="designers-count">{ALL_PARTICIPANTS.length}명의 참여자</p>
        </div>
      </div>

      {PARTS.map(part => {
        // 표시 순서만 이름순. id는 주소 키라 그대로 둔다
        const people = sortByName(PARTICIPANTS[part.slug])
        return (
          <section className="part-section" key={part.slug}>
            <div className="part-header">
              <h2 className="part-title">{part.label}</h2>
              <span className="part-en">{part.en}</span>
              <span className="part-count">{people.length}명</span>
            </div>

            <ul className="designer-grid">
              {people.map(person => {
                const works = worksByAuthor(person.name)
                const thumb = works[0]?.cover_path
                const isTeam = works.some(w => w.authors.length > 1)
                return (
                  <li key={person.id}>
                    <Link to={`/designers/${person.id}`} className="designer-card">
                      <div className="designer-thumb">
                        {thumb
                          ? <img src={thumb} alt="" loading="lazy" />
                          : <span className="designer-thumb-blank">{person.name.slice(0, 1)}</span>}
                      </div>
                      <span className="designer-card-name">
                        {person.name}
                        {isTeam && <span className="designer-card-team">팀</span>}
                      </span>
                      {DUPLICATE_NAMES.has(person.name) && person.student_id && (
                        <span className="designer-card-sid">{person.student_id}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </main>
  )
}
