// 하트 버튼 (형 원래 디자인 .detail-like 그대로). DB 연결이 없으면 숨긴다.
export default function LikeButton({ count, liked, busy, toggle }) {
  if (count === null) return null

  return (
    <button
      type="button"
      className={`detail-like ${liked ? 'liked' : ''}`}
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
    >
      {liked ? '♥' : '♡'} {count}
    </button>
  )
}
