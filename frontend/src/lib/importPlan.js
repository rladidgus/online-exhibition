// 한꺼번에 올리기 — 학생 이름 폴더 + 기입표(CSV)를 읽어 '무엇을 어떻게 올릴지' 계획표를 만든다.
// 브라우저 기능을 쓰지 않는 순수 함수라 node 에서도 같은 결과로 시험할 수 있다.
//
// 폴더 규칙 (준비위 안내문과 같음)
//   <이름 또는 이름_학번끝4>/썸네일.jpg            대표 그림 1장 (파일 이름에 '썸네일')
//   <이름>/01.jpg 02.jpg …                       작품 그림, 이름 앞 번호 순서 (최대 MAX_IMAGES)
//   <이름>/1화/01.jpg 02.jpg …                    웹툰 원고, 화 폴더마다 (최대 MAX_PAGES 장)
// 기입표는 파트별 CSV. 칸 이름은 아래 COLUMNS 의 별칭 중 하나면 된다.

export const MAX_IMAGES = 8
export const MAX_PAGES = 30
export const MAX_EPISODES = 3
export const MAX_EPISODE_HEIGHT = 30000

const PREFIX = { startup: 'S', webtoon: 'W', video: 'V', game: 'G' }
const PART_WORDS = [
  ['webtoon', ['webtoon', '웹툰']],
  ['video', ['video', '영상']],
  ['startup', ['startup', '창업']],
  ['game', ['game', '게임']],
]
const IMAGE_RE = /\.(jpe?g|png|gif|webp)$/i
const THUMB_RE = /썸네일|thumbnail|thumb/i
const EPISODE_RE = /^(?:ep\s*0*(\d+)|0*(\d+)\s*화)$/i

const COLUMNS = {
  submission: ['제출번호'],
  part: ['파트'],
  name: ['이름', '작가명', '작가', '성명'],
  studentId: ['학번(동명이인만)', '학번'],
  title: ['작품명', '작품 이름', '제목'],
  members: ['팀원', '팀원 이름', '팀원이름'],
  role: ['역할'],
  genres: ['장르'],
  synopsis: ['시놉시스', '기획의도', '작품 소개', '작품소개', '소개'],
  world: ['세계관'],
  contactType: ['연락수단종류', '연락수단 종류', 'sns 종류', 'sns종류'],
  contactUrl: ['연락수단주소', '연락수단 주소', 'sns 주소', 'sns주소', 'sns', '연락수단'],
  video: ['영상링크', '영상 링크', '유튜브', '유튜브 링크', '유튜브링크'],
  ep1: ['1화제목', '1화 제목'],
  ep2: ['2화제목', '2화 제목'],
  ep3: ['3화제목', '3화 제목'],
}

// ---- 작은 도구 ----

const clean = s => (s ?? '').replace(/^\uFEFF/, '').trim()
const squash = s => clean(s).replace(/\s+/g, '').toLowerCase()
const byNumber = (a, b) => a.localeCompare(b, 'ko', { numeric: true })
const pad = (n, len) => String(n).padStart(len, '0')
const splitList = s => clean(s).split(/[,·/、\n]+/).map(clean).filter(Boolean)

export function partFromText(text) {
  const t = squash(text)
  for (const [slug, words] of PART_WORDS) if (words.some(w => t.includes(w))) return slug
  return null
}

const partFromSubmission = no => {
  const c = clean(no).charAt(0).toUpperCase()
  return Object.keys(PREFIX).find(k => PREFIX[k] === c) ?? null
}

// 연락수단 종류를 사이트가 쓰는 값으로 (instagram / x / email / behance)
function contactOf(typeText, urlText) {
  const url = clean(urlText)
  if (!url) return { contact_type: null, contact_url: null }
  const t = squash(typeText)
  const u = url.toLowerCase()
  let type = null
  if (t.includes('insta') || t.includes('인스타') || u.includes('instagram.com')) type = 'instagram'
  else if (t === 'x' || t.includes('트위터') || t.includes('twitter') || /(^|\/\/)(www\.)?(x|twitter)\.com/.test(u)) type = 'x'
  else if (t.includes('behance') || t.includes('비핸스') || u.includes('behance.net')) type = 'behance'
  else if (t.includes('mail') || t.includes('메일') || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(url)) type = 'email'
  if (type === 'email' && !u.startsWith('mailto:')) return { contact_type: type, contact_url: `mailto:${url}` }
  if (type !== 'email' && !/^https?:\/\//i.test(url)) return { contact_type: type, contact_url: `https://${url}` }
  return { contact_type: type, contact_url: url }
}

// 이름 + 학번(전체 또는 끝 4자리) → 폴더 이름과 비교할 열쇠 2개
function keysOf(name, studentId) {
  const n = squash(name)
  const sid = clean(studentId).replace(/\D/g, '').slice(-4)
  return { plain: n, withId: sid ? `${n}_${sid}` : null }
}

// ---- CSV ----

export function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  const s = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (quoted) {
      if (ch === '"' && s[i + 1] === '"') { cell += '"'; i++ }
      else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++
      row.push(cell); rows.push(row); row = []; cell = ''
    } else cell += ch
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows.filter(r => r.some(c => clean(c)))
}

function columnIndex(header) {
  const idx = {}
  const h = header.map(squash)
  for (const [key, aliases] of Object.entries(COLUMNS)) {
    const i = h.findIndex(col => aliases.some(a => squash(a) === col))
    if (i >= 0) idx[key] = i
  }
  return idx
}

// 기입표 → 작품 목록. 제출번호가 있으면 같은 번호끼리 한 작품(팀), 없으면 한 줄 = 한 작품.
export function worksFromSheets(sheets) {
  const works = []
  const warnings = []
  for (const { name: fileName, text } of sheets) {
    const rows = parseCsv(text)
    if (!rows.length) continue
    const col = columnIndex(rows[0])
    if (col.name === undefined) {
      warnings.push(`${fileName}: '이름' 칸을 찾지 못해 건너뜀 (첫 줄 칸 이름 확인)`)
      continue
    }
    const filePart = partFromText(fileName)
    const bySubmission = new Map()
    rows.slice(1).forEach((r, i) => {
      const get = key => (col[key] === undefined ? '' : clean(r[col[key]]))
      const title = get('title')
      if (!get('name') || title.startsWith('예시')) return
      const part = partFromText(get('part')) ?? filePart ?? partFromSubmission(get('submission'))
      if (!part) {
        warnings.push(`${fileName} ${i + 2}번째 줄 (${get('name')}): 파트를 알 수 없어 건너뜀`)
        return
      }
      // 역할 칸은 대표부터 팀원 순서대로 쉼표로 (예: 기획, 작화, 배경) — '글·그림' 처럼 한 사람 역할 안의 · / 는 나누지 않는다
      const roles = clean(get('role')).split(/[,、\n]+/).map(clean).filter(Boolean)
      const person = {
        name: get('name'),
        studentId: get('studentId'),
        role: roles[0] ?? null,
        ...contactOf(get('contactType'), get('contactUrl')),
      }
      const submission = get('submission')
      const existing = submission && bySubmission.get(submission.toLowerCase())
      if (existing) {
        existing.authors.push(person)
        return
      }
      const members = splitList(get('members')).filter(m => squash(m) !== squash(person.name))
      const work = {
        part_slug: part,
        submission: /^[a-z]\d{2,3}$/i.test(submission) ? submission.toLowerCase() : null,
        title,
        genres: splitList(get('genres')),
        synopsis: get('synopsis') || null,
        world_setting: part === 'startup' || part === 'game' ? get('world') || null : null,
        video_url: get('video') || null,
        episodeTitles: [get('ep1'), get('ep2'), get('ep3')],
        authors: [person, ...members.map((m, k) => ({ name: m, studentId: '', role: roles[k + 1] ?? null, contact_type: null, contact_url: null }))],
        source: `${fileName} ${i + 2}번째 줄`,
      }
      works.push(work)
      if (submission) bySubmission.set(submission.toLowerCase(), work)
    })
  }
  return { works, warnings }
}

// ---- 폴더 ----

// 파일 목록(경로 + 파일) → 학생 폴더별 { thumb, images[], episodes[{no, pages[]}] }
// path 예: '졸업전시자료/웹툰 파트/이영희/1화/01.jpg' — 화 폴더면 그 위가 학생 폴더, 아니면 바로 위가 학생 폴더
export function foldersFromFiles(files) {
  const folders = new Map()
  const ignored = []
  for (const f of files) {
    const parts = f.path.split(/[\\/]/).filter(Boolean)
    const fileName = parts.at(-1)
    if (!IMAGE_RE.test(fileName)) {
      if (!/^(\.|thumbs\.db|desktop\.ini)/i.test(fileName) && !/\.txt$/i.test(fileName)) ignored.push(f.path)
      continue
    }
    const parent = parts.at(-2) ?? ''
    const ep = parent.match(EPISODE_RE)
    const personIdx = ep ? parts.length - 3 : parts.length - 2
    if (personIdx < 0) { ignored.push(f.path); continue }
    const person = parts[personIdx]
    const key = parts.slice(0, personIdx + 1).join('/')
    if (!folders.has(key)) {
      folders.set(key, {
        key,
        name: person,
        partHint: partFromText(parts.slice(0, personIdx).join('/')),
        thumbs: [],
        images: [],
        episodes: new Map(),
      })
    }
    const folder = folders.get(key)
    const item = { name: fileName, path: f.path, file: f.file }
    if (ep) {
      const no = Number(ep[1] ?? ep[2])
      if (!folder.episodes.has(no)) folder.episodes.set(no, [])
      folder.episodes.get(no).push(item)
    } else if (THUMB_RE.test(fileName)) folder.thumbs.push(item)
    else folder.images.push(item)
  }
  for (const folder of folders.values()) {
    folder.images.sort((a, b) => byNumber(a.name, b.name))
    folder.episodes = [...folder.episodes.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([no, pages]) => ({ no, pages: pages.sort((a, b) => byNumber(a.name, b.name)) }))
  }
  return { folders: [...folders.values()], ignored }
}

// ---- 계획표 ----

// existing = DB 에 이미 있는 작품 [{slug, part_slug, authors:[{name}]}] — 다시 올려도 겹치지 않게
export function buildPlan({ sheets, files, existing = [] }) {
  const { works, warnings } = worksFromSheets(sheets)
  const { folders, ignored } = foldersFromFiles(files)
  const problems = [...warnings]
  const usedFolders = new Set()

  // 폴더 이름 → 폴더 (이름만 / 이름_학번4 둘 다)
  const folderByKey = new Map(folders.map(f => [squash(f.name), f]))

  const existingKeys = new Set(existing.map(w => `${w.part_slug}:${squash(w.authors[0]?.name)}`))
  const existingSlugs = new Set(existing.map(w => w.slug))
  const nextNo = {}
  for (const prefix of Object.values(PREFIX)) {
    const nums = existing.map(w => w.slug).filter(s => s?.toUpperCase().startsWith(prefix))
      .map(s => Number(s.slice(1))).filter(Number.isFinite)
    nextNo[prefix] = (nums.length ? Math.max(...nums) : 0) + 1
  }

  // 같은 이름이 여러 명이면 이름만으로는 폴더를 고를 수 없다
  const nameCount = new Map()
  for (const w of works) for (const a of w.authors) nameCount.set(squash(a.name), (nameCount.get(squash(a.name)) ?? 0) + 1)

  const items = works
    .slice()
    .sort((a, b) => a.part_slug.localeCompare(b.part_slug) || a.authors[0].name.localeCompare(b.authors[0].name, 'ko'))
    .map(w => {
      const issues = []
      // 이름_학번4 폴더가 먼저, 없으면 이름만 같은 폴더 (학번이 적힌 동명이인은 이름만으로는 잡지 않는다)
      let folder = null
      for (const a of w.authors) {
        const k = keysOf(a.name, a.studentId)
        folder = (k.withId && folderByKey.get(k.withId))
          || ((nameCount.get(k.plain) === 1 || !k.withId) ? folderByKey.get(k.plain) : null)
          || null
        if (folder) break
      }
      if (!folder) issues.push('폴더 없음 (폴더 이름이 기입표 이름과 같은지, 동명이인은 이름_학번끝4자리인지 확인)')
      else if (usedFolders.has(folder.key)) {
        issues.push(`'${folder.name}' 폴더가 다른 작품에도 잡힘 — 동명이인이면 폴더 이름에 학번 끝 4자리를 붙여 주세요`)
        folder = null
      } else usedFolders.add(folder.key)

      const thumb = folder?.thumbs[0] ?? null
      if (folder && !folder.thumbs.length) issues.push("'썸네일' 그림 없음")
      if (folder && folder.thumbs.length > 1) issues.push(`'썸네일' 그림이 ${folder.thumbs.length}장 — 첫 번째만 씀`)

      const isWebtoon = w.part_slug === 'webtoon'
      let images = folder ? folder.images : []
      if (isWebtoon && images.length) issues.push(`웹툰인데 화 폴더 밖 그림 ${images.length}장 — 올리지 않음`)
      if (isWebtoon) images = []
      if (images.length > MAX_IMAGES) {
        issues.push(`작품 그림 ${images.length}장 — 앞 ${MAX_IMAGES}장만 올림`)
        images = images.slice(0, MAX_IMAGES)
      }

      let episodes = isWebtoon && folder ? folder.episodes : []
      if (!isWebtoon && folder?.episodes.length) issues.push('웹툰이 아닌데 화 폴더가 있음 — 올리지 않음')
      if (episodes.length > MAX_EPISODES) {
        issues.push(`${episodes.length}화 — 앞 ${MAX_EPISODES}화만 올림`)
        episodes = episodes.slice(0, MAX_EPISODES)
      }
      episodes = episodes.map(ep => {
        if (ep.pages.length > MAX_PAGES) issues.push(`${ep.no}화 ${ep.pages.length}장 — 앞 ${MAX_PAGES}장만 올림`)
        return { no: ep.no, title: w.episodeTitles[ep.no - 1] || null, pages: ep.pages.slice(0, MAX_PAGES) }
      })
      if (isWebtoon && folder && !episodes.length) issues.push('웹툰 원고(화 폴더) 없음')
      if (folder?.partHint && folder.partHint !== w.part_slug) issues.push('폴더가 다른 파트 묶음 안에 있음 — 기입표 파트로 올림')

      // 올릴 작품에만 제출번호를 매긴다 (기입표에 있으면 그것, 없으면 파트 글자 + 다음 번호)
      const prefix = PREFIX[w.part_slug]
      const skip = existingKeys.has(`${w.part_slug}:${squash(w.authors[0].name)}`) || Boolean(w.submission && existingSlugs.has(w.submission))
      const blocking = !folder || !thumb
      const slug = skip || blocking ? null : (w.submission ?? `${prefix.toLowerCase()}${pad(nextNo[prefix]++, 2)}`)

      return { ...w, slug, skip, blocking, folder: folder?.name ?? null, thumb, images, episodes, issues }
    })

  const unusedFolders = folders.filter(f => !usedFolders.has(f.key)).map(f => f.name)
  return { items, problems, unusedFolders, ignored }
}
