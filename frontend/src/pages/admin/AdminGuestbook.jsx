import { useEffect, useState } from 'react'
import { FEEDBACK_TABLES, listGuestbook, setGuestbookStatus, deleteGuestbookEntry } from '../../lib/admin'
import { useNotice, errorText } from './useNotice.js'
import Notice from './Notice'

const LABEL = { pending: '대기', approved: '승인', hidden: '숨김' }
const PILL = { pending: 'a-pill--wait', approved: 'a-pill--on', hidden: 'a-pill--off' }
const TABS = [['pending', '대기'], ['approved', '승인됨'], ['hidden', '숨김'], ['', '전체']]
const KINDS = [['guestbook', '방명록'], ['comments', '작품 댓글']]

function fmt(iso) {
  const d = new Date(iso)
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

// 방명록과 작품 댓글 승인 화면 (규칙이 같아서 위쪽 버튼으로 바꿔 본다)
export default function AdminGuestbook() {
  const [msg, notify] = useNotice()
  const [kind, setKind] = useState('guestbook')
  const [loaded, setLoaded] = useState({ kind: null, entries: [] })
  const [filter, setFilter] = useState('pending')
  const table = FEEDBACK_TABLES[kind]
  const isComments = kind === 'comments'
  const entries = loaded.kind === kind ? loaded.entries : null

  useEffect(() => {
    let alive = true
    listGuestbook(FEEDBACK_TABLES[kind])
      .then(list => { if (alive) setLoaded({ kind, entries: list }) })
      .catch(err => notify(errorText(err, '불러오지 못했습니다.'), 'err'))
    return () => { alive = false }
  }, [kind, notify])

  const update = fn => setLoaded(prev => ({ ...prev, entries: fn(prev.entries) }))

  async function change(entry, status) {
    try {
      await setGuestbookStatus(entry.id, status, table)
      update(list => list.map(e => (e.id === entry.id ? { ...e, status } : e)))
      notify(`${entry.nickname} 님의 글을 ${LABEL[status]} 처리했습니다.`, 'ok')
    } catch (err) {
      notify(errorText(err, '변경에 실패했습니다.'), 'err')
    }
  }

  async function remove(entry) {
    if (!confirm('이 글을 완전히 삭제합니다. 계속할까요?')) return
    try {
      await deleteGuestbookEntry(entry.id, table)
      update(list => list.filter(e => e.id !== entry.id))
      notify('삭제했습니다.', 'ok')
    } catch (err) {
      notify(errorText(err, '삭제에 실패했습니다.'), 'err')
    }
  }

  const rows = (entries ?? []).filter(e => !filter || e.status === filter)

  return (
    <>
      <div className="a-head">
        <div>
          <h1>방명록 · 작품 댓글</h1>
          <p>관람객이 남긴 글은 승인해야 사이트에 나타납니다. 승인하면 바로 보입니다.</p>
        </div>
        <div className="a-actions">
          {KINDS.map(([key, label]) => (
            <button key={key} type="button" onClick={() => setKind(key)}
              className={`a-btn ${kind === key ? 'a-btn--primary' : ''}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <Notice msg={msg} />

      <div className="a-card">
        <div className="a-actions" style={{ marginBottom: '1rem' }}>
          {TABS.map(([status, label]) => (
            <button key={label} type="button" onClick={() => setFilter(status)}
              className={`a-btn a-btn--sm ${filter === status ? 'a-btn--primary' : ''}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                {isComments && <th style={{ width: 80 }}>작품</th>}
                <th style={{ width: 130 }}>닉네임</th>
                <th>내용</th>
                <th style={{ width: 100 }}>작성일</th>
                <th style={{ width: 80 }}>상태</th>
                <th style={{ width: 200 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(e => (
                <tr key={e.id}>
                  {isComments && (
                    <td><a href={`/works/${e.work_slug}`} target="_blank" rel="noopener"><code>{e.work_slug.toUpperCase()}</code></a></td>
                  )}
                  <td><strong>{e.nickname}</strong></td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>{e.content}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--a-ink-2)' }}>{fmt(e.created_at)}</td>
                  <td><span className={`a-pill ${PILL[e.status]}`}>{LABEL[e.status]}</span></td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {e.status !== 'approved' && <button className="a-btn a-btn--sm" type="button" onClick={() => change(e, 'approved')}>승인</button>}{' '}
                    {e.status !== 'hidden' && <button className="a-btn a-btn--sm" type="button" onClick={() => change(e, 'hidden')}>숨김</button>}{' '}
                    <button className="a-btn a-btn--sm a-btn--danger" type="button" onClick={() => remove(e)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entries && !rows.length && <p className="a-empty">해당하는 글이 없습니다.</p>}
      </div>
    </>
  )
}
