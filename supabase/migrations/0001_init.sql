-- 산책기록 PWA ("동네수집") — 초기 스키마
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여넣고 실행하세요.

create table if not exists public.pins (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,

  image_path     text not null,      -- {user_id}/{timestamp}.webp

  lat            double precision,
  lng            double precision,
  accuracy       double precision,   -- 미터. 100 초과면 실내 가능성

  taken_at       timestamptz not null default now(),
  user_note      text,

  caption        text,
  tags           text[] not null default '{}',
  mood           text,
  caption_status text not null default 'pending',

  created_at     timestamptz not null default now(),

  constraint pins_mood_check check (
    mood is null or mood in ('고요','설렘','쓸쓸','따뜻','활기','몽롱','청량','아늑')
  ),
  constraint pins_caption_status_check check (
    caption_status in ('pending','done','failed')
  )
);

create index if not exists pins_user_taken_idx on public.pins (user_id, taken_at desc);
create index if not exists pins_tags_idx on public.pins using gin (tags);

-- RLS 정책만으로는 접근이 안 열립니다. PostgREST가 쓰는 anon/authenticated 롤에
-- 테이블 자체 권한을 먼저 GRANT 해줘야 그 위의 RLS 정책이 의미가 있습니다.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.pins to anon, authenticated;

-- 기본 REPLICA IDENTITY(기본키만)로는 DELETE 이벤트의 old record에 user_id가
-- 실려 오지 않아, Realtime의 `user_id=eq.<uid>` 필터가 이벤트를 걸러버린다.
-- FULL로 바꿔야 삭제가 클라이언트에 실시간으로 반영된다.
alter table public.pins replica identity full;

alter table public.pins enable row level security;

drop policy if exists "pins_select_own" on public.pins;
create policy "pins_select_own" on public.pins
  for select using (auth.uid() = user_id);

drop policy if exists "pins_insert_own" on public.pins;
create policy "pins_insert_own" on public.pins
  for insert with check (auth.uid() = user_id);

drop policy if exists "pins_update_own" on public.pins;
create policy "pins_update_own" on public.pins
  for update using (auth.uid() = user_id);

drop policy if exists "pins_delete_own" on public.pins;
create policy "pins_delete_own" on public.pins
  for delete using (auth.uid() = user_id);

-- Realtime으로 pins 테이블 변경사항을 구독하기 위해 필요
alter publication supabase_realtime add table public.pins;

-- Storage: 비공개 버킷 + 본인 폴더만 접근 가능한 정책
insert into storage.buckets (id, name, public)
values ('walk-photos', 'walk-photos', false)
on conflict (id) do nothing;

drop policy if exists "walk_photos_select_own" on storage.objects;
create policy "walk_photos_select_own" on storage.objects
  for select using (
    bucket_id = 'walk-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "walk_photos_insert_own" on storage.objects;
create policy "walk_photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'walk-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "walk_photos_update_own" on storage.objects;
create policy "walk_photos_update_own" on storage.objects
  for update using (
    bucket_id = 'walk-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "walk_photos_delete_own" on storage.objects;
create policy "walk_photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'walk-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
