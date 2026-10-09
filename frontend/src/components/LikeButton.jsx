import { useEffect, useState } from 'react'
import { guestbookEnabled } from '../lib/guestbook'
import { fetchLikes, hasLiked, toggleLike } from '../lib/workFeedback'

// 작품 상세의 하트 버튼 (형 원래 디자인 .detail-like 그대로). DB 연결이 없으면 숨긴다.
export default function LikeButton({ slug }) {
  const enabled = guestbookEnabled()
  const [count, setCount] = useState(null)
  const [liked, setLiked] = useState(() => hasLiked(slug))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let alive = true
    fetchLikes(slug)
      .then(n => { if (alive) setCount(n) })
      .catch(() => { if (alive) setCount(null) })
    return () => { alive = false }
  }, [enabled, slug])

  if (!enabled || count === null) return null

  const handleClick = async () => {
    setBusy(true)
    try {
      setCount(await toggleLike(slug))
      setLiked(prev => !prev)
    } catch {
      // DB 가 잠깐 쉬는 중이면 숫자만 그대로 둔다
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className={`detail-like ${liked ? 'liked' : ''}`}
      onClick={handleClick}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
    >
      {liked ? '♥' : '♡'} {count}
    </button>
  )
}
