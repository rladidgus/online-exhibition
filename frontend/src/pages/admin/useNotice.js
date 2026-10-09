import { useCallback, useRef, useState } from 'react'

// 화면 위 알림 한 줄. kind = ok | err | warn, ok 는 4초 뒤 사라진다.
export function useNotice() {
  const [msg, setMsg] = useState(null)
  const timer = useRef(null)

  const notify = useCallback((text, kind = 'ok') => {
    clearTimeout(timer.current)
    setMsg({ text, kind })
    if (kind === 'ok') timer.current = setTimeout(() => setMsg(null), 4000)
  }, [])

  return [msg, notify]
}

export const errorText = (err, fallback) => (err instanceof Error ? err.message : fallback)
