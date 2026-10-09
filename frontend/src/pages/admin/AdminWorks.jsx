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

const STATUS_TABS = [['', '전체'], ['on', '공개'], ['off', '비공개']]
const statusOf = w => (w.is_published ? 'on' : 'off')

// 작품 목록 — 방명록·댓글 화면과 같은 방식: 위쪽 탭(개수 표시)으로 거르고, 줄마다 오른쪽 버튼으로 처리
export default function AdminWorks() {
  const [msg, notify] = useNotice()
  const [params, setParams] = useSearchParams()
  const [works, setWorks] = useState(null)
  const [parts, setParts] = useState([])
  const [query, setQuery] = useState('')
  const part = params.get('part') ?? ''
  const status = params.get('status') ?? ''
  const setFilter = (key, value) => setParams(prev => {
    const next = new URLSearchParams(prev)
    if (value) next.set(key, value)
    else next.delete(key)
    return next
  })

  useEffect(() => {
    Promise.all([listWorks(), listParts()])
      .then(([w, p]) => { setWorks(w); setParts(p) })
      .catch(err => notify(errorText(err, '불러오지 못했습니다.'), 'err'))
  }, [notify])

  const partLabel = new Map(parts.map(p => [p.slug, p.label]))
  const q = query.trim().toLowerCase()
  const searched = (works ?? []).filter(w =>
    !q || [w.title, w.slug, ...w.authors.map(a => a.name)].join(' ').toLowerCase().includes(q))
  // 개수: 파트 탭은 상태 거름 전, 상태 탭은 파트 거름 후 (지금 고른 쪽 기준으로 몇 개인지)
  const byStatus = searched.filter(w => !status || statusOf(w) === status)
  const inPart = searched.filter(w => !part || w.part_slug === part)
  const rows = inPart.filter(w => !status || statusOf(w) === status)
  const hiddenRows = rows.filter(w => !w.is_published)

  async function changePublished(list, value) {
    try {
      await setPublished(list.map(w => w.id), value)
      const ids = new Set(list.map(w => w.id))
      setWorks(all => all.map(x => (ids.has(x.id) ? { ...x, is_published: value } : x)))
      const what = list.length === 1 ? list[0].title : `${list.length}개 작품`
      notify(`${what} — ${value ? '공개' : '비공개'}로 바꿨습니다. 사이트에는 '사이트에 반영' 후 나타납니다.`, 'ok')
    } catch (err) {
      notify(errorText(err, '변경에 실패했습니다.'), 'err')
    }
  }

  function publishAll() {
    if (!confirm(`지금 보이는 비공개 작품 ${hiddenRows.length}개를 모두 공개합니다. 계속할까요?`)) return
    changePublished(hiddenRows, true)
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
        <div className="a-actions" style={{ marginBottom: '0.5rem', alignItems: 'center' }}>
          <span style={{ width: '2.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--a-ink-2)' }}>상태</span>
          {STATUS_TABS.map(([key, label]) => (
            <button key={label} type="button" onClick={() => setFilter('status', key)}
              className={`a-btn a-btn--sm ${status === key ? 'a-btn--primary' : ''}`}>
              {label} {inPart.filter(w => !key || statusOf(w) === key).length}
            </button>
          ))}
        </div>
        <div className="a-actions" style={{ marginBottom: '1rem', alignItems: 'center' }}>
          <span style={{ width: '2.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--a-ink-2)' }}>파트</span>
          {[['', '전체'], ...parts.map(p => [p.slug, p.label])].map(([key, label]) => (
            <button key={label} type="button" onClick={() => setFilter('part', key)}
              className={`a-btn a-btn--sm ${part === key ? 'a-btn--primary' : ''}`}>
              {label} {byStatus.filter(w => !key || w.part_slug === key).length}
            </button>
          ))}
        </div>
        <div className="a-row a-row--2" style={{ marginBottom: '1rem', alignItems: 'end' }}>
          <div className="a-field" style={{ margin: 0 }}>
            <label htmlFor="f-q">검색</label>
            <input id="f-q" type="search" placeholder="작품명 · 작가명 · 제출번호"
              value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="a-actions" style={{ justifyContent: 'flex-end' }}>
            {hiddenRows.length > 0 && (
              <button type="button" className="a-btn" onClick={publishAll}>
                보이는 비공개 {hiddenRows.length}개 모두 공개
              </button>
            )}
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
                  <td><span className={`a-pill ${w.is_published ? 'a-pill--on' : 'a-pill--off'}`}>{w.is_published ? '공개' : '비공개'}</span></td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="a-btn a-btn--sm" type="button" onClick={() => changePublished([w], !w.is_published)}>
                      {w.is_published ? '비공개로' : '공개하기'}
                    </button>{' '}
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
