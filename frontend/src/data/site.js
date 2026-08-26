// 사이트 전역 설정 — 메인 페이지 5요소 (포스터 · 기획의도 · 전시기간/오시는 길 · 오프닝 영상 · SNS)
// 필드명은 DB site_settings 컬럼과 동일. 지금은 더미([ ] 표시는 준비위 제출분으로 채울 자리), 이후 관리자에서 수정.

export const SITE = {
  exhibition_title: '2026 졸업전시',
  department_name: '백석대학교 영상애니메이션과',
  slogan: '우리의 작품을\n세상에 선보입니다',

  // 포스터 (더미 — picsum)
  poster_path: 'https://picsum.photos/seed/poster-2026/800/1131',

  // 기획의도
  intro_title: '우리는 각자의 방식으로 세계를 만들었다',
  intro_body:
    '4년의 시간이 아흔 개의 세계로 흩어졌습니다. 어떤 세계는 종이 위에 그려졌고, 어떤 세계는 화면 안에서 움직이며, 어떤 세계는 아직 이름을 붙이는 중입니다.\n\n' +
    '이 전시는 그 세계들을 한자리에 모아 처음으로 바깥에 내놓는 자리입니다. 완성된 결말이 아니라, 여기서부터 시작하겠다는 선언에 가깝습니다.',

  // 전시기간 · 오시는 길
  exhibit_start: '2026-11-09',
  exhibit_end: '2026-11-14',
  venue_name: '[전시장명]',
  venue_address: '[전시장 주소]',
  venue_map_url: 'https://map.naver.com/',
  venue_directions: '[교통편 안내 — 예: 지하철 O호선 OO역 O번 출구 도보 5분. 별도 주차 공간이 없어 대중교통 이용을 권합니다.]',

  // 오프닝 영상 (유튜브/비메오 URL, 없으면 빈 문자열 → 섹션 숨김)
  opening_video_url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',

  // SNS (없으면 빈 문자열 → 링크 숨김)
  sns_instagram: 'https://instagram.com/',
  sns_x: '',
}

// '2026-11-09', '2026-11-14' → '2026.11.09 – 11.14'
export function formatPeriod(start, end) {
  const [sy, sm, sd] = start.split('-')
  const [ey, em, ed] = end.split('-')
  const tail = sy === ey ? `${em}.${ed}` : `${ey}.${em}.${ed}`
  return `${sy}.${sm}.${sd} – ${tail}`
}
