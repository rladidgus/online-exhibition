// 작품 데이터 — 운영 빌드는 관리자가 DB 에 넣은 공개 작품(content.json), 그 밖에는 아래 더미
// 필드명은 DB 컬럼과 같은 snake_case. slug = 제출번호 소문자, world_setting은 창업·게임만, episodes는 웹툰만.
import { CONTENT } from './content'

// 더미 이미지 — picsum seed 라 slug 별로 고정
const cover = (slug) => `https://picsum.photos/seed/${slug}/800/600`
const image = (slug, i, caption) => ({ kind: 'image', path: `https://picsum.photos/seed/${slug}-${i}/1200/800`, caption })
const video = (video_url, caption) => ({ kind: 'video', video_url, caption })
const episode = (slug, no, title, pages) => ({
  no,
  title,
  thumb_path: `https://picsum.photos/seed/${slug}-ep${no}/400/400`,
  pages: Array.from({ length: pages }, (_, i) => `https://picsum.photos/seed/${slug}-ep${no}-${i + 1}/800/1200`),
})

const DUMMY_WORKS = [
  // ---- 창업 ----
  {
    slug: 's01', part_slug: 'startup', title: '골목 빵집 브랜드 리뉴얼', genres: ['브랜드'],
    synopsis: '동네 빵집의 간판·포장·명함을 하나의 톤으로 다시 묶은 브랜딩 작업입니다. 오래된 가게의 온기를 잃지 않으면서 새 손님에게도 눈에 띄도록 서체와 색을 정리했습니다.',
    world_setting: null, cover_path: cover('s01'), sort_order: 1,
    authors: [{ name: '홍길동', role: null, contact_type: 'instagram', contact_url: 'https://instagram.com/' }],
    media: [image('s01', 1, '로고 시스템'), image('s01', 2, '패키지 적용'), image('s01', 3, '간판 목업')],
  },
  {
    slug: 's02', part_slug: 'startup', title: '달빛 문구 일러스트 시리즈', genres: ['일러스트'],
    synopsis: '밤에 책상 앞에 앉는 사람들을 위한 문구 브랜드의 일러스트 12종입니다. 스티커·엽서·다이어리 표지로 전개됩니다.',
    world_setting: '달이 뜨면 문구들이 깨어나 밤샘하는 주인을 돕는다는 작은 설정에서 출발했습니다.',
    cover_path: cover('s02'), sort_order: 2,
    authors: [{ name: '김철수', role: null, contact_type: 'email', contact_url: 'mailto:example@example.com' }],
    media: [image('s02', 1), image('s02', 2), image('s02', 3), image('s02', 4)],
  },
  {
    slug: 's03', part_slug: 'startup', title: '도시락 가게 2D 애니메이션 광고', genres: ['2D애니'],
    synopsis: '점심시간 15초 광고. 도시락 뚜껑이 열리는 순간의 김을 캐릭터로 살렸습니다.',
    world_setting: null, cover_path: cover('s03'), sort_order: 3,
    authors: [{ name: '이영희', role: '연출·작화', contact_type: 'instagram', contact_url: 'https://instagram.com/' }, { name: '박민수', role: '배경', contact_type: null, contact_url: null }],
    media: [video('https://www.youtube.com/watch?v=aqz-KE-bpKQ', '본편 15초'), image('s03', 1, '캐릭터 시트')],
  },
  {
    slug: 's04', part_slug: 'startup', title: '출판만화 「바람의 서점」', genres: ['출판만화'],
    synopsis: '헌책방을 물려받은 손녀가 책에 얽힌 손님들의 사연을 만나는 단편집. 인쇄본 1권 분량 중 두 편을 전시합니다.',
    world_setting: '책을 펼치면 그 책을 마지막으로 읽은 사람의 하루가 잠깐 보이는 서점.',
    cover_path: cover('s04'), sort_order: 4,
    authors: [{ name: '정다은', role: '글', contact_type: 'x', contact_url: 'https://x.com/' }, { name: '최준혁', role: '그림', contact_type: 'instagram', contact_url: 'https://instagram.com/' }],
    media: [image('s04', 1, '표지'), image('s04', 2), image('s04', 3)],
  },

  // ---- 웹툰 ----
  {
    slug: 'w01', part_slug: 'webtoon', title: '방과 후 도서부', genres: ['학원'],
    synopsis: '폐부 위기의 도서부에 들어온 전학생과 부원 셋의 한 학기. 책보다 사람 이야기가 더 많은 학원물입니다.',
    world_setting: null, cover_path: cover('w01'), sort_order: 1,
    authors: [{ name: '윤태양', role: null, contact_type: 'instagram', contact_url: 'https://instagram.com/' }],
    media: [],
    episodes: [episode('w01', 1, '전학생', 6), episode('w01', 2, '대출 카드', 5), episode('w01', 3, '반납일', 6)],
  },
  {
    slug: 'w02', part_slug: 'webtoon', title: '검은 탑의 견습생', genres: ['판타지', '액션'],
    synopsis: '마법을 못 쓰는 견습생이 탑의 청소부로 들어가 층마다 다른 괴물과 마주칩니다.',
    world_setting: null, cover_path: cover('w02'), sort_order: 2,
    authors: [{ name: '오세라', role: null, contact_type: 'x', contact_url: 'https://x.com/' }],
    media: [],
    episodes: [episode('w02', 1, '1층: 빗자루', 6), episode('w02', 2, '2층: 물웅덩이', 6), episode('w02', 3, '3층: 문지기', 5)],
  },
  {
    slug: 'w03', part_slug: 'webtoon', title: '옥상 정원 일지', genres: ['학원'],
    synopsis: '학교 옥상에 몰래 텃밭을 만든 두 학생의 계절 기록.',
    world_setting: null, cover_path: cover('w03'), sort_order: 3,
    authors: [{ name: '임하람', role: null, contact_type: null, contact_url: null }],
    media: [],
    episodes: [episode('w03', 1, '봄, 씨앗', 5), episode('w03', 2, '여름, 물', 5)],
  },
  {
    slug: 'w04', part_slug: 'webtoon', title: '용의 심부름꾼', genres: ['판타지'],
    synopsis: '잠든 용 대신 마을 심부름을 다니는 소년. 심부름 목록이 점점 이상해집니다.',
    world_setting: null, cover_path: cover('w04'), sort_order: 4,
    authors: [{ name: '서지훈', role: '글·그림', contact_type: 'instagram', contact_url: 'https://instagram.com/' }, { name: '강나래', role: '채색', contact_type: null, contact_url: null }],
    media: [],
    episodes: [episode('w04', 1, '첫 번째 심부름', 6), episode('w04', 2, '두 번째 심부름', 6), episode('w04', 3, '세 번째 심부름', 6)],
  },

  // ---- 영상 ----
  {
    slug: 'v01', part_slug: 'video', title: '종이배', genres: ['2D'],
    synopsis: '비 오는 날 하수구로 흘러간 종이배의 4분. 손그림 2D 애니메이션.',
    world_setting: null, cover_path: cover('v01'), sort_order: 1,
    authors: [{ name: '배도윤', role: null, contact_type: 'instagram', contact_url: 'https://instagram.com/' }],
    media: [video('https://www.youtube.com/watch?v=aqz-KE-bpKQ', '본편'), image('v01', 1, '스틸컷'), image('v01', 2, '스틸컷')],
  },
  {
    slug: 'v02', part_slug: 'video', title: '철의 정원', genres: ['3D'],
    synopsis: '버려진 공장에 자라난 기계 식물들. 3D 단편.',
    world_setting: null, cover_path: cover('v02'), sort_order: 2,
    authors: [{ name: '문시아', role: '연출', contact_type: 'behance', contact_url: 'https://www.behance.net/' }, { name: '조한결', role: '모델링', contact_type: null, contact_url: null }, { name: '신보라', role: '라이팅', contact_type: null, contact_url: null }],
    media: [video('https://vimeo.com/1084537', '본편'), image('v02', 1, '컨셉 아트')],
  },
  {
    slug: 'v03', part_slug: 'video', title: '새벽 배송', genres: ['2D'],
    synopsis: '새벽 네 시, 배송 기사와 고양이의 짧은 동행.',
    world_setting: null, cover_path: cover('v03'), sort_order: 3,
    authors: [{ name: '한별', role: null, contact_type: null, contact_url: null }],
    media: [image('v03', 1), image('v03', 2), image('v03', 3)],
  },

  // ---- 게임 ----
  {
    slug: 'g01', part_slug: 'game', title: '숲의 파수꾼 캐릭터 시트', genres: ['캐릭터'],
    synopsis: '탑뷰 액션 게임의 주인공과 적 4종 캐릭터 디자인. 턴어라운드와 표정 시트를 포함합니다.',
    world_setting: '한 번 불탄 숲이 다시 자라는 백 년 동안, 숲을 지키는 파수꾼 가문의 이야기.',
    cover_path: cover('g01'), sort_order: 1,
    authors: [{ name: '권민재', role: null, contact_type: 'x', contact_url: 'https://x.com/' }],
    media: [image('g01', 1, '주인공 턴어라운드'), image('g01', 2, '적 캐릭터'), image('g01', 3, '표정 시트')],
  },
  {
    slug: 'g02', part_slug: 'game', title: '폐역 배경 컨셉', genres: ['배경'],
    synopsis: '운행이 끊긴 지하철역을 무대로 한 탐험 게임의 배경 컨셉 아트 5점.',
    world_setting: '지하철이 끊긴 뒤 역마다 다른 계절이 갇혔다.',
    cover_path: cover('g02'), sort_order: 2,
    authors: [{ name: '장예린', role: null, contact_type: 'instagram', contact_url: 'https://instagram.com/' }],
    media: [image('g02', 1), image('g02', 2), image('g02', 3), image('g02', 4)],
  },
  {
    slug: 'g03', part_slug: 'game', title: '기계 골렘 모델링', genres: ['모델링'],
    synopsis: '보스 몬스터 기계 골렘의 하이폴리·로우폴리 모델과 텍스처. 턴테이블 영상 포함.',
    world_setting: '고대 유적을 지키기 위해 만들어졌지만 지키던 것을 잊어버린 골렘.',
    cover_path: cover('g03'), sort_order: 3,
    authors: [{ name: '노아영', role: '모델링', contact_type: 'behance', contact_url: 'https://www.behance.net/' }, { name: '황보람', role: '텍스처', contact_type: null, contact_url: null }],
    media: [video('https://www.youtube.com/watch?v=aqz-KE-bpKQ', '턴테이블'), image('g03', 1, '와이어프레임'), image('g03', 2, '텍스처')],
  },
]

export const WORKS = [...(CONTENT?.works ?? DUMMY_WORKS)]
  .sort((a, b) => a.part_slug.localeCompare(b.part_slug) || a.sort_order - b.sort_order)

export function findWork(slug) {
  return WORKS.find(w => w.slug === slug)
}

export function worksByPart(partSlug) {
  return WORKS.filter(w => w.part_slug === partSlug)
}

// 작가 이름 배열 — 검색용
export function authorNames(work) {
  return work.authors.map(a => a.name)
}

// 카드 표기용 — 2명까지는 다 쓰고 그 이상은 "외 N명"
export function formatAuthors(work) {
  const names = authorNames(work)
  if (names.length <= 3) return names.join(' · ')
  return `${names.slice(0, 2).join(' · ')} 외 ${names.length - 2}명`
}

// 작가 이름 가나다순 정렬본을 새 배열로 반환 (졸준위 요청)
export function sortByAuthor(works) {
  return [...works].sort((a, b) =>
    authorNames(a)[0].localeCompare(authorNames(b)[0], 'ko'))
}

// 참여자 이름으로 그 사람의 작품을 찾는다 (Designers 썸네일·팀 표기용)
export function worksByAuthor(name) {
  return WORKS.filter(w => authorNames(w).includes(name))
}

// 작품 상세 옆 추천 — 같은 파트 먼저, 모자라면 다른 파트로 채운다
export function relatedWorks(work, limit = 6) {
  const others = WORKS.filter(w => w.slug !== work.slug)
  const same = others.filter(w => w.part_slug === work.part_slug)
  const rest = others.filter(w => w.part_slug !== work.part_slug)
  return [...same, ...rest].slice(0, limit)
}
