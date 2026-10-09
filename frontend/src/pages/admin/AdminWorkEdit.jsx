import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { listParts, getWork, createWork, updateWork, deleteWork, uploadImage, WEBTOON_WIDTH } from '../../lib/admin'
import { useNotice, errorText } from './useNotice.js'
import Notice from './Notice'
import AdminImage from './AdminImage'

const CONTACT_TYPES = ['', 'instagram', 'x', 'email', 'behance']
const SLUG_RE = /^[a-z]\d{2,3}$/i
const MAX_EPISODES = 3 // 계약 범위 1~3화

const blankWork = part => ({
  part_slug: part, slug: '', title: '', genres: [], synopsis: '', world_setting: '',
  cover_path: null, sort_order: 0, is_published: false,
  authors: [{ name: '' }], media: [], episodes: [],
})

const pad = (n, len) => String(n).padStart(len, '0')
// 이름 끝에 시각을 붙여 같은 경로 = 같은 그림이 되게 한다(덮어쓰기 방지 + 빌드가 배포된 사이트의 사본을 재사용)
const stamp = () => Date.now().toString(36)

export default function AdminWorkEdit() {
  const { id } = useParams() // 'new' 이면 새 작품
  const isNew = id === 'new'
  const navigate = useNavigate()
  const [msg, notify] = useNotice()
  const [parts, setParts] = useState([])
  const [work, setWork] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    listParts()
      .then(async p => {
        setParts(p)
        if (isNew) return setWork(blankWork(p[0]?.slug ?? 'startup'))
        const found = await getWork(id)
        if (!found) notify('작품을 찾을 수 없습니다. 목록에서 다시 선택해 주세요.', 'err')
        else setWork(found)
      })
      .catch(err => notify(errorText(err, '불러오지 못했습니다.'), 'err'))
  }, [id, isNew, notify])

  if (!work) return <Notice msg={msg} />

  const set = patch => setWork(w => ({ ...w, ...patch }))
  const partGenres = parts.find(p => p.slug === work.part_slug)?.genres ?? []
  const isWebtoon = work.part_slug === 'webtoon'
  const hasWorld = work.part_slug === 'startup' || work.part_slug === 'game'
  const folder = `works/${work.slug.trim().toUpperCase()}`

  function requireSlug() {
    if (SLUG_RE.test(work.slug.trim())) return true
    notify('먼저 제출번호를 입력해 주세요 (예: W01). 파일이 그 번호 폴더에 저장됩니다.', 'err')
    return false
  }

  // ---- 목록 항목 편집 (작가 · 미디어 · 회차) ----
  const editAt = (key, i, patch) =>
    set({ [key]: work[key].map((item, j) => (j === i ? { ...item, ...patch } : item)) })
  const removeAt = (key, i) => set({ [key]: work[key].filter((_, j) => j !== i) })

  function moveMedia(i, dir) {
    const to = i + dir
    if (to < 0 || to >= work.media.length) return
    const media = [...work.media]
    const [item] = media.splice(i, 1)
    media.splice(to, 0, item)
    set({ media })
  }

  // ---- 업로드 ----
  async function handleCover(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !requireSlug()) return
    try {
      notify('올리는 중입니다…', 'warn')
      set({ cover_path: await uploadImage(file, `${folder}/main_${stamp()}`) })
      notify('대표 이미지를 올렸습니다. 저장을 눌러야 반영됩니다.', 'ok')
    } catch (err) {
      notify(errorText(err, '업로드에 실패했습니다.'), 'err')
    }
  }

  async function handleMedia(e) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length || !requireSlug()) return
    const added = []
    try {
      let n = work.media.filter(m => m.kind === 'image').length
      for (const file of files) {
        n += 1
        notify(`올리는 중입니다… (${n})`, 'warn')
        added.push({ kind: 'image', path: await uploadImage(file, `${folder}/detail_${pad(n, 2)}_${stamp()}`) })
      }
      notify(`이미지 ${files.length}장을 올렸습니다. 저장을 눌러야 반영됩니다.`, 'ok')
    } catch (err) {
      notify(errorText(err, '업로드에 실패했습니다.'), 'err')
    } finally {
      if (added.length) setWork(w => ({ ...w, media: [...w.media, ...added] }))
    }
  }

  async function handlePages(i, e) {
    // 파일명 순으로 올린다 (001.jpg, 002.jpg … 로 받는 경우가 많다)
    const files = Array.from(e.target.files ?? []).sort((a, b) => a.name.localeCompare(b.name))
    e.target.value = ''
    if (!files.length || !requireSlug()) return
    const ep = work.episodes[i]
    const added = []
    try {
      let n = ep.pages.length
      for (const file of files) {
        n += 1
        notify(`원고를 올리는 중입니다… (${n})`, 'warn')
        added.push(await uploadImage(file, `${folder}/ep${pad(ep.no, 2)}/${pad(n, 3)}_${stamp()}`, { maxWidth: WEBTOON_WIDTH }))
      }
      notify(`원고 ${files.length}장을 올렸습니다. 저장을 눌러야 반영됩니다.`, 'ok')
    } catch (err) {
      notify(errorText(err, '업로드에 실패했습니다.'), 'err')
    } finally {
      if (added.length) {
        setWork(w => ({
          ...w,
          episodes: w.episodes.map((x, j) => (j === i ? { ...x, pages: [...x.pages, ...added] } : x)),
        }))
      }
    }
  }

  function addEpisode() {
    if (work.episodes.length >= MAX_EPISODES) {
      notify('계약 범위는 1~3화입니다. 더 필요하면 범위 협의가 먼저입니다.', 'warn')
      return
    }
    set({ episodes: [...work.episodes, { no: work.episodes.length + 1, title: '', pages: [] }] })
  }

  function removeEpisode(i) {
    set({ episodes: work.episodes.filter((_, j) => j !== i).map((ep, j) => ({ ...ep, no: j + 1 })) })
  }

  function removePage(i, pi) {
    set({
      episodes: work.episodes.map((ep, j) =>
        (j === i ? { ...ep, pages: ep.pages.filter((_, k) => k !== pi) } : ep)),
    })
  }

  // ---- 저장 ----
  function collect() {
    const slug = work.slug.trim().toLowerCase()
    if (!SLUG_RE.test(slug)) return notify('제출번호는 영문 1자 + 숫자 2~3자입니다 (예: W01).', 'err')
    if (!work.title.trim()) return notify('작품명을 입력해 주세요.', 'err')
    const authors = work.authors.filter(a => a.name.trim())
    if (!authors.length) return notify('작가 이름을 최소 한 명 입력해 주세요.', 'err')
    if (work.media.some(m => m.kind === 'video' && !m.video_url?.trim())) {
      return notify('영상 주소가 비어 있습니다. 채우거나 제거해 주세요.', 'err')
    }
    return {
      ...work,
      slug,
      title: work.title.trim(),
      genres: work.genres.filter(g => partGenres.includes(g)),
      synopsis: work.synopsis?.trim() || null,
      world_setting: hasWorld ? work.world_setting?.trim() || null : null,
      sort_order: Number(work.sort_order) || 0,
      authors,
      episodes: isWebtoon ? work.episodes : [],
    }
  }

  async function handleSave() {
    const input = collect()
    if (!input) return
    setBusy(true)
    try {
      if (isNew) {
        const newId = await createWork(input)
        navigate(`/admin/works/${newId}`, { replace: true })
        notify('작품을 추가했습니다. 공개 사이트 반영은 대시보드의 "사이트에 반영"을 누르세요.', 'ok')
      } else {
        await updateWork(id, input)
        notify('저장했습니다. 공개 사이트 반영은 대시보드의 "사이트에 반영"을 누르세요.', 'ok')
      }
    } catch (err) {
      notify(errorText(err, '저장에 실패했습니다.'), 'err')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!confirm('이 작품을 삭제합니다. 되돌릴 수 없습니다. 계속할까요?')) return
    try {
      await deleteWork({ ...work, id })
      navigate('/admin/works')
    } catch (err) {
      notify(errorText(err, '삭제에 실패했습니다.'), 'err')
    }
  }

  return (
    <>
      <div className="a-head">
        <div>
          <h1>{isNew ? '작품 추가' : work.title || '작품 편집'}</h1>
          <p>{isNew ? '제출 양식으로 받은 내용을 그대로 옮기면 됩니다.' : `제출번호 ${work.slug.toUpperCase()}`}</p>
        </div>
        <div className="a-actions">
          <Link className="a-btn" to="/admin/works">목록</Link>
          {!isNew && <button className="a-btn a-btn--danger" type="button" onClick={handleDelete}>삭제</button>}
          <button className="a-btn a-btn--primary" type="button" onClick={handleSave} disabled={busy}>저장</button>
        </div>
      </div>

      <Notice msg={msg} />

      <div className="a-grid a-grid--2">
        <div>
          <div className="a-card">
            <p className="a-card__title">기본 정보</p>

            <div className="a-row a-row--2">
              <div className="a-field">
                <label htmlFor="f-part">파트</label>
                <select id="f-part" value={work.part_slug} onChange={e => set({ part_slug: e.target.value })}>
                  {parts.map(p => <option key={p.slug} value={p.slug}>{p.label}</option>)}
                </select>
              </div>
              <div className="a-field">
                <label htmlFor="f-slug">제출번호</label>
                <input id="f-slug" type="text" placeholder="W01" value={work.slug.toUpperCase()}
                  onChange={e => set({ slug: e.target.value })} />
                <span className="a-hint">사이트 주소가 됩니다(<code>/works/w01</code>). 정한 뒤에는 바꾸지 않습니다.</span>
              </div>
            </div>

            <div className="a-field">
              <label htmlFor="f-title">작품명</label>
              <input id="f-title" type="text" maxLength={60} value={work.title}
                onChange={e => set({ title: e.target.value })} />
            </div>

            <div className="a-field">
              <label>장르</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.9rem' }}>
                {partGenres.map(g => (
                  <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9375rem' }}>
                    <input type="checkbox" checked={work.genres.includes(g)} onChange={e => set({
                      genres: e.target.checked ? [...work.genres, g] : work.genres.filter(x => x !== g),
                    })} />
                    {g}
                  </label>
                ))}
              </div>
              <span className="a-hint">1~3개 권장. 목록 화면의 필터가 이 값을 씁니다.</span>
            </div>

            <div className="a-field">
              <label htmlFor="f-synopsis">{isWebtoon ? '시놉시스' : '기획의도'}</label>
              <textarea id="f-synopsis" maxLength={1200} value={work.synopsis ?? ''}
                onChange={e => set({ synopsis: e.target.value })} />
            </div>

            {hasWorld && (
              <div className="a-field">
                <label htmlFor="f-world">세계관</label>
                <textarea id="f-world" maxLength={1600} value={work.world_setting ?? ''}
                  onChange={e => set({ world_setting: e.target.value })} />
                <span className="a-hint">창업·게임 파트만 사용합니다.</span>
              </div>
            )}

            <div className="a-row a-row--2">
              <div className="a-field">
                <label htmlFor="f-order">노출 순서</label>
                <input id="f-order" type="number" min="0" step="1" value={work.sort_order}
                  onChange={e => set({ sort_order: e.target.value })} />
              </div>
              <div className="a-field">
                <label htmlFor="f-published">공개</label>
                <select id="f-published" value={String(work.is_published)}
                  onChange={e => set({ is_published: e.target.value === 'true' })}>
                  <option value="true">공개</option>
                  <option value="false">비공개</option>
                </select>
              </div>
            </div>
          </div>

          <div className="a-card">
            <div className="a-sub__head" style={{ marginBottom: '0.9rem' }}>
              <p className="a-card__title" style={{ margin: 0 }}>작가</p>
              <button className="a-btn a-btn--sm" type="button"
                onClick={() => set({ authors: [...work.authors, { name: '' }] })}>작가 추가</button>
            </div>
            {work.authors.map((a, i) => (
              <div className="a-sub" key={i}>
                <div className="a-sub__head">
                  <span className="a-sub__title">{i === 0 ? '대표' : `작가 ${i + 1}`}</span>
                  {work.authors.length > 1 && (
                    <button className="a-btn a-btn--sm a-btn--danger" type="button" onClick={() => removeAt('authors', i)}>제거</button>
                  )}
                </div>
                <div className="a-row a-row--2">
                  <div className="a-field">
                    <label>이름</label>
                    <input type="text" value={a.name} onChange={e => editAt('authors', i, { name: e.target.value })} />
                  </div>
                  <div className="a-field">
                    <label>역할 (팀 작품만)</label>
                    <input type="text" placeholder="작화 / 기획" value={a.role ?? ''}
                      onChange={e => editAt('authors', i, { role: e.target.value })} />
                  </div>
                </div>
                <div className="a-row a-row--2">
                  <div className="a-field">
                    <label>연락수단</label>
                    <select value={a.contact_type ?? ''} onChange={e => editAt('authors', i, { contact_type: e.target.value })}>
                      {CONTACT_TYPES.map(t => <option key={t} value={t}>{t || '없음'}</option>)}
                    </select>
                  </div>
                  <div className="a-field">
                    <label>주소</label>
                    <input type="text" placeholder="https://instagram.com/아이디" value={a.contact_url ?? ''}
                      onChange={e => editAt('authors', i, { contact_url: e.target.value })} />
                  </div>
                </div>
              </div>
            ))}
            <p className="a-hint" style={{ color: 'var(--a-ink-3)', fontSize: '0.75rem' }}>
              팀 작품은 사람 수만큼 추가합니다. 이름은 참여자 명단과 똑같이 적어야 참여자 페이지에 작품이 연결됩니다.
              연락수단은 사이트에 공개되므로 전화번호는 넣지 않습니다.
            </p>
          </div>
        </div>

        <div>
          <div className="a-card">
            <p className="a-card__title">대표 이미지</p>
            <div className="a-slot">
              {work.cover_path && <AdminImage path={work.cover_path} className="a-slot__preview" />}
              <p className="a-slot__name">{work.cover_path ?? '아직 없습니다.'}</p>
              <div className="a-actions">
                <label className="a-btn a-btn--sm">
                  파일 선택
                  <input type="file" accept="image/*" hidden onChange={handleCover} />
                </label>
                <button className="a-btn a-btn--sm a-btn--danger" type="button" onClick={() => set({ cover_path: null })}>비우기</button>
              </div>
            </div>
          </div>

          <div className="a-card">
            <div className="a-sub__head" style={{ marginBottom: '0.9rem' }}>
              <p className="a-card__title" style={{ margin: 0 }}>상세 이미지 · 영상</p>
              <div className="a-actions">
                <label className="a-btn a-btn--sm">
                  이미지 추가
                  <input type="file" accept="image/*" multiple hidden onChange={handleMedia} />
                </label>
                <button className="a-btn a-btn--sm" type="button"
                  onClick={() => set({ media: [...work.media, { kind: 'video', video_url: '' }] })}>영상 추가</button>
              </div>
            </div>
            {!work.media.length && <p className="a-empty" style={{ padding: '1.25rem 0' }}>아직 없습니다.</p>}
            {work.media.map((m, i) => (
              <div className="a-sub" key={i}>
                <div className="a-sub__head">
                  <span className="a-sub__title">{m.kind === 'image' ? `이미지 ${i + 1}` : '영상'}</span>
                  <div className="a-actions">
                    <button className="a-btn a-btn--sm" type="button" disabled={i === 0} onClick={() => moveMedia(i, -1)}>↑</button>
                    <button className="a-btn a-btn--sm" type="button" disabled={i === work.media.length - 1} onClick={() => moveMedia(i, 1)}>↓</button>
                    <button className="a-btn a-btn--sm a-btn--danger" type="button" onClick={() => removeAt('media', i)}>제거</button>
                  </div>
                </div>
                {m.kind === 'image' ? (
                  <AdminImage path={m.path} className="a-slot__preview" style={{ maxWidth: 220 }} />
                ) : (
                  <div className="a-field">
                    <label>영상 주소</label>
                    <input type="text" placeholder="https://youtu.be/..." value={m.video_url ?? ''}
                      onChange={e => editAt('media', i, { video_url: e.target.value })} />
                  </div>
                )}
                <div className="a-field" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                  <label>설명 (선택)</label>
                  <input type="text" value={m.caption ?? ''} onChange={e => editAt('media', i, { caption: e.target.value })} />
                </div>
              </div>
            ))}
            <p className="a-hint" style={{ color: 'var(--a-ink-3)', fontSize: '0.75rem' }}>
              영상은 유튜브·비메오 주소를 넣습니다. 올린 이미지는 긴 변 2000px 로 줄여 저장됩니다.
            </p>
          </div>

          {isWebtoon && (
            <div className="a-card">
              <div className="a-sub__head" style={{ marginBottom: '0.9rem' }}>
                <p className="a-card__title" style={{ margin: 0 }}>웹툰 회차</p>
                <button className="a-btn a-btn--sm" type="button" onClick={addEpisode}>회차 추가</button>
              </div>
              {!work.episodes.length && <p className="a-empty" style={{ padding: '1.25rem 0' }}>회차가 없습니다.</p>}
              {work.episodes.map((ep, i) => (
                <div className="a-sub" key={ep.no}>
                  <div className="a-sub__head">
                    <span className="a-sub__title">{ep.no}화 · 원고 {ep.pages.length}장</span>
                    <div className="a-actions">
                      <label className="a-btn a-btn--sm">
                        원고 추가
                        <input type="file" accept="image/*" multiple hidden onChange={e => handlePages(i, e)} />
                      </label>
                      <button className="a-btn a-btn--sm a-btn--danger" type="button" onClick={() => removeEpisode(i)}>회차 삭제</button>
                    </div>
                  </div>
                  <div className="a-field">
                    <label>회차 제목</label>
                    <input type="text" value={ep.title ?? ''} onChange={e => editAt('episodes', i, { title: e.target.value })} />
                  </div>
                  <div className="a-thumbs">
                    {ep.pages.map((p, pi) => (
                      <div className="a-thumb" key={p}>
                        <AdminImage path={p} />
                        <button className="a-btn a-btn--sm a-btn--danger" type="button" onClick={() => removePage(i, pi)}>{pi + 1}쪽 제거</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
