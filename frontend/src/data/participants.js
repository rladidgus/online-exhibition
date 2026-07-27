// 2026-1 캡스톤 수강자 명단 기준 졸업전시 참여자
// ※ 명단 데이터는 Vercel 환경변수(VITE_PARTICIPANTS_DATA) 또는 .env.local에서 관리됩니다.

export const PARTS = [
  { slug: 'startup', label: '창업', en: 'Startup' },
  { slug: 'webtoon', label: '웹툰', en: 'Webtoon' },
  { slug: 'video', label: '영상', en: 'Video' },
  { slug: 'game', label: '게임', en: 'Game' },
]

function getInitialParticipants() {
  try {
    const envData = import.meta.env.VITE_PARTICIPANTS_DATA
    if (envData) {
      const parsed = typeof envData === 'string' ? JSON.parse(envData) : envData
      return parsed.PARTICIPANTS || parsed
    }
  } catch (err) {
    console.error('VITE_PARTICIPANTS_DATA parsing error:', err)
  }
  return {
    startup: [],
    webtoon: [],
    video: [],
    game: [],
  }
}

export const PARTICIPANTS = getInitialParticipants()

export const ALL_PARTICIPANTS = PARTS.flatMap(part => PARTICIPANTS[part.slug] || [])

export function findParticipant(id) {
  return ALL_PARTICIPANTS.find(p => p.id === id)
}

export function getPart(slug) {
  return PARTS.find(p => p.slug === slug)
}
