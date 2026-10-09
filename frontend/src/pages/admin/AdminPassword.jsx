import { useState } from 'react'
import { changePassword } from '../../lib/admin'
import { useNotice, errorText } from './useNotice.js'
import Notice from './Notice'

const MIN_LENGTH = 8

// 처음 받은 임시 비밀번호를 본인이 정한 것으로 바꾸는 화면
export default function AdminPassword() {
  const [msg, notify] = useNotice()
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < MIN_LENGTH) return notify(`비밀번호는 ${MIN_LENGTH}자 이상으로 정해 주세요.`, 'err')
    if (password !== confirmText) return notify('두 칸의 비밀번호가 서로 다릅니다.', 'err')
    setBusy(true)
    try {
      await changePassword(password)
      setPassword('')
      setConfirmText('')
      notify('비밀번호를 바꿨습니다. 다음 로그인부터 새 비밀번호를 쓰세요.', 'ok')
    } catch (err) {
      notify(errorText(err, '비밀번호를 바꾸지 못했습니다.'), 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="a-head">
        <div>
          <h1>비밀번호 바꾸기</h1>
          <p>처음 받은 임시 비밀번호는 로그인한 뒤 바로 바꿔 주세요.</p>
        </div>
      </div>

      <Notice msg={msg} />

      <div className="a-card" style={{ maxWidth: 420 }}>
        <form onSubmit={handleSubmit}>
          <div className="a-field">
            <label htmlFor="p-new">새 비밀번호</label>
            <input id="p-new" type="password" autoComplete="new-password" required
              value={password} onChange={e => setPassword(e.target.value)} />
            <span className="a-hint">{MIN_LENGTH}자 이상</span>
          </div>
          <div className="a-field">
            <label htmlFor="p-confirm">새 비밀번호 확인</label>
            <input id="p-confirm" type="password" autoComplete="new-password" required
              value={confirmText} onChange={e => setConfirmText(e.target.value)} />
          </div>
          <button className="a-btn a-btn--primary" type="submit" disabled={busy}>바꾸기</button>
        </form>
      </div>
    </>
  )
}
