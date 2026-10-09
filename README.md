# online-exhibition

2026 백석대학교 영상애니메이션과 졸업전시 웹사이트.

## 실행

```bash
cd frontend
npm install
npm run dev
```

`frontend/.env` 에 Supabase 값이 필요하다. 없으면 방명록·관리자만 동작하지 않고 나머지 화면은 정상이다.

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_PARTICIPANTS_DATA=...
SUPABASE_SERVICE_ROLE_KEY=...   # 빌드 전용(브라우저에 안 실림). 있으면 관리자가 저장한 공개 작품으로 빌드
```

## 관리자 (`/admin`)

준비위원회가 작품·작가·이미지·웹툰 회차·사이트 설정·방명록 승인을 직접 고치는 화면.
이메일+비밀번호 로그인이고, `admins` 표에 있는 계정만 들어간다(계정은 Supabase 대시보드에서 발급).
저장 → 대시보드 "사이트에 반영"(Cloudflare 배포 훅) → `npm run build` 앞단의 `scripts/fetch-content.mjs` 가
DB 내용과 이미지를 `src/data/content.json` · `public/content/` 로 내려받아 정적 빌드한다.
DB 준비 = `supabase/migrations/0001` → `0002` → `0003` 순서로 SQL Editor 에서 실행.

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
