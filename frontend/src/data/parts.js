// 파트(4종 고정) + 파트별 장르 어휘
// 장르는 파트마다 어휘가 다르다(웹툰=학원/판타지… 영상=2D/3D…) → 파트와 별개 축으로 관리.
// 어휘는 준비위 확정 전 임시값(클라 문의 원문 예시 그대로). 배열 순서 = 화면 노출 순서.

export const PARTS = [
  { slug: 'startup', label: '창업', en: 'Startup', genres: ['브랜드', '일러스트', '2D애니', '출판만화'] },
  { slug: 'webtoon', label: '웹툰', en: 'Webtoon', genres: ['학원', '판타지', '액션'] },
  { slug: 'video', label: '영상', en: 'Video', genres: ['2D', '3D'] },
  { slug: 'game', label: '게임', en: 'Game', genres: ['캐릭터', '배경', '모델링'] },
]

export function getPart(slug) {
  return PARTS.find(p => p.slug === slug)
}
