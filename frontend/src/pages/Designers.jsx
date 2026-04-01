import './Designers.css'

const DUMMY_DESIGNERS = [
  { id: 1, name: '김민준', category: '창업', image_url: 'https://picsum.photos/seed/d1/200/200' },
  { id: 2, name: '이서연', category: '웹툰', image_url: 'https://picsum.photos/seed/d2/200/200' },
  { id: 3, name: '박지훈', category: '영상', image_url: 'https://picsum.photos/seed/d3/200/200' },
  { id: 4, name: '최유나', category: '게임', image_url: 'https://picsum.photos/seed/d4/200/200' },
  { id: 5, name: '정다은', category: '창업', image_url: 'https://picsum.photos/seed/d5/200/200' },
  { id: 6, name: '한승우', category: '웹툰', image_url: 'https://picsum.photos/seed/d6/200/200' },
  { id: 7, name: '오지은', category: '영상', image_url: 'https://picsum.photos/seed/d7/200/200' },
  { id: 8, name: '강현수', category: '게임', image_url: 'https://picsum.photos/seed/d8/200/200' },
]

export default function Designers() {
  return (
    <main className="designers-page page-offset">
      <div className="designers-header">
        <div className="designers-header-inner">
          <h1 className="designers-title">Designers</h1>
          <p className="designers-count">{DUMMY_DESIGNERS.length}명의 참여자</p>
        </div>
      </div>

      <div className="designers-grid">
        {DUMMY_DESIGNERS.map(d => (
          <div key={d.id} className="designer-card">
            <div className="designer-image">
              <img src={d.image_url} alt={d.name} />
            </div>
            <p className="designer-name">{d.name}</p>
            <p className="designer-category">{d.category}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
