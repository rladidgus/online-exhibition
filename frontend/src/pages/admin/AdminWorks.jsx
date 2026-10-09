import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listWorks, listParts, setPublished, deleteWork } from '../../lib/admin'
import { useNotice, errorText } from './useNotice.js'
import Notice from './Notice'
import AdminImage from './AdminImage'

function assetSummary(w) {
  const images = w.media.filter(m => m.kind === 'image').length
  const videos = w.media.filter(m => m.kind === 'video').length
  const pages = w.episodes.reduce((n, e) => n + e.pages.length, 0)
  const bits = []
  if (w.cover_path) bits.push('대표')
  if (images) bits.push(`이미지 ${images}`)
  if (videos) bits.push(`영상 ${videos}`)
  if (pages) bits.push(`원고 ${pages}`)
  return bits.length ? bits.join(' · ') : <span className="a-pill a-pill--wait">없음</span>
}

export default function AdminWorks() {
  const [msg, notify] = useNotice()
  const [params, setParams] = useSearchParams()
  const [works, setWorks] = useState(null)
  const [parts, setParts] = useState([])
  const [query, setQuery] = useState('')
  const part = params.get('part') ?? ''

  useEffect(() => {
    Promise.all([listWorks(), listParts()])
      .then(([w, p]) => { setWorks(w); setParts(p) })
      .catch(err => notify(errorText(err, '불러오지 못했습니다.'), 'err'))
  }, [notify])

  const partLabel = new Map(parts.map(p => [p.slug, p.label]))
  const q = query.trim().toLowerCase()
  const rows = (works ?? []).filter(w => {
    if (part && w.part_slug !== part) return false
    if (!q) return true
    return [w.title, w.slug, ...w.authors.map(a => a.name)].join(' ').toLowerCase().includes(q)
  })

  async function togglePublished(w) {
    try {
      await setPublished(w.id, !w.is_published)
      setWorks(list => list.map(x => (x.id === w.id ? { ...x, is_published: !w.is_published } : x)))
      notify(`${w.title} — ${w.is_published ? '비공개' : '공개'}로 바꿨습니다.`, 'ok')
    } catch (err) {
      notify(errorText(err, '변경에 실패했습니다.'), 'err')
    }
  }

  async function handleDelete(w) {
    if (!confirm(`"${w.title}" 을(를) 삭제합니다. 되돌릴 수 없습니다. 계속할까요?`)) return
    try {
      await deleteWork(w)
      setWorks(list => list.filter(x => x.id !== w.id))
      notify('삭제했습니다.', 'ok')
    } catch (err) {
      notify(errorText(err, '삭제에 실패했습니다.'), 'err')
    }
  }

  return (
    <>
      <div className="a-head">
        <div>
          <h1>작품 관리</h1>
          <p>제출번호는 사이트 주소가 되므로 한 번 정하면 바꾸지 않습니다.</p>
        </div>
        <div className="a-actions">
          <Link className="a-btn a-btn--primary" to="/admin/works/new">작품 추가</Link>
        </div>
      </div>

      <Notice msg={msg} />

      <div className="a-card">
        <div className="a-row a-row--2" style={{ marginBottom: '1rem' }}>
          <div className="a-field" style={{ margin: 0 }}>
            <label htmlFor="f-part">파트</label>
            <select id="f-part" value={part}
              onChange={e => setParams(e.target.value ? { part: e.target.value } : {})}>
              <option value="">전체</option>
              {parts.map(p => <option key={p.slug} value={p.slug}>{p.label}</option>)}
            </select>
          </div>
          <div className="a-field" style={{ margin: 0 }}>
            <label htmlFor="f-q">검색</label>
            <input id="f-q" type="search" placeholder="작품명 · 작가명 · 제출번호"
              value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>대표</th>
                <th>번호</th>
                <th>작품명</th>
                <th>작가</th>
                <th>파트</th>
                <th>자료</th>
                <th>공개</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(w => (
                <tr key={w.id}>
                  <td><AdminImage path={w.cover_path} /></td>
                  <td><code>{w.slug.toUpperCase()}</code></td>
                  <td><strong>{w.title}</strong></td>
                  <td>{w.authors.map(a => a.name).join(', ') || '–'}</td>
                  <td>{partLabel.get(w.part_slug) ?? w.part_slug}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--a-ink-2)' }}>{assetSummary(w)}</td>
                  <td>
                    <button type="button" className={`a-pill ${w.is_published ? 'a-pill--on' : 'a-pill--off'}`}
                      style={{ cursor: 'pointer' }} onClick={() => togglePublished(w)}>
                      {w.is_published ? '공개' : '비공개'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Link className="a-btn a-btn--sm" to={`/admin/works/${w.id}`}>편집</Link>{' '}
                    <button className="a-btn a-btn--sm a-btn--danger" type="button" onClick={() => handleDelete(w)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {works && !rows.length && <p className="a-empty">해당하는 작품이 없습니다.</p>}
      </div>
    </>
  )
}
