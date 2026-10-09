-- 작품별 댓글(승인제) + 좋아요
-- 0002(is_admin) 이후에 실행한다. 여러 번 실행해도 안전하다.
--
-- 댓글: 관람객은 로그인 없이 pending 으로만 쓰고, 공개 목록은 승인된 것만. 관리는 admins 명단만 (방명록과 같은 규칙).
-- 좋아요: 로그인이 없어서 숫자만 센다. 테이블에 직접 쓰지 못하게 막고 like_work / unlike_work 함수로만 바꾼다.

create table if not exists work_comments (
  id          bigserial primary key,
  work_slug   text not null,
  nickname    text not null check (char_length(nickname) between 1 and 20),
  content     text not null check (char_length(content) between 1 and 300),
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'hidden')),
  created_at  timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists work_comments_slug_idx on work_comments (work_slug, status, created_at desc);

alter table work_comments enable row level security;

drop policy if exists work_comments_read_approved on work_comments;
create policy work_comments_read_approved on work_comments
  for select to anon, authenticated using (status = 'approved');

drop policy if exists work_comments_insert_pending on work_comments;
create policy work_comments_insert_pending on work_comments
  for insert to anon, authenticated with check (status = 'pending');

drop policy if exists work_comments_admin_read on work_comments;
create policy work_comments_admin_read on work_comments
  for select to authenticated using (is_admin());

drop policy if exists work_comments_admin_write on work_comments;
create policy work_comments_admin_write on work_comments
  for update to authenticated using (is_admin()) with check (is_admin());

drop policy if exists work_comments_admin_delete on work_comments;
create policy work_comments_admin_delete on work_comments
  for delete to authenticated using (is_admin());

-- 좋아요 수
create table if not exists work_likes (
  work_slug text primary key,
  count     int not null default 0 check (count >= 0)
);

alter table work_likes enable row level security;

drop policy if exists work_likes_read on work_likes;
create policy work_likes_read on work_likes
  for select to anon, authenticated using (true);

-- 공개 작품에만 누를 수 있다. 바뀐 숫자를 돌려준다.
create or replace function like_work(p_slug text) returns int
  language plpgsql security definer set search_path = public
as $$
declare n int;
begin
  if not exists (select 1 from works where slug = p_slug and is_published) then
    raise exception 'unknown work';
  end if;
  insert into work_likes (work_slug, count) values (p_slug, 1)
  on conflict (work_slug) do update set count = work_likes.count + 1
  returning count into n;
  return n;
end;
$$;

create or replace function unlike_work(p_slug text) returns int
  language plpgsql security definer set search_path = public
as $$
declare n int;
begin
  update work_likes set count = greatest(count - 1, 0)
  where work_slug = p_slug
  returning count into n;
  return coalesce(n, 0);
end;
$$;

revoke all on function like_work(text) from public;
revoke all on function unlike_work(text) from public;
grant execute on function like_work(text) to anon, authenticated;
grant execute on function unlike_work(text) to anon, authenticated;
