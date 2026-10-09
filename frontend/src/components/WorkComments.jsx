import { useEffect, useState } from 'react'
import { guestbookEnabled } from '../lib/guestbook'
import { fetchComments, submitComment, loadPending, savePending } from '../lib/workFeedback'

const MAX_NICKNAME = 20
const MAX_CONTENT = 300

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// 작품 상세 아래 댓글 (형 원래 디자인 .detail-reviews 그대로). 로그인 없이 쓰고, 준비위 승인 후 공개.
// 내가 쓴 글은 승인 전에도 내 화면에만 '승인 후 게시됩니다' 표시와 함께 보인다.
export default function WorkComments({ slug }) {
  const enabled = guestbookEnabled()
  const [comments, setComments] = useState([])
  const [pending, setPending] = useState([])
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!enabled) return
    let alive = true
    fetchComments(slug)
      .then(list => { if (alive) { setComments(list); setPending(loadPending(slug, list)) } })
      .catch(() => { if (alive) { setComments([]); setPending(loadPending(slug)) } })
    return () => { alive = false }
  }, [enabled, slug])

  if (!enabled) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nickname.trim() || !content.trim()) return
    setSending(true)
    setNotice('')
    try {
      await submitComment(slug, nickname.trim(), content.trim())
      const mine = { id: `mine-${Date.now()}`, nickname: nickname.trim(), content: content.trim(), created_at: new Date().toISOString() }
      savePending(slug, mine)
      setPending(list => [mine, ...list])
      setContent('')
      setNotice('등록되었습니다. 준비위원회 확인 후 모두에게 공개됩니다.')
    } catch (err) {
      setNotice(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="detail-reviews">
      <h2 className="reviews-title">Comments <span>{comments.length + pending.length}</span></h2>

      <form className="review-form" onSubmit={handleSubmit}>
        <input
          className="review-input review-name"
          type="text"
          placeholder="이름 또는 별명"
          value={nickname}
          maxLength={MAX_NICKNAME}
          onChange={e => setNickname(e.target.value)}
        />
        <input
          className="review-input"
          type="text"
          placeholder="감상을 남겨주세요"
          value={content}
          maxLength={MAX_CONTENT}
          onChange={e => setContent(e.target.value)}
        />
        <button className="review-submit" type="submit" disabled={sending}>등록</button>
      </form>
      <p className="review-notice">{notice || '남겨주신 글은 확인 후 공개됩니다.'}</p>

      <ul className="review-list">
        {pending.map(c => (
          <li key={c.id} className="review-item review-item--pending">
            <div className="review-header">
              <span className="review-author">{c.nickname}</span>
              <span className="review-pending">승인 후 게시됩니다</span>
            </div>
            <p className="review-content">{c.content}</p>
          </li>
        ))}
        {comments.map(c => (
          <li key={c.id} className="review-item">
            <div className="review-header">
              <span className="review-author">{c.nickname}</span>
              <span className="review-date">{formatDate(c.created_at)}</span>
            </div>
            <p className="review-content">{c.content}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
