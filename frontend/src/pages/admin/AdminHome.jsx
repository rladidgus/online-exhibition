import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listWorks, listGuestbook, listParts, triggerDeploy } from '../../lib/admin'
import { useNotice, errorText } from './useNotice.js'
import Notice from './Notice'

const statStyle = { fontSize: '2rem', fontWeight: 800, lineHeight: 1 }
const subStyle = { color: 'var(--a-ink-2)', fontSize: '0.875rem', marginTop: '0.35rem' }

export default function AdminHome() {
  const [msg, notify] = useNotice()
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    Promise.all([listWorks(), listGuestbook(), listGuestbook('work_comments'), listParts()])
      .then(([works, guestbook, comments, parts]) => setData({ works, guestbook: [...guestbook, ...comments], parts }))
      .catch(err => notify(errorText(err, '불러오지 못했습니다.'), 'err'))
  }, [notify])

  async function handleDeploy() {
    setBusy(true)
    try {
      notify(await triggerDeploy(), 'ok')
    } catch (err) {
      notify(errorText(err, '반영에 실패했습니다.'), 'err')
    } finally {
      setBusy(false)
    }
  }

  const works = data?.works ?? []
  const published = works.filter(w => w.is_published).length
  const pending = (data?.guestbook ?? []).filter(g => g.status === 'pending').length

  return (
    <>
      <div className="a-head">
        <div>
          <h1>대시보드</h1>
          <p>작품과 방명록을 관리하고, 바꾼 내용을 공개 사이트에 반영합니다.</p>
        </div>
        <div className="a-actions">
          <Link className="a-btn" to="/admin/works/new">작품 추가</Link>
          <button className="a-btn a-btn--primary" type="button" onClick={handleDeploy} disabled={busy}>사이트에 반영</button>
        </div>
      </div>

      <Notice msg={msg} />

      <div className="a-grid a-grid--3">
        <div className="a-card">
          <p className="a-card__title">작품</p>
          <p style={statStyle}>{data ? works.length : '–'}</p>
          <p style={subStyle}>{data ? `${data.parts.length}개 파트` : ''}</p>
        </div>
        <div className="a-card">
          <p className="a-card__title">공개 상태</p>
          <p style={statStyle}>{data ? `${published} / ${works.length}` : '–'}</p>
          <p style={subStyle}>공개로 표시한 작품 / 전체 작품</p>
        </div>
        <div className="a-card">
          <p className="a-card__title">방명록 · 댓글 대기</p>
          <p style={statStyle}>{data ? pending : '–'}</p>
          <p style={subStyle}><Link to="/admin/guestbook">확인하러 가기</Link></p>
        </div>
      </div>

      <div className="a-card" style={{ marginTop: '1rem' }}>
        <p className="a-card__title">파트별 현황</p>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr><th>파트</th><th>작품</th><th>공개</th><th>대표 이미지 없음</th><th></th></tr>
            </thead>
            <tbody>
              {(data?.parts ?? []).map(p => {
                const items = works.filter(w => w.part_slug === p.slug)
                const noCover = items.filter(w => !w.cover_path).length
                return (
                  <tr key={p.slug}>
                    <td><strong>{p.label}</strong></td>
                    <td>{items.length}</td>
                    <td>{items.filter(w => w.is_published).length}</td>
                    <td>{noCover ? <span className="a-pill a-pill--wait">{noCover}건</span> : '–'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link className="a-btn a-btn--sm" to={`/admin/works?part=${p.slug}`}>보기</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="a-card" style={{ marginTop: '1rem' }}>
        <p className="a-card__title">반영 방법</p>
        <p style={{ color: 'var(--a-ink-2)', fontSize: '0.9375rem' }}>
          작품·사이트 설정은 저장해도 바로 공개 사이트에 나타나지 않습니다. 공개 사이트는 미리 만들어 둔 파일로 보여 주기 때문입니다.
          작업을 마친 뒤 <strong>사이트에 반영</strong>을 누르면 1~2분 뒤 실제 사이트가 바뀝니다.
          방명록 승인은 예외로, 승인하는 즉시 사이트에 보입니다.
        </p>
      </div>
    </>
  )
}
