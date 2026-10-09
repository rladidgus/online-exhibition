import { useEffect, useState } from 'react'
import { guestbookEnabled } from '../lib/guestbook'
import { fetchComments, submitComment } from '../lib/workFeedback'

const MAX_NICKNAME = 20
const MAX_CONTENT = 300

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// 작품 상세 아래 댓글 (형 원래 디자인 .detail-reviews 그대로). 로그인 없이 쓰고, 준비위 승인 후 공개.
export default function WorkComments({ slug }) {
  const enabled = guestbookEnabled()
  const [comments, setComments] = useState([])
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!enabled) return
    let alive = true
    fetchComments(slug)
      .then(list => { if (alive) setComments(list) })
      .catch(() => { if (alive) setComments([]) })
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
      setContent('')
      setNotice('등록되었습니다. 확인 후 공개됩니다.')
    } catch (err) {
      setNotice(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="detail-reviews">
      <h2 className="reviews-title">Comments <span>{comments.length}</span></h2>

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
