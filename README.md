# online-exhibition

2026 백석대학교 영상애니메이션과 졸업전시 웹사이트.

## 실행

```bash
cd frontend
npm install
npm run dev
```

`frontend/.env` 에 Supabase 값이 필요하다. 없으면 방명록·로그인만 동작하지 않고 나머지 화면은 정상이다.

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_PARTICIPANTS_DATA=...
```

## 배포 — Cloudflare Pages

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name <프로젝트명>
```

빌드 명령 `cd frontend && npm run build` / 출력 폴더 `frontend/dist`.
SPA 라우팅은 `frontend/public/_redirects` 한 줄이 처리한다(`/works/...` 같은 주소로 직접 들어와도 200).

## 구조

```
frontend/src/
├── data/        작품·파트·사이트 설정 (빌드 시 임베드, 런타임 DB 조회 없음)
├── lib/         supabase 클라이언트 · 방명록 · 영상 임베드 변환
├── pages/       화면 (.jsx + .css 쌍)
├── components/  Navbar · WorkCard · 필터
└── styles/      공용 스타일
supabase/migrations/   DB 스키마 (대시보드 SQL Editor 에 붙여넣어 실행)
```

방명록만 런타임에 DB를 쓰고, 나머지 데이터는 빌드 시 임베드된다.
