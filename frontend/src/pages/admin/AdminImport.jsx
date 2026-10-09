import { useState } from 'react'
import { Link } from 'react-router-dom'
import { listWorks, createWork, uploadImage, WEBTOON_WIDTH } from '../../lib/admin'
import { buildPlan, MAX_EPISODE_HEIGHT } from '../../lib/importPlan'
import { useNotice, errorText } from './useNotice.js'
import Notice from './Notice'

const PART_LABEL = { startup: '창업', webtoon: '웹툰', video: '영상', game: '게임' }
const pad = (n, len) => String(n).padStart(len, '0')
const stamp = () => Date.now().toString(36)

async function imageHeight(file) {
  const bitmap = await createImageBitmap(file)
  const h = bitmap.height
  bitmap.close()
  return h
}

// 웹툰 화마다 세로 합계 확인 (3만 픽셀)
async function checkWebtoonHeights(items) {
  for (const it of items) {
    if (it.part_slug !== 'webtoon') continue
    for (const ep of it.episodes) {
      let total = 0
      for (const page of ep.pages) total += await imageHeight(page.file)
      if (total > MAX_EPISODE_HEIGHT) {
        it.issues.push(`${ep.no}화 세로 합계 ${total.toLocaleString()}px — ${MAX_EPISODE_HEIGHT.toLocaleString()}px 넘음 (올리기는 됨)`)
      }
    }
  }
}

// 한 작품 올리기 — 그림을 먼저 올리고 작품을 비공개로 만든다
async function uploadItem(it, sortOrder, onImage) {
  const folder = `works/${it.slug.toUpperCase()}`
  const cover_path = await uploadImage(it.thumb.file, `${folder}/main_${stamp()}`)
  onImage()
  const media = it.video_url ? [{ kind: 'video', video_url: it.video_url }] : []
  for (const [i, img] of it.images.entries()) {
    media.push({ kind: 'image', path: await uploadImage(img.file, `${folder}/detail_${pad(i + 1, 2)}_${stamp()}`) })
    onImage()
  }
  const episodes = []
  for (const ep of it.episodes) {
    const pages = []
    for (const [i, page] of ep.pages.entries()) {
      pages.push(await uploadImage(page.file, `${folder}/ep${pad(ep.no, 2)}/${pad(i + 1, 3)}_${stamp()}`, { maxWidth: WEBTOON_WIDTH }))
      onImage()
    }
    episodes.push({ no: ep.no, title: ep.title, pages })
  }
  await createWork({
    part_slug: it.part_slug,
    slug: it.slug,
    title: it.title,
    genres: it.genres,
    synopsis: it.synopsis,
    world_setting: it.world_setting,
    cover_path,
    sort_order: sortOrder,
    is_published: false,
    authors: it.authors.map(({ name, role, contact_type, contact_url }) => ({ name, role, contact_type, contact_url })),
    media,
    episodes,
  })
}

const imageCount = it => 1 + it.images.length + it.episodes.reduce((n, e) => n + e.pages.length, 0)

// 학생 이름 폴더 + 기입표로 작품을 한꺼번에 올리는 화면. 먼저 점검표를 보여 주고, 확인 후 올린다.
export default function AdminImport() {
  const [msg, notify] = useNotice()
  const [sheets, setSheets] = useState([])
  const [files, setFiles] = useState([])
  const [plan, setPlan] = useState(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState({}) // index → 'running' | 'done' | 오류 문구
  const [uploaded, setUploaded] = useState(0)

  async function handleSheets(e) {
    const list = Array.from(e.target.files ?? [])
    setSheets(await Promise.all(list.map(async f => ({ name: f.name, text: await f.text() }))))
    setPlan(null)
  }

  function handleFolder(e) {
    setFiles(Array.from(e.target.files ?? []).map(f => ({ path: f.webkitRelativePath || f.name, file: f })))
    setPlan(null)
  }

  async function handleCheck() {
    setBusy(true)
    try {
      const existing = await listWorks()
      const next = buildPlan({ sheets, files, existing })
      await checkWebtoonHeights(next.items)
      setPlan(next)
      setStatus({})
      setUploaded(0)
    } catch (err) {
      notify(errorText(err, '점검에 실패했습니다.'), 'err')
    } finally {
      setBusy(false)
    }
  }

  async function handleUpload() {
    const targets = plan.items.map((it, i) => [it, i]).filter(([it]) => !it.skip && !it.blocking)
    if (!confirm(`작품 ${targets.length}개를 비공개로 올립니다. 그림이 많으면 10~20분 걸릴 수 있습니다. 이 창을 닫지 마세요. 계속할까요?`)) return
    setBusy(true)
    let failed = 0
    for (const [it, i] of targets) {
      setStatus(s => ({ ...s, [i]: 'running' }))
      try {
        await uploadItem(it, i, () => setUploaded(n => n + 1))
        setStatus(s => ({ ...s, [i]: 'done' }))
      } catch (err) {
        failed += 1
        setStatus(s => ({ ...s, [i]: errorText(err, '실패') }))
      }
    }
    setBusy(false)
    notify(failed
      ? `${targets.length - failed}개 올림, ${failed}개 실패 — 실패한 줄을 확인한 뒤 다시 '점검'부터 하면 올라간 작품은 건너뛰고 나머지만 올립니다.`
      : `${targets.length}개를 비공개로 올렸습니다. '작품 관리'에서 확인 후 공개로 바꾸고 '사이트에 반영'을 누르세요.`, failed ? 'warn' : 'ok')
  }

  const ready = plan ? plan.items.filter(it => !it.skip && !it.blocking) : []
  const totalImages = ready.reduce((n, it) => n + imageCount(it), 0)

  return (
    <>
      <div className="a-head">
        <div>
          <h1>한꺼번에 올리기</h1>
          <p>학생 이름 폴더와 기입표(CSV)를 고르면 먼저 점검표를 보여 드립니다. 확인 후 '올리기'를 누르면 모두 비공개로 올라갑니다.</p>
        </div>
      </div>

      <Notice msg={msg} />

      <div className="a-card">
        <div className="a-row a-row--2">
          <div className="a-field">
            <label htmlFor="imp-sheets">① 기입표 (CSV, 여러 개 선택 가능)</label>
            <input id="imp-sheets" type="file" accept=".csv,text/csv" multiple onChange={handleSheets} disabled={busy} />
            <span className="a-hint">구글 시트는 파트 탭마다 파일 → 다운로드 → CSV. 파일 이름이나 '파트' 칸에 파트명(웹툰·영상·창업·게임)이 있으면 됩니다. {sheets.length ? `${sheets.length}개 선택됨` : ''}</span>
          </div>
          <div className="a-field">
            <label htmlFor="imp-folder">② 학생 자료 폴더 (맨 위 폴더 하나)</label>
            <input id="imp-folder" type="file" webkitdirectory="" directory="" multiple onChange={handleFolder} disabled={busy} />
            <span className="a-hint">학생 이름 폴더들이 들어 있는 폴더를 고르세요(파트별 묶음 폴더가 있어도 됩니다). {files.length ? `파일 ${files.length}개` : ''}</span>
          </div>
        </div>
        <div className="a-actions">
          <button className="a-btn" type="button" onClick={handleCheck} disabled={busy || !sheets.length || !files.length}>점검</button>
          {plan && (
            <button className="a-btn a-btn--primary" type="button" onClick={handleUpload} disabled={busy || !ready.length}>
              {ready.length}개 올리기 (그림 {totalImages}장)
            </button>
          )}
          {busy && plan && <span className="a-hint" style={{ alignSelf: 'center' }}>그림 {uploaded} / {totalImages}장 올림…</span>}
        </div>
      </div>

      {plan && (
        <div className="a-card" style={{ marginTop: '1rem' }}>
          <p className="a-card__title">점검표 — 올림 {ready.length} · 이미 있음 {plan.items.filter(it => it.skip).length} · 못 올림 {plan.items.filter(it => !it.skip && it.blocking).length}</p>
          {[...plan.problems, ...plan.unusedFolders.map(f => `기입표에 없는 폴더: ${f}`), ...plan.ignored.map(f => `그림이 아니라 건너뛴 파일: ${f}`)].map(t => (
            <p key={t} className="a-msg a-msg--warn" style={{ marginBottom: '0.4rem' }}>{t}</p>
          ))}
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr><th>번호</th><th>파트</th><th>작품명</th><th>작가</th><th>폴더</th><th>그림</th><th>확인할 것</th><th>상태</th></tr>
              </thead>
              <tbody>
                {plan.items.map((it, i) => {
                  const st = status[i]
                  return (
                    <tr key={`${it.source}-${i}`}>
                      <td><code>{it.slug ? it.slug.toUpperCase() : '–'}</code></td>
                      <td>{PART_LABEL[it.part_slug]}</td>
                      <td><strong>{it.title || '(작품명 없음)'}</strong></td>
                      <td>{it.authors.map(a => a.name).join(', ')}</td>
                      <td>{it.folder ?? '–'}</td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                        {it.thumb ? '썸네일' : ''}
                        {it.images.length ? ` · 그림 ${it.images.length}` : ''}
                        {it.episodes.length ? ` · ${it.episodes.map(e => `${e.no}화 ${e.pages.length}장`).join(', ')}` : ''}
                        {it.video_url ? ' · 영상' : ''}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--a-ink-2)' }}>{it.issues.join(' / ') || '–'}</td>
                      <td>
                        {it.skip ? <span className="a-pill a-pill--off">이미 있음</span>
                          : it.blocking ? <span className="a-pill a-pill--wait">못 올림</span>
                          : st === 'done' ? <span className="a-pill a-pill--on">올림</span>
                          : st === 'running' ? <span className="a-pill">올리는 중</span>
                          : st ? <span className="a-pill a-pill--wait" title={st}>실패</span>
                          : <span className="a-pill">준비됨</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="a-hint" style={{ marginTop: '0.75rem' }}>
            올라간 작품은 모두 비공개입니다. <Link to="/admin/works">작품 관리</Link>에서 내용을 확인한 뒤 '공개'로 바꾸고 대시보드의 '사이트에 반영'을 누르세요.
          </p>
        </div>
      )}
    </>
  )
}
