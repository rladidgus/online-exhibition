import { useParams, Link } from 'react-router-dom'
import { getPart } from '../data/parts'
import { findWork } from '../data/works'
import { toEmbedUrl } from '../lib/embed'
import './WorkDetail.css'

export default function WorkDetail() {
  const { slug } = useParams()
  const work = findWork(slug)

  if (!work) {
    return (
      <main className="detail-page page-offset">
        <div className="detail-inner">
          <Link to="/works" className="detail-back">← Works</Link>
          <p className="detail-empty">작품을 찾을 수 없습니다.</p>
        </div>
      </main>
    )
  }

  const part = getPart(work.part_slug)
  const episodes = work.episodes ?? []

  return (
    <main className="detail-page page-offset">
      <div className="detail-inner">
        {/* 뒤로가기 — 같은 파트 목록으로 */}
        <Link to={`/works?part=${work.part_slug}`} className="detail-back">← {part.label}</Link>

        {/* 대표 이미지 */}
        <div className="detail-image">
          <img src={work.cover_path} alt={work.title} />
        </div>

        {/* 정보 */}
        <div className="detail-content">
          <div className="detail-meta">
            <span className="detail-category">{part.label}</span>
          </div>
          <h1 className="detail-title">{work.title}</h1>

          {work.genres.length > 0 && (
            <ul className="detail-genres">
              {work.genres.map(genre => (
                <li key={genre}>
                  <Link to={`/works?part=${work.part_slug}&genre=${genre}`}>#{genre}</Link>
                </li>
              ))}
            </ul>
          )}

          <ul className="detail-authors">
            {work.authors.map(author => (
              <li key={author.name} className="detail-author">
                <span className="detail-author-name">{author.name}</span>
                {author.role && <span className="detail-author-role">{author.role}</span>}
                {author.contact_url && (
                  <a
                    className="detail-author-contact"
                    href={author.contact_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {author.contact_type || '링크'}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {work.synopsis && (
            <section className="detail-section">
              <h2 className="detail-section-title">시놉시스 / 기획의도</h2>
              <p className="detail-description">{work.synopsis}</p>
            </section>
          )}

          {work.world_setting && (
            <section className="detail-section">
              <h2 className="detail-section-title">세계관</h2>
              <p className="detail-description">{work.world_setting}</p>
            </section>
          )}
        </div>

        {/* 회차 (웹툰) */}
        {episodes.length > 0 && (
          <section className="detail-episodes">
            <h2 className="detail-section-title">회차 <span>{episodes.length}</span></h2>
            <ul className="episode-list">
              {episodes.map(ep => (
                <li key={ep.no} className="episode-item">
                  <Link to={`/works/${work.slug}/ep/${ep.no}`} className="episode-link">
                    <span className="episode-no">{ep.no}화</span>
                    <span className="episode-title">{ep.title}</span>
                    <span className="episode-pages">{ep.pages.length}장</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 상세 이미지 / 영상 — 배열 순서대로 */}
        {work.media.length > 0 && (
          <section className="detail-media">
            {work.media.map((item, i) => (
              <figure key={i} className={`media-item ${item.kind === 'video' ? 'media-video' : ''}`}>
                {item.kind === 'video' ? (
                  toEmbedUrl(item.video_url) ? (
                    <iframe
                      src={toEmbedUrl(item.video_url)}
                      title={item.caption || `${work.title} 영상 ${i + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <a href={item.video_url} target="_blank" rel="noreferrer">{item.video_url}</a>
                  )
                ) : (
                  <img src={item.path} alt={item.caption || `${work.title} ${i + 1}`} loading="lazy" />
                )}
                {item.caption && <figcaption>{item.caption}</figcaption>}
              </figure>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
