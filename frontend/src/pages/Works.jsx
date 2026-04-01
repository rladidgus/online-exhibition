import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CategoryFilter from '../components/CategoryFilter'
import WorkCard from '../components/WorkCard'
import './Works.css'

// 임시 더미 데이터 (Supabase 연동 전)
const DUMMY_WORKS = [
  { id: 1, title: '스타트업 플랫폼', author: '김민준', category: '창업', image_url: 'https://picsum.photos/seed/1/400/300' },
  { id: 2, title: '일상의 조각', author: '이서연', category: '웹툰', image_url: 'https://picsum.photos/seed/2/400/300' },
  { id: 3, title: '도시의 소리', author: '박지훈', category: '영상', image_url: 'https://picsum.photos/seed/3/400/300' },
  { id: 4, title: '판타지 RPG', author: '최유나', category: '게임', image_url: 'https://picsum.photos/seed/4/400/300' },
  { id: 5, title: '소셜 커머스', author: '정다은', category: '창업', image_url: 'https://picsum.photos/seed/5/400/300' },
  { id: 6, title: '고양이 일기', author: '한승우', category: '웹툰', image_url: 'https://picsum.photos/seed/6/400/300' },
  { id: 7, title: '기억의 단편', author: '오지은', category: '영상', image_url: 'https://picsum.photos/seed/7/400/300' },
  { id: 8, title: '퍼즐 어드벤처', author: '강현수', category: '게임', image_url: 'https://picsum.photos/seed/8/400/300' },
  { id: 9, title: '헬스케어 앱', author: '윤서진', category: '창업', image_url: 'https://picsum.photos/seed/9/400/300' },
  { id: 10, title: '별빛 연대기', author: '임채원', category: '웹툰', image_url: 'https://picsum.photos/seed/10/400/300' },
  { id: 11, title: '침묵의 기록', author: '신민호', category: '영상', image_url: 'https://picsum.photos/seed/11/400/300' },
  { id: 12, title: '메타버스 레이서', author: '배수빈', category: '게임', image_url: 'https://picsum.photos/seed/12/400/300' },
]

export default function Works() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const category = searchParams.get('category') || 'all'

  const setCategory = (cat) => {
    if (cat === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: cat })
    }
  }

  const filtered = DUMMY_WORKS.filter(w => {
    const matchCategory = category === 'all' || w.category === category
    const matchSearch = w.title.includes(search) || w.author.includes(search)
    return matchCategory && matchSearch
  })

  return (
    <main className="works-page page-offset">
      <div className="works-header">
        <div className="works-header-top">
          <h1 className="works-title">Works</h1>
          <p className="works-count">{filtered.length}개의 작품</p>
        </div>
      </div>

      <div className="works-toolbar">
        <CategoryFilter active={category} onChange={setCategory} />
        <input
          className="works-search"
          type="text"
          placeholder="작품명 또는 작가 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="works-empty">검색 결과가 없습니다.</div>
      ) : (
        <div className="works-grid">
          {filtered.map(work => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </main>
  )
}
