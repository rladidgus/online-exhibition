# 온라인 전시 웹 프로젝트

## 프로젝트 개요
학과 작품을 온라인으로 전시하는 웹/웹앱 서비스.
카테고리별 작품 탐색, 검색, 리뷰, 좋아요 기능을 제공한다.

---

## 기술 스택

### 프론트엔드
- **Framework**: React
- **배포**: Vercel
- **타깃**: 웹 + 웹앱(모바일 반응형)

### 백엔드
- **언어**: Python
- **Framework**: FastAPI (권장)
- **배포**: Vercel (serverless functions)

### 데이터베이스 & 스토리지
- **DB**: Supabase (PostgreSQL)
- **스토리지**: Supabase Storage (작품 이미지 ~500장)
- **인증**: Supabase Auth (소셜 로그인)

---

## 주요 기능

### 1. 인증
- 소셜 로그인 (Google, Kakao 등)
- Supabase Auth 사용

### 2. 카테고리
- 창업
- 웹툰
- 영상
- 게임

### 3. 검색
- 작품명 검색
- 작가/팀 이름 검색

### 4. 작품 상세
- 작품 이미지 (Supabase Storage)
- 작품 설명
- 작가/팀 정보

### 5. 리뷰
- 로그인한 사용자만 작성 가능
- 리뷰 목록 조회 (비로그인도 가능)

### 6. 좋아요
- 로그인한 사용자만 가능
- 작품당 좋아요 수 집계

---

## 디렉토리 구조 (예정)

```
online-exhibition/
├── frontend/          # React 앱
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── package.json
├── backend/           # Python FastAPI
│   ├── app/
│   │   ├── routers/
│   │   ├── models/
│   │   └── main.py
│   └── requirements.txt
└── CLAUDE.md
```

---

## Supabase 테이블 설계 (초안)

### users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK (Supabase Auth 연동) |
| nickname | text | 사용자 닉네임 |
| created_at | timestamp | 가입일 |

### works (작품)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| title | text | 작품명 |
| author | text | 작가/팀명 |
| category | text | 창업/웹툰/영상/게임 |
| description | text | 작품 설명 |
| image_url | text | Supabase Storage URL |
| created_at | timestamp | 등록일 |

### reviews (리뷰)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| work_id | uuid | FK → works.id |
| user_id | uuid | FK → users.id |
| content | text | 리뷰 내용 |
| created_at | timestamp | 작성일 |

### likes (좋아요)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| work_id | uuid | FK → works.id |
| user_id | uuid | FK → users.id |
| created_at | timestamp | 좋아요 일시 |

---

## Supabase Storage 구조

```
bucket: works
└── {category}/
    └── {work_id}/
        ├── main.jpg       # 대표 이미지
        └── detail_1.jpg   # 추가 이미지
```

---

## 배포 전략

| 영역 | 서비스 | 비고 |
|------|--------|------|
| 프론트엔드 | Vercel | React 빌드 자동 배포 |
| 백엔드 | Vercel Serverless | Python FastAPI |
| DB | Supabase | 무료 티어 |
| 스토리지 | Supabase Storage | 이미지 ~500장 |

---

## 개발 순서

1. Supabase 프로젝트 생성 및 테이블/스토리지 설정
2. 소셜 로그인 연동 (Supabase Auth)
3. 백엔드 API 개발 (FastAPI)
   - 작품 CRUD
   - 검색 API
   - 리뷰 API
   - 좋아요 API
4. 프론트엔드 개발 (React)
   - 메인/카테고리 페이지
   - 작품 상세 페이지
   - 검색 페이지
   - 로그인/마이페이지
5. Vercel 배포 및 환경변수 설정
6. 이미지 500장 Supabase Storage 업로드
