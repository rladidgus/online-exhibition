// 빌드 전 콘텐츠 동기화 — 관리자가 Supabase 에 저장한 내용을 src/data/content.json 과 public/content/ 이미지로 내린다.
// 이 단계 덕분에 공개 사이트는 런타임에 DB 를 읽지 않는다(방명록만 예외).
// Supabase 무료 프로젝트가 1주 미사용으로 잠들어도 이미 배포된 사이트는 그대로 산다.
//
// 환경변수 (빌드 환경 전용 — VITE_ 가 아니라서 브라우저 번들에 실리지 않는다)
//   SUPABASE_SERVICE_ROLE_KEY  필수. 없으면 content.json 을 지우고 data/*.js 의 예시 데이터로 빌드한다.
//   SUPABASE_URL               없으면 VITE_SUPABASE_URL 을 쓴다.
import { createClient } from '@supabase/supabase-js'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contentJson = join(root, 'src', 'data', 'content.json')
const imageDir = join(root, 'public', 'content')

try {
  process.loadEnvFile(join(root, '.env'))
} catch {
  // .env 가 없는 빌드 환경(Cloudflare)은 환경변수를 직접 받는다
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

// 지난 빌드 결과가 남아 섞이지 않게 매번 비우고 시작한다
await rm(contentJson, { force: true })
await rm(imageDir, { recursive: true, force: true })

if (!url || !key) {
  console.log('[content] SUPABASE_SERVICE_ROLE_KEY 없음 — data/*.js 예시 데이터로 빌드합니다.')
  process.exit(0)
}

const db = createClient(url, key, { auth: { persistSession: false } })

function must(label, { data, error }) {
  if (error) {
    console.error(`[content] ${label} 실패: ${error.message}`)
    process.exit(1)
  }
  return data
}

const settings = must('사이트 설정 조회', await db.from('site_settings').select('*').eq('id', 1).maybeSingle()) ?? {}
const partRows = must('파트 조회', await db.from('parts').select('*').order('sort_order'))
const genreRows = must('장르 조회', await db.from('part_genres').select('*').order('sort_order'))
const workRows = must('작품 조회', await db.from('works').select(`
  part_slug, slug, title, genres, synopsis, world_setting, cover_path, sort_order,
  work_authors ( name, role, contact_type, contact_url, sort_order ),
  work_media ( kind, path, video_url, caption, sort_order ),
  episodes ( no, title, thumb_path, episode_pages ( path, sort_order ) )
`).eq('is_published', true))

// ---- works.js · parts.js · site.js 와 같은 모양으로 변환 ----
const bySort = (a, b) => a.sort_order - b.sort_order

const works = workRows.map(w => ({
  slug: w.slug,
  part_slug: w.part_slug,
  title: w.title,
  genres: w.genres ?? [],
  synopsis: w.synopsis ?? '',
  world_setting: w.world_setting,
  cover_path: w.cover_path,
  sort_order: w.sort_order,
  authors: w.work_authors.sort(bySort)
    .map(({ name, role, contact_type, contact_url }) => ({ name, role, contact_type, contact_url })),
  media: w.work_media.sort(bySort)
    .map(({ kind, path, video_url, caption }) => ({ kind, path, video_url, caption })),
  episodes: w.episodes.sort((a, b) => a.no - b.no).map(e => ({
    no: e.no,
    title: e.title,
    thumb_path: e.thumb_path,
    pages: e.episode_pages.sort(bySort).map(p => p.path),
  })),
}))

const parts = partRows.map(p => ({
  slug: p.slug,
  label: p.label,
  en: p.en,
  genres: genreRows.filter(g => g.part_slug === p.slug).map(g => g.name),
}))

// deploy_hook_url 은 공개 자산에 절대 싣지 않는다. 빈 칸은 '' 로 (화면 코드가 문자열을 기대한다)
const SITE_KEYS = [
  'exhibition_title', 'department_name', 'major_label', 'slogan', 'cover_path',
  'intro_title', 'intro_body', 'exhibit_start', 'exhibit_end',
  'venue_name', 'venue_address', 'venue_map_url', 'venue_directions',
  'opening_video_url', 'sns_instagram', 'sns_x',
]
const site = Object.fromEntries(SITE_KEYS.map(k => [k, settings[k] ?? '']))

// ---- 이미지 내려받기 ----
// 보관함 경로(works/W01/main.jpg)만 받는다. '/' 나 http 로 시작하면 이미 공개된 주소라 그대로 둔다.
const isStored = p => p && !p.startsWith('/') && !p.startsWith('http')
const paths = new Set()
const collect = p => { if (isStored(p)) paths.add(p) }
for (const w of works) {
  collect(w.cover_path)
  w.media.forEach(m => collect(m.path))
  w.episodes.forEach(e => { collect(e.thumb_path); e.pages.forEach(collect) })
}
collect(site.cover_path)

// 무료 보관함은 한 달 내보내기 양(egress)이 정해져 있어서, 이미 배포된 사이트에 있는 그림은 거기서 받는다.
// 올릴 때 파일 이름 끝에 시각을 붙이므로(관리자 화면) 같은 경로 = 같은 그림이다.
const LIVE_ORIGIN = process.env.CONTENT_LIVE_ORIGIN || 'https://bu-dia-grad2026.pages.dev'

async function fromLiveSite(path) {
  try {
    const res = await fetch(`${LIVE_ORIGIN}/content/${path.split('/').map(encodeURIComponent).join('/')}`)
    // 없는 경로는 사이트 기본 페이지(HTML)가 200 으로 오므로 그림인지 꼭 확인한다
    if (!res.ok || !res.headers.get('content-type')?.startsWith('image/')) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

let failed = 0
let fromStorage = 0
for (const path of paths) {
  let bytes = await fromLiveSite(path)
  if (!bytes) {
    const { data, error } = await db.storage.from('works').download(path)
    if (error || !data) {
      console.warn(`[content] 이미지 없음: ${path} (${error?.message ?? '빈 응답'})`)
      failed += 1
      continue
    }
    bytes = Buffer.from(await data.arrayBuffer())
    fromStorage += 1
  }
  const abs = join(imageDir, path)
  await mkdir(dirname(abs), { recursive: true })
  await writeFile(abs, bytes)
}

const publicPath = p => (isStored(p) ? `/content/${p}` : p)
for (const w of works) {
  w.cover_path = publicPath(w.cover_path)
  w.media.forEach(m => { m.path = publicPath(m.path) })
  w.episodes.forEach(e => {
    e.thumb_path = publicPath(e.thumb_path)
    e.pages = e.pages.map(publicPath)
  })
}
site.cover_path = publicPath(site.cover_path)

await writeFile(contentJson, JSON.stringify({ site, parts, works }, null, 2) + '\n', 'utf8')

console.log(`[content] 공개 작품 ${works.length} · 이미지 ${paths.size - failed}장 (보관함에서 새로 받음 ${fromStorage}장)` + (failed ? ` (실패 ${failed}건)` : ''))
