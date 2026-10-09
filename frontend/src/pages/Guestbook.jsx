import { useState, useEffect, useRef } from 'react'
import { guestbookEnabled, fetchApproved, submitEntry } from '../lib/guestbook'
import './Guestbook.css'

const MAX_NICKNAME = 20
const MAX_CONTENT = 300

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function Guestbook() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [formError, setFormError] = useState('')
  const [loadError, setLoadError] = useState('')

  const enabled = guestbookEnabled()
  const nameRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    fetchApproved()
      .then(setEntries)
      .catch(err => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [enabled])

  const handleSubmit = async (e) => {
    e.preventDefault()
    // 빈 칸이면 무엇을 채워야 하는지 알려 주고 그 칸으로 옮겨 준다
    const missing = !nickname.trim() ? [nameRef, '이름 또는 별명을 입력해 주세요.'] : !content.trim() ? [contentRef, '소감을 입력해 주세요.'] : null
    if (missing) {
      setDone(false)
      setFormError(missing[1])
      missing[0].current?.focus()
      return
    }

    setSending(true)
    setFormError('')
    try {
      await submitEntry(nickname.trim(), content.trim())
      setNickname('')
      setContent('')
      setDone(true)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="guestbook-page page-offset">
      <div className="guestbook-header">
        <h1 className="guestbook-title">방명록</h1>
        <p className="guestbook-lead">
          전시를 보신 소감을 남겨주세요. 남겨주신 글은 확인 후 공개됩니다.
        </p>
      </div>

      {enabled ? (
        <form className="guestbook-form" onSubmit={handleSubmit}>
          <input
            type="text"
            ref={nameRef}
            placeholder="이름 또는 별명"
            value={nickname}
            maxLength={MAX_NICKNAME}
            onChange={e => setNickname(e.target.value)}
          />
          <textarea
            ref={contentRef}
            placeholder="전시를 보신 소감을 남겨주세요."
            value={content}
            maxLength={MAX_CONTENT}
            rows={4}
            onChange={e => setContent(e.target.value)}
          />
          <div className="guestbook-form-foot">
            <span className="guestbook-count">{content.length} / {MAX_CONTENT}</span>
            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? '등록 중…' : '남기기'}
            </button>
          </div>
          {done && <p className="guestbook-done">등록되었습니다. 확인 후 공개됩니다.</p>}
          {formError && <p className="guestbook-error">{formError}</p>}
        </form>
      ) : (
        <p className="guestbook-empty">방명록 기능이 아직 연결되지 않았습니다.</p>
      )}

      <section className="guestbook-list">
        {loading && <p className="guestbook-empty">불러오는 중…</p>}
        {!loading && loadError && <p className="guestbook-error">{loadError}</p>}
        {!loading && !loadError && entries.length === 0 && (
          <p className="guestbook-empty">아직 등록된 글이 없습니다. 첫 글을 남겨주세요.</p>
        )}
        {entries.map(entry => (
          <article className="guestbook-entry" key={entry.id}>
            <div className="guestbook-entry-head">
              <span className="guestbook-entry-name">{entry.nickname}</span>
              <span className="guestbook-entry-date">{formatDate(entry.created_at)}</span>
            </div>
            <p className="guestbook-entry-body">{entry.content}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
