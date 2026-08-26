import { useParams, Link } from 'react-router-dom'
import { PARTICIPANTS, findParticipant, getPart } from '../data/participants'
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
  const others = PARTICIPANTS[partSlug].filter(p => p.id !== person.id)

  return (
    <main className="designer-detail page-offset">
      <div className="designer-detail-inner">
        <Link to="/designers" className="designer-back">← Designers</Link>

        <header className="designer-detail-header">
          <span className="designer-detail-part">{part.label}</span>
          <h1 className="designer-detail-name">{person.name}</h1>
          <p className="designer-detail-major">{person.major}</p>
        </header>

        <section className="designer-works">
          <h2 className="designer-works-title">Works</h2>
          <p className="designer-works-empty">
            등록된 작품이 아직 없습니다.
          </p>
          <Link to={`/works?part=${partSlug}`} className="btn-primary">
            {part.label} 파트 작품 보기
          </Link>
        </section>

        {others.length > 0 && (
          <section className="designer-siblings">
            <h2 className="designer-siblings-title">
              같은 파트 참여자 <span>{others.length}</span>
            </h2>
            <ul className="designer-siblings-list">
              {others.map(p => (
                <li key={p.id}>
                  <Link to={`/designers/${p.id}`} className="designer-sibling">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
