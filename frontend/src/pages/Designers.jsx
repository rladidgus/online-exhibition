import { Link } from 'react-router-dom'
import { PARTS, PARTICIPANTS, ALL_PARTICIPANTS, sortByName } from '../data/participants'
import '../styles/part-list.css'
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

            <ul className="part-name-list">
              {people.map(person => (
                <li key={person.id}>
                  <Link to={`/designers/${person.id}`} className="part-name">
                    {person.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </main>
  )
}
