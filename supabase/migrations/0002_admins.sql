-- 관리자 명단 + 방명록 정책을 관리자 한정으로 교체
-- 0001 을 먼저 실행한 뒤 이 파일을 실행한다. 여러 번 실행해도 안전하다.
--
-- 왜 필요한가: 로그인이 구글·카카오 소셜 로그인이라 계정은 누구나 만들 수 있다.
-- 0001 의 정책은 '로그인한 사용자'면 통과라서, 그대로 두면 아무나 방명록을
-- 승인하거나 지울 수 있다. 아래 명단에 있는 계정만 관리자로 인정한다.

create table if not exists admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

-- 본인이 관리자인지 확인하는 용도로만 조회 허용
drop policy if exists admins_self_read on admins;
create policy admins_self_read on admins
  for select to authenticated using (user_id = auth.uid());

-- 정책 안에서 admins 를 읽어야 하므로 security definer
create or replace function is_admin() returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- 방명록 관리 정책 3종을 관리자 한정으로 다시 만든다
drop policy if exists guestbook_admin_read on guestbook;
create policy guestbook_admin_read on guestbook
  for select to authenticated using (is_admin());

drop policy if exists guestbook_admin_write on guestbook;
create policy guestbook_admin_write on guestbook
  for update to authenticated using (is_admin()) with check (is_admin());

drop policy if exists guestbook_admin_delete on guestbook;
create policy guestbook_admin_delete on guestbook
  for delete to authenticated using (is_admin());

-- ------------------------------------------------------------
-- 첫 관리자 등록 (수동)
--   1) 관리자로 쓸 계정으로 사이트에서 한 번 로그인한다
--   2) Authentication > Users 에서 그 계정의 UUID 를 복사한다
--   3) 아래 줄의 주석을 풀고 값을 채워 실행한다
-- ------------------------------------------------------------
-- insert into admins (user_id, email) values ('붙여넣은-UUID', '계정이메일')
--   on conflict (user_id) do nothing;
