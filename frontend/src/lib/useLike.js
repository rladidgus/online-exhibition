import { useEffect, useState } from 'react'
import { guestbookEnabled } from './guestbook'
import { fetchLikes, hasLiked, toggleLike } from './workFeedback'

// 좋아요 상태 — 한 페이지에 하트가 두 군데(제목 옆·댓글 옆) 있어서 상태는 여기서 한 번만 만들고 버튼에 넘긴다.
export function useLike(slug) {
  const enabled = guestbookEnabled()
  const [count, setCount] = useState(null)
  const [likedState, setLikedState] = useState(null) // { slug, liked } — 다른 작품으로 넘어가면 다시 읽는다
  const [busy, setBusy] = useState(false)
  const liked = likedState?.slug === slug ? likedState.liked : hasLiked(slug)

  useEffect(() => {
    if (!enabled) return
    let alive = true
    fetchLikes(slug)
      .then(n => { if (alive) setCount(n) })
      .catch(() => { if (alive) setCount(null) })
    return () => { alive = false }
  }, [enabled, slug])

  const toggle = async () => {
    setBusy(true)
    try {
      setCount(await toggleLike(slug))
      setLikedState({ slug, liked: !liked })
    } catch {
      // DB 가 잠깐 쉬는 중이면 숫자만 그대로 둔다
    } finally {
      setBusy(false)
    }
  }

  return { count: enabled ? count : null, liked, busy, toggle }
}
