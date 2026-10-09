import { supabase } from './supabase'
import { resizeImage, extFor } from './image'

// 관리자 화면이 쓰는 DB 창구. 쓰기 권한은 DB 정책(supabase/migrations/0002·0003)이 admins 명단으로 지킨다.
// 작품 객체 모양은 src/data/works.js 와 같다(snake_case) + id · is_published.

const BUCKET = 'works'

function fail(context, error) {
  if (error) throw new Error(`${context}: ${error.message}`)
}

// ---- 로그인 ----

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.')
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function currentEmail() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user.email ?? null
}

// 로그인한 계정이 admins 명단에 있는지 확인.
// 로그인 여부만으로 관리자라고 보면 안 된다(계정이 명단에 없을 수 있다).
export async function isAdmin() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false

  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (error) return false
  return Boolean(data)
}

export async function changePassword(password) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(`비밀번호를 바꾸지 못했습니다: ${error.message}`)
}

// ---- 사이트 설정 ----

export async function getSettings() {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
  fail('설정을 불러오지 못했습니다', error)
  return data ?? { id: 1 }
}

export async function saveSettings(next) {
  const { error } = await supabase.from('site_settings').upsert({
    ...next,
    id: 1,
    exhibit_start: next.exhibit_start || null,
    exhibit_end: next.exhibit_end || null,
    updated_at: undefined,
  })
  fail('설정을 저장하지 못했습니다', error)
}

// ---- 파트 ----

export async function listParts() {
  const [{ data: parts, error }, { data: genres, error: genreError }] = await Promise.all([
    supabase.from('parts').select('*').order('sort_order'),
    supabase.from('part_genres').select('*').order('sort_order'),
  ])
  fail('파트를 불러오지 못했습니다', error || genreError)
  return parts.map(p => ({
    slug: p.slug,
    label: p.label,
    en: p.en,
    genres: genres.filter(g => g.part_slug === p.slug).map(g => g.name),
  }))
}

// ---- 작품 ----

const SELECT_WORK = `
  id, part_slug, slug, title, genres, synopsis, world_setting, cover_path, sort_order, is_published,
  work_authors ( name, role, contact_type, contact_url, sort_order ),
  work_media ( kind, path, video_url, caption, sort_order ),
  episodes ( no, title, thumb_path, episode_pages ( path, sort_order ) )
`

const bySort = (a, b) => a.sort_order - b.sort_order

// DB 행 → works.js 와 같은 모양
export function rowToWork(r) {
  return {
    id: r.id,
    part_slug: r.part_slug,
    slug: r.slug,
    title: r.title,
    genres: r.genres ?? [],
    synopsis: r.synopsis,
    world_setting: r.world_setting,
    cover_path: r.cover_path,
    sort_order: r.sort_order,
    is_published: r.is_published,
    authors: [...r.work_authors].sort(bySort)
      .map(({ name, role, contact_type, contact_url }) => ({ name, role, contact_type, contact_url })),
    media: [...r.work_media].sort(bySort)
      .map(({ kind, path, video_url, caption }) => ({ kind, path, video_url, caption })),
    episodes: [...r.episodes].sort((a, b) => a.no - b.no).map(e => ({
      no: e.no,
      title: e.title,
      thumb_path: e.thumb_path,
      pages: [...e.episode_pages].sort(bySort).map(p => p.path),
    })),
  }
}

export async function listWorks() {
  const { data, error } = await supabase.from('works').select(SELECT_WORK)
  fail('작품 목록을 불러오지 못했습니다', error)
  return data.map(rowToWork).sort((a, b) =>
    a.part_slug === b.part_slug ? a.sort_order - b.sort_order : a.part_slug.localeCompare(b.part_slug))
}

export async function getWork(id) {
  const { data, error } = await supabase.from('works').select(SELECT_WORK).eq('id', id).maybeSingle()
  fail('작품을 불러오지 못했습니다', error)
  return data ? rowToWork(data) : null
}

function workRow(w) {
  return {
    part_slug: w.part_slug,
    slug: w.slug,
    title: w.title,
    genres: w.genres,
    synopsis: w.synopsis || null,
    world_setting: w.world_setting || null,
    cover_path: w.cover_path || null,
    sort_order: w.sort_order,
    is_published: w.is_published,
  }
}

function duplicateCheck(error, slug) {
  if (error?.message.includes('duplicate')) throw new Error(`제출번호 ${slug.toUpperCase()} 가 이미 있습니다.`)
}

export async function createWork(w) {
  const { data, error } = await supabase.from('works').insert(workRow(w)).select('id').single()
  duplicateCheck(error, w.slug)
  fail('작품을 추가하지 못했습니다', error)
  await saveChildren(data.id, w)
  return data.id
}

export async function updateWork(id, w) {
  const { error } = await supabase.from('works').update(workRow(w)).eq('id', id)
  duplicateCheck(error, w.slug)
  fail('작품을 저장하지 못했습니다', error)
  await saveChildren(id, w)
}

// 공개 토글처럼 작품 행만 바꿀 때 (작가·미디어는 그대로)
// 작품 하나 또는 여러 개(ids 배열)를 한 번에 공개/비공개. 실제로 바뀐 개수를 확인한다.
export async function setPublished(ids, isPublished) {
  const list = [].concat(ids)
  const { data, error } = await supabase.from('works').update({ is_published: isPublished }).in('id', list).select('id')
  fail('공개 상태를 바꾸지 못했습니다', error)
  if ((data?.length ?? 0) !== list.length) throw new Error(`${list.length}개 중 ${data?.length ?? 0}개만 바뀌었습니다. 새로고침 후 확인해 주세요.`)
}

// 작품 행과 함께 그 작품이 쓰던 이미지도 보관함에서 지운다 (무료 1GB 를 아끼려고)
// ponytail: 편집 중 교체·제거한 이미지는 남는다. 용량이 빠듯해지면 보관함 전체와 DB 경로를 대조해 정리.
export async function deleteWork(work) {
  const paths = [
    work.cover_path,
    ...work.media.map(m => m.path),
    ...work.episodes.flatMap(e => e.pages),
  ].filter(p => p && !p.startsWith('/') && !p.startsWith('http'))
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths)

  const { error } = await supabase.from('works').delete().eq('id', work.id)
  fail('작품을 삭제하지 못했습니다', error)
}

// 작가·미디어·회차는 통째로 지우고 다시 넣는다. 90작품 규모에서는 부분 갱신보다 단순하고 순서 관리가 쉽다.
// ponytail: 단일 편집자 전제 — 같은 작품을 두 사람이 동시에 저장하면 나중 저장이 이긴다. 실제로 겹치면 낙관적 잠금 도입.
async function saveChildren(workId, w) {
  const { error: clearError } = await supabase.from('work_authors').delete().eq('work_id', workId)
  fail('작가 정보를 저장하지 못했습니다', clearError)
  if (w.authors.length) {
    const { error } = await supabase.from('work_authors').insert(w.authors.map((a, i) => ({
      work_id: workId, name: a.name, role: a.role || null,
      contact_type: a.contact_type || null, contact_url: a.contact_url || null, sort_order: i,
    })))
    fail('작가 정보를 저장하지 못했습니다', error)
  }

  const { error: mediaClearError } = await supabase.from('work_media').delete().eq('work_id', workId)
  fail('이미지·영상을 저장하지 못했습니다', mediaClearError)
  if (w.media.length) {
    const { error } = await supabase.from('work_media').insert(w.media.map((m, i) => ({
      work_id: workId, kind: m.kind, path: m.path || null,
      video_url: m.video_url || null, caption: m.caption || null, sort_order: i,
    })))
    fail('이미지·영상을 저장하지 못했습니다', error)
  }

  const { error: episodeClearError } = await supabase.from('episodes').delete().eq('work_id', workId)
  fail('회차를 저장하지 못했습니다', episodeClearError)
  for (const ep of w.episodes) {
    const { data, error } = await supabase.from('episodes')
      .insert({ work_id: workId, no: ep.no, title: ep.title || null, thumb_path: ep.pages[0] ?? null })
      .select('id').single()
    fail('회차를 저장하지 못했습니다', error)
    if (ep.pages.length) {
      const { error: pageError } = await supabase.from('episode_pages')
        .insert(ep.pages.map((path, i) => ({ episode_id: data.id, path, sort_order: i })))
      fail('회차 원고를 저장하지 못했습니다', pageError)
    }
  }
}

// ---- 이미지 ----

// 줄여서 올리고 저장 경로를 돌려준다. base = 'works/W01/main' 처럼 확장자 뺀 경로
// resize = resizeImage 옵션 (웹툰 원고는 { maxWidth: WEBTOON_WIDTH })
export const WEBTOON_WIDTH = 1000

export async function uploadImage(file, base, resize) {
  const { blob, type } = await resizeImage(file, resize)
  const path = `${base}.${extFor(type)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: type, upsert: true })
  fail('이미지를 올리지 못했습니다', error)
  return path
}

// 미리보기 주소. 보관함이 비공개라 1시간짜리 서명 주소를 받는다.
// '/' 나 http 로 시작하면 이미 공개된 주소(사이트 기본 그림·예시 데이터)라 그대로 쓴다.
export async function imageUrl(path) {
  if (!path) return ''
  if (path.startsWith('/') || path.startsWith('http')) return path
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60)
  return data?.signedUrl ?? ''
}

// ---- 방명록 ----

// 방명록(guestbook)과 작품 댓글(work_comments)은 같은 승인 규칙이라 표 이름만 바꿔 쓴다
export const FEEDBACK_TABLES = { guestbook: 'guestbook', comments: 'work_comments' }

export async function listGuestbook(table = 'guestbook') {
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
  fail('글 목록을 불러오지 못했습니다', error)
  return data
}

export async function setGuestbookStatus(id, status, table = 'guestbook') {
  // 권한이 없으면 DB 는 오류 없이 0줄만 바꾸므로, 바뀐 줄을 돌려받아 확인한다
  const { data, error } = await supabase.from(table).update({
    status,
    approved_at: status === 'approved' ? new Date().toISOString() : null,
  }).eq('id', id).select('id')
  fail('상태를 바꾸지 못했습니다', error)
  if (!data?.length) throw new Error('상태가 바뀌지 않았습니다. 새로고침 후 다시 시도해 주세요.')
}

export async function deleteGuestbookEntry(id, table = 'guestbook') {
  const { data, error } = await supabase.from(table).delete().eq('id', id).select('id')
  fail('삭제하지 못했습니다', error)
  if (!data?.length) throw new Error('삭제되지 않았습니다. 새로고침 후 다시 시도해 주세요.')
}

// ---- 사이트에 반영 ----

// Cloudflare 배포 훅 호출. 훅 주소는 관리자만 읽는 site_settings 에 둔다.
// ponytail: 훅 응답은 브라우저 CORS 로 읽을 수 없어 no-cors 로 보내고 성공 여부는 Cloudflare 배포 목록에서 확인.
//           결과 확인이 필요해지면 서버 함수(Pages Functions)로 옮긴다.
export async function triggerDeploy() {
  const { deploy_hook_url } = await getSettings()
  if (!deploy_hook_url) throw new Error('배포 훅 주소가 비어 있습니다. 사이트 설정에서 입력해 주세요.')
  await fetch(deploy_hook_url, { method: 'POST', mode: 'no-cors' })
  return '반영을 요청했습니다. 1~2분 뒤 사이트가 갱신됩니다.'
}
