-- 관리자 화면이 쓰는 콘텐츠 테이블 (파트·장르·작품·작가·미디어·웹툰 회차·사이트 설정) + 이미지 보관함
-- 0001 → 0002 를 먼저 실행한 뒤 이 파일을 실행한다 (is_admin() 이 0002 에 있다). 여러 번 실행해도 안전하다.
--
-- 컬럼명은 frontend/src/data/*.js 필드명과 같다. 빌드 때 이 테이블을 읽어 그 파일들을 만든다.
-- 공개 사이트는 DB 를 직접 읽지 않으므로 익명 읽기 정책은 없다. 빌드 스크립트는 service_role 키로 읽는다.
-- 쓰기·읽기는 관리자 명단(admins)에 있는 계정만. 로그인만 했다고 통과시키지 않는다.

-- 파트 (4종 고정)
create table if not exists parts (
  slug        text primary key,
  label       text not null,
  en          text not null,
  sort_order  int  not null default 0
);

-- 파트별 장르 어휘 (sort_order = 화면 노출 순서)
create table if not exists part_genres (
  id          bigserial primary key,
  part_slug   text not null references parts (slug) on delete cascade,
  name        text not null,
  sort_order  int  not null default 0,
  unique (part_slug, name)
);

-- 작품
create table if not exists works (
  id            bigserial primary key,
  part_slug     text not null references parts (slug),
  slug          text not null unique,
  title         text not null,
  genres        text[] not null default '{}',
  synopsis      text,
  world_setting text,
  cover_path    text,
  sort_order    int  not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists works_part_idx on works (part_slug);

-- 작가 (팀 작품 = 작품당 여러 명)
create table if not exists work_authors (
  id           bigserial primary key,
  work_id      bigint not null references works (id) on delete cascade,
  name         text not null,
  role         text,
  contact_type text,
  contact_url  text,
  sort_order   int not null default 0
);
create index if not exists work_authors_work_idx on work_authors (work_id);

-- 상세 미디어 (이미지·영상 혼재, sort_order = 노출 순서)
create table if not exists work_media (
  id          bigserial primary key,
  work_id     bigint not null references works (id) on delete cascade,
  kind        text not null check (kind in ('image', 'video')),
  path        text,
  video_url   text,
  caption     text,
  sort_order  int not null default 0,
  check ((kind = 'image' and path is not null) or (kind = 'video' and video_url is not null))
);
create index if not exists work_media_work_idx on work_media (work_id, sort_order);

-- 웹툰 회차 + 회차 원고
create table if not exists episodes (
  id          bigserial primary key,
  work_id     bigint not null references works (id) on delete cascade,
  no          int  not null,
  title       text,
  thumb_path  text,
  unique (work_id, no)
);

create table if not exists episode_pages (
  id          bigserial primary key,
  episode_id  bigint not null references episodes (id) on delete cascade,
  path        text not null,
  sort_order  int  not null,
  unique (episode_id, sort_order)
);

-- 사이트 전역 설정 (한 줄만)
create table if not exists site_settings (
  id                int primary key default 1 check (id = 1),
  exhibition_title  text,
  department_name   text,
  major_label       text,
  slogan            text,
  cover_path        text,
  intro_title       text,
  intro_body        text,
  exhibit_start     date,
  exhibit_end       date,
  venue_name        text,
  venue_address     text,
  venue_map_url     text,
  venue_directions  text,
  opening_video_url text,
  sns_instagram     text,
  sns_x             text,
  -- Cloudflare 배포 훅 주소. 프론트 코드에 넣으면 누구나 배포를 돌릴 수 있어서 관리자만 읽는 이 표에 둔다.
  deploy_hook_url   text,
  updated_at        timestamptz not null default now()
);

-- 수정 시각 자동 갱신
create or replace function touch_updated_at() returns trigger
  language plpgsql set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists works_touch on works;
create trigger works_touch before update on works
  for each row execute function touch_updated_at();

drop trigger if exists site_settings_touch on site_settings;
create trigger site_settings_touch before update on site_settings
  for each row execute function touch_updated_at();

-- RLS: 콘텐츠 테이블 전부 관리자만
alter table parts         enable row level security;
alter table part_genres   enable row level security;
alter table works         enable row level security;
alter table work_authors  enable row level security;
alter table work_media    enable row level security;
alter table episodes      enable row level security;
alter table episode_pages enable row level security;
alter table site_settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['parts', 'part_genres', 'works', 'work_authors',
                           'work_media', 'episodes', 'episode_pages', 'site_settings']
  loop
    execute format('drop policy if exists %I on %I', t || '_admin_all', t);
    execute format(
      'create policy %I on %I for all to authenticated using (is_admin()) with check (is_admin())',
      t || '_admin_all', t);
  end loop;
end $$;

-- 이미지 보관함: 관리자가 올리는 원본 자리. 공개 사이트는 빌드 때 내려받아 쓰므로 비공개 버킷.
insert into storage.buckets (id, name, public)
values ('works', 'works', false)
on conflict (id) do nothing;

drop policy if exists works_bucket_admin on storage.objects;
create policy works_bucket_admin on storage.objects
  for all to authenticated
  using (bucket_id = 'works' and public.is_admin())
  with check (bucket_id = 'works' and public.is_admin());

-- 초기 데이터 — 지금 frontend/src/data 값 그대로 (준비위 확정 전 임시값)
insert into parts (slug, label, en, sort_order) values
  ('startup', '창업', 'Startup', 1),
  ('webtoon', '웹툰', 'Webtoon', 2),
  ('video',   '영상', 'Video',   3),
  ('game',    '게임', 'Game',    4)
on conflict (slug) do nothing;

insert into part_genres (part_slug, name, sort_order) values
  ('startup', '브랜드', 1), ('startup', '일러스트', 2), ('startup', '2D애니', 3), ('startup', '출판만화', 4),
  ('webtoon', '학원', 1), ('webtoon', '판타지', 2), ('webtoon', '액션', 3),
  ('video', '2D', 1), ('video', '3D', 2),
  ('game', '캐릭터', 1), ('game', '배경', 2), ('game', '모델링', 3)
on conflict (part_slug, name) do nothing;

insert into site_settings (
  id, exhibition_title, department_name, major_label, slogan, cover_path,
  intro_title, intro_body, exhibit_start, exhibit_end,
  venue_name, venue_address, venue_map_url, venue_directions,
  opening_video_url, sns_instagram, sns_x
) values (
  1, '2026 졸업전시', '백석대학교 영상애니메이션과', '영상애니메이션전공', E'우리의 작품을\n세상에 선보입니다', '/kv-2026.jpg',
  '우리는 각자의 방식으로 세계를 만들었다',
  E'4년의 시간이 아흔 개의 세계로 흩어졌습니다. 어떤 세계는 종이 위에 그려졌고, 어떤 세계는 화면 안에서 움직이며, 어떤 세계는 아직 이름을 붙이는 중입니다.\n\n이 전시는 그 세계들을 한자리에 모아 처음으로 바깥에 내놓는 자리입니다. 완성된 결말이 아니라, 여기서부터 시작하겠다는 선언에 가깝습니다.',
  '2026-11-09', '2026-11-14',
  '[전시장명]', '[전시장 주소]', 'https://map.naver.com/',
  '[교통편 안내 — 예: 지하철 O호선 OO역 O번 출구 도보 5분. 별도 주차 공간이 없어 대중교통 이용을 권합니다.]',
  'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'https://instagram.com/', ''
)
on conflict (id) do nothing;
