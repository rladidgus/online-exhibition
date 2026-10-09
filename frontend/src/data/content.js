// 관리자가 DB 에 저장한 내용 — 빌드 직전 scripts/fetch-content.mjs 가 content.json 으로 내려받는다.
// 파일이 없으면(로컬 개발·미리보기) null 이고, works.js · parts.js · site.js 는 각자의 예시 데이터를 쓴다.
const files = import.meta.glob('./content.json', { eager: true, import: 'default' })

export const CONTENT = files['./content.json'] ?? null
