import { useParams, Link } from 'react-router-dom'
import { PARTICIPANTS, findParticipant, getPart, sortByName, DUPLICATE_NAMES } from '../data/participants'
import { SITE } from '../data/site'
import { worksByAuthor } from '../data/works'
import WorkCard from '../components/WorkCard'
import './DesignerDetail.css'

export default function DesignerDetail() {
  const { id } = useParams()
  const person = findParticipant(id)

  if (!person) {
    return (
      <main className="designer-detail page-offset">
        <div className="designer-detail-inner">
          <Link to="/designers" className="designer-back">← Designers</Link>
          <p className="designer-empty">참여자를 찾을 수 없습니다.</p>
        </div>
      </main>
    )
  }

  const partSlug = id.split('-')[0]
  const part = getPart(partSlug)
  // 본인도 목록에 남겨 현재 위치가 보이게 한다
  const siblings = sortByName(PARTICIPANTS[partSlug])
  const works = worksByAuthor(person.name)
  const major = person.major === SITE.major_label ? SITE.major_label : '타전공'

  return (
    <main className="designer-detail page-offset">
      <div className="designer-detail-inner">
        <Link to="/designers" className="designer-back">← Designers</Link>

        <header className="designer-detail-header">
          <span className="designer-detail-part">{part.label}</span>
          <h1 className="designer-detail-name">{person.name}</h1>
          {DUPLICATE_NAMES.has(person.name) && person.student_id && (
            <p className="designer-detail-sid">{person.student_id}</p>
          )}
          <p className="designer-detail-major">{major}</p>
        </header>

        <section className="designer-works">
          <h2 className="designer-works-title">
            Works {works.length > 0 && <span>{works.length}</span>}
          </h2>

          {works.length > 0 ? (
            <ul className="designer-works-grid">
              {works.map(work => (
                <li key={work.slug}>
                  <WorkCard work={work} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="designer-works-empty">
              작품이 아직 등록되지 않았습니다.
            </p>
          )}

          <Link to={`/works?part=${partSlug}`} className="btn-primary">
            {part.label} 파트 작품 보기
          </Link>
        </section>

        {siblings.length > 1 && (
          <section className="designer-siblings">
            <h2 className="designer-siblings-title">
              같은 파트 참여자 <span>{siblings.length}</span>
            </h2>
            <ul className="designer-siblings-list">
              {siblings.map(p => (
                <li key={p.id}>
                  {p.id === person.id ? (
                    <span className="designer-sibling is-current" aria-current="page">
                      {p.name}
                    </span>
                  ) : (
                    <Link to={`/designers/${p.id}`} className="designer-sibling">
                      {p.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
