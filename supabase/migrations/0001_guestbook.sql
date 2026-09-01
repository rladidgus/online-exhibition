-- 방명록 테이블 + RLS
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행. 여러 번 실행해도 안전하다.

create table if not exists guestbook (
  id          bigserial primary key,
  nickname    text not null,
  content     text not null,
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'hidden')),
  created_at  timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists guestbook_status_idx on guestbook (status, created_at desc);

alter table guestbook enable row level security;

-- 관람객: 승인된 글만 읽고, 쓰기는 pending 으로만
drop policy if exists guestbook_read_approved on guestbook;
create policy guestbook_read_approved on guestbook
  for select to anon, authenticated using (status = 'approved');

drop policy if exists guestbook_insert_pending on guestbook;
create policy guestbook_insert_pending on guestbook
  for insert to anon, authenticated with check (status = 'pending');

-- 관리자(로그인 사용자): 전체 조회·승인·삭제
drop policy if exists guestbook_admin_read on guestbook;
create policy guestbook_admin_read on guestbook
  for select to authenticated using (true);

drop policy if exists guestbook_admin_write on guestbook;
create policy guestbook_admin_write on guestbook
  for update to authenticated using (true) with check (true);

drop policy if exists guestbook_admin_delete on guestbook;
create policy guestbook_admin_delete on guestbook
  for delete to authenticated using (true);
