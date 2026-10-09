import { useEffect, useState } from 'react'
import { imageUrl } from '../../lib/admin'

// 비공개 보관함 이미지 미리보기 — 경로를 서명 주소로 바꿔서 보여 준다
export default function AdminImage({ path, className, style }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let alive = true
    imageUrl(path).then(url => { if (alive) setSrc(url) })
    return () => { alive = false }
  }, [path])

  if (!src) return <img alt="" className={className} style={style} />
  return <img src={src} alt="" className={className} style={style} />
}
