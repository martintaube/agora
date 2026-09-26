create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;

create type public.community_role as enum ('member', 'admin');
create type public.topic_type as enum ('information', 'opinion', 'vote', 'collaboration');
create type public.topic_visibility as enum ('public', 'community');
create type public.publication_status as enum ('draft', 'published', 'archived');
create type public.participation_status as enum ('open', 'closed');
create type public.selection_mode as enum ('single', 'multiple');
create type public.implementation_status as enum ('planned', 'in_progress', 'implemented');
create type public.topic_update_kind as enum ('result', 'implementation');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 80),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 80),
  username extensions.citext not null unique
    check (username::text ~ '^[a-zA-Z0-9][a-zA-Z0-9._-]{2,29}$'),
  display_name text check (display_name is null or char_length(btrim(display_name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  slug extensions.citext not null unique check (slug::text ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.community_role not null default 'member',
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (community_id, user_id),
  check (role <> 'admin' or verified_at is not null)
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text,
  created_at timestamptz not null default now(),
  unique (community_id, id)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  place_id uuid,
  type public.topic_type not null,
  visibility public.topic_visibility not null default 'public',
  title text not null check (char_length(btrim(title)) between 1 and 180),
  slug extensions.citext not null check (slug::text ~ '^[a-z0-9][a-z0-9-]{1,100}$'),
  guiding_question text,
  content text not null check (char_length(btrim(content)) > 0),
  task text,
  selection_mode public.selection_mode,
  publication_status public.publication_status not null default 'draft',
  participation_status public.participation_status,
  participation_starts_at timestamptz,
  participation_ends_at timestamptz,
  event_starts_at timestamptz,
  event_ends_at timestamptz,
  result_published_at timestamptz,
  implementation_status public.implementation_status,
  published_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (community_id, slug),
  foreign key (community_id, place_id) references public.places(community_id, id),
  check (participation_ends_at is null or participation_starts_at is null or participation_ends_at > participation_starts_at),
  check (event_ends_at is null or event_starts_at is null or event_ends_at > event_starts_at),
  check (
    (type = 'information' and selection_mode = 'multiple' and participation_status is null)
    or (type in ('opinion', 'collaboration') and selection_mode = 'single' and participation_status is not null)
    or (type = 'vote' and selection_mode is not null and participation_status is not null)
  ),
  check (result_published_at is null or (type in ('opinion', 'vote') and participation_status = 'closed')),
  check (publication_status = 'draft' or published_at is not null)
);

create table public.topic_options (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  key text not null check (key ~ '^[a-z0-9][a-z0-9_-]{1,60}$'),
  label text not null check (char_length(btrim(label)) between 1 and 120),
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  unique (topic_id, id),
  unique (topic_id, key),
  unique (topic_id, position)
);

create table public.topic_selections (
  topic_id uuid not null references public.topics(id) on delete cascade,
  option_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (topic_id, option_id, user_id),
  foreign key (topic_id, option_id) references public.topic_options(topic_id, id) on delete cascade
);

create table public.topic_comments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  parent_comment_id uuid,
  body text check (body is null or char_length(btrim(body)) between 1 and 5000),
  edited_at timestamptz,
  deleted_at timestamptz,
  hidden_at timestamptz,
  hidden_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (topic_id, id),
  foreign key (topic_id, parent_comment_id) references public.topic_comments(topic_id, id),
  check ((deleted_at is null and body is not null) or (deleted_at is not null and body is null)),
  check ((hidden_at is null and hidden_by is null) or (hidden_at is not null and hidden_by is not null))
);

create table public.topic_attachments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null check (char_length(btrim(file_name)) between 1 and 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  is_primary_image boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.topic_updates (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  kind public.topic_update_kind not null,
  title text not null check (char_length(btrim(title)) between 1 and 180),
  body text not null check (char_length(btrim(body)) > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index topic_attachments_one_primary_idx
  on public.topic_attachments (topic_id) where is_primary_image;
create index memberships_user_idx on public.memberships (user_id, community_id);
create index topics_community_publication_idx on public.topics (community_id, publication_status, created_at desc);
create index topic_options_topic_idx on public.topic_options (topic_id, position);
create index topic_selections_user_idx on public.topic_selections (user_id, topic_id);
create index topic_comments_topic_idx on public.topic_comments (topic_id, created_at);
create index topic_comments_parent_idx on public.topic_comments (parent_comment_id);
create index topic_updates_topic_idx on public.topic_updates (topic_id, published_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger topics_touch_updated_at before update on public.topics
for each row execute function public.touch_updated_at();
create trigger topic_selections_touch_updated_at before update on public.topic_selections
for each row execute function public.touch_updated_at();
create trigger topic_comments_touch_updated_at before update on public.topic_comments
for each row execute function public.touch_updated_at();

create or replace function public.is_community_member(p_community_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select p_user_id is not null and exists (
    select 1 from public.memberships m
    where m.community_id = p_community_id and m.user_id = p_user_id
  );
$$;

create or replace function public.is_community_admin(p_community_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select p_user_id is not null and exists (
    select 1 from public.memberships m
    where m.community_id = p_community_id
      and m.user_id = p_user_id
      and m.role = 'admin'
      and m.verified_at is not null
  );
$$;

create or replace function public.can_read_topic(p_topic_id uuid, p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.topics t
    where t.id = p_topic_id
      and (
        (t.publication_status = 'published' and t.visibility = 'public')
        or (t.publication_status = 'published' and public.is_community_member(t.community_id, p_user_id))
        or public.is_community_admin(t.community_id, p_user_id)
      )
  );
$$;

create or replace function public.public_display_name(p_user_id uuid)
returns text language sql stable security definer set search_path = '' as $$
  select coalesce(nullif(btrim(p.display_name), ''), btrim(p.first_name) || ' ' || left(btrim(p.last_name), 1) || '.')
  from public.profiles p where p.id = p_user_id;
$$;

create or replace function public.enforce_attachment_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.topics where id = new.topic_id for update;
  if (select count(*) from public.topic_attachments where topic_id = new.topic_id) >= 5 then
    raise exception 'A topic may contain at most five attachments';
  end if;
  return new;
end;
$$;

create trigger topic_attachments_limit before insert on public.topic_attachments
for each row execute function public.enforce_attachment_limit();

create or replace function public.protect_used_topic_option()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.topic_selections where option_id = old.id) then
    raise exception 'Options with selections cannot be changed or deleted';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger topic_options_protect_used before update or delete on public.topic_options
for each row execute function public.protect_used_topic_option();

create or replace function public.publish_topic_result()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.kind = 'result' then
    update public.topics
      set result_published_at = coalesce(result_published_at, new.published_at)
      where id = new.topic_id and type in ('opinion', 'vote') and participation_status = 'closed';
    if not found then raise exception 'Results require a closed opinion or vote topic'; end if;
  end if;
  return new;
end;
$$;

create trigger topic_updates_publish_result before insert on public.topic_updates
for each row execute function public.publish_topic_result();

create or replace function public.set_topic_selections(p_topic_id uuid, p_option_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_topic public.topics%rowtype;
  v_distinct_count integer;
  v_valid_count integer;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;

  select * into v_topic from public.topics where id = p_topic_id for update;
  if not found or not public.can_read_topic(p_topic_id, v_user_id) then raise exception 'Topic not available'; end if;
  if v_topic.publication_status <> 'published' then raise exception 'Topic is not published'; end if;
  if v_topic.type <> 'information' and v_topic.participation_status <> 'open' then
    raise exception 'Participation is closed';
  end if;
  if v_topic.participation_starts_at is not null and now() < v_topic.participation_starts_at then
    raise exception 'Participation has not started';
  end if;
  if v_topic.participation_ends_at is not null and now() >= v_topic.participation_ends_at then
    raise exception 'Participation is closed';
  end if;

  select count(distinct selected.option_id) into v_distinct_count
    from unnest(coalesce(p_option_ids, '{}'::uuid[])) as selected(option_id);
  select count(*) into v_valid_count from public.topic_options
    where topic_id = p_topic_id and id = any(coalesce(p_option_ids, '{}'::uuid[]));
  if v_distinct_count <> v_valid_count then raise exception 'Invalid topic option'; end if;
  if v_topic.selection_mode = 'single' and v_distinct_count > 1 then raise exception 'Only one option may be selected'; end if;

  delete from public.topic_selections where topic_id = p_topic_id and user_id = v_user_id;
  insert into public.topic_selections (topic_id, option_id, user_id)
    select p_topic_id, selected.option_id, v_user_id
    from (
      select distinct option_id
      from unnest(coalesce(p_option_ids, '{}'::uuid[])) as values_to_select(option_id)
    ) selected;
end;
$$;

create or replace function public.get_topic_results(p_topic_id uuid)
returns table (
  option_id uuid,
  option_key text,
  option_label text,
  position integer,
  selection_count bigint,
  participant_count bigint,
  percentage numeric
) language plpgsql stable security definer set search_path = '' as $$
declare v_mode public.selection_mode;
begin
  if not public.can_read_topic(p_topic_id, auth.uid()) then raise exception 'Topic not available'; end if;
  select selection_mode into v_mode from public.topics where id = p_topic_id;
  return query
    with totals as (
      select count(distinct s.user_id)::bigint as participants,
             count(*)::bigint as selections
      from public.topic_selections s where s.topic_id = p_topic_id
    )
    select o.id, o.key, o.label, o.position,
      count(s.user_id)::bigint,
      totals.participants,
      case when (case when v_mode = 'single' then totals.selections else totals.participants end) = 0 then 0::numeric
        else round(count(s.user_id)::numeric * 100 /
          (case when v_mode = 'single' then totals.selections else totals.participants end), 1)
      end
    from public.topic_options o
    cross join totals
    left join public.topic_selections s on s.topic_id = o.topic_id and s.option_id = o.id
    where o.topic_id = p_topic_id
    group by o.id, o.key, o.label, o.position, totals.participants, totals.selections
    order by o.position;
end;
$$;

create or replace function public.get_topic_comments(p_topic_id uuid)
returns table (
  id uuid, parent_comment_id uuid, author_id uuid, author_name text, body text,
  edited_at timestamptz, deleted_at timestamptz, created_at timestamptz
) language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.can_read_topic(p_topic_id, auth.uid()) then raise exception 'Topic not available'; end if;
  return query
    select c.id, c.parent_comment_id,
      case when c.deleted_at is null then c.user_id else null end,
      case when c.deleted_at is null then public.public_display_name(c.user_id) else null end,
      c.body, c.edited_at, c.deleted_at, c.created_at
    from public.topic_comments c
    where c.topic_id = p_topic_id and c.hidden_at is null
    order by c.created_at;
end;
$$;

create or replace function public.create_topic_comment(p_topic_id uuid, p_body text, p_parent_comment_id uuid default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.can_read_topic(p_topic_id, auth.uid()) then raise exception 'Topic not available'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid()) then raise exception 'Profile required'; end if;
  if p_parent_comment_id is not null and not exists (
    select 1 from public.topic_comments where id = p_parent_comment_id and topic_id = p_topic_id
  ) then raise exception 'Invalid parent comment'; end if;
  insert into public.topic_comments (topic_id, user_id, parent_comment_id, body)
    values (p_topic_id, auth.uid(), p_parent_comment_id, btrim(p_body)) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.edit_topic_comment(p_comment_id uuid, p_body text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.topic_comments set body = btrim(p_body), edited_at = now()
  where id = p_comment_id and user_id = auth.uid() and deleted_at is null and hidden_at is null;
  if not found then raise exception 'Comment cannot be edited'; end if;
end;
$$;

create or replace function public.delete_topic_comment(p_comment_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.topic_comments set body = null, deleted_at = now()
  where id = p_comment_id and user_id = auth.uid() and deleted_at is null;
  if not found then raise exception 'Comment cannot be deleted'; end if;
end;
$$;

create or replace function public.hide_topic_comment(p_comment_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_community_id uuid;
begin
  select t.community_id into v_community_id from public.topic_comments c
    join public.topics t on t.id = c.topic_id where c.id = p_comment_id;
  if not public.is_community_admin(v_community_id, auth.uid()) then raise exception 'Admin access required'; end if;
  update public.topic_comments set hidden_at = now(), hidden_by = auth.uid() where id = p_comment_id;
end;
$$;

create or replace function public.admin_upsert_membership(
  p_community_id uuid, p_username text, p_role public.community_role default 'member', p_verified boolean default true
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid; v_id uuid;
begin
  if not public.is_community_admin(p_community_id, auth.uid()) then raise exception 'Admin access required'; end if;
  select id into v_user_id from public.profiles where username = p_username::extensions.citext;
  if v_user_id is null then raise exception 'Profile not found'; end if;
  if p_role = 'admin' and not p_verified then raise exception 'Admins must be verified'; end if;
  insert into public.memberships (community_id, user_id, role, verified_at, verified_by)
    values (p_community_id, v_user_id, p_role, case when p_verified then now() end, case when p_verified then auth.uid() end)
  on conflict (community_id, user_id) do update set
    role = excluded.role, verified_at = excluded.verified_at, verified_by = excluded.verified_by
  returning id into v_id;
  return v_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.communities enable row level security;
alter table public.memberships enable row level security;
alter table public.places enable row level security;
alter table public.topics enable row level security;
alter table public.topic_options enable row level security;
alter table public.topic_selections enable row level security;
alter table public.topic_comments enable row level security;
alter table public.topic_attachments enable row level security;
alter table public.topic_updates enable row level security;

create policy profiles_own_select on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_own_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_own_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy communities_authenticated_read on public.communities for select to authenticated using (true);
create policy communities_public_topic_read on public.communities for select to anon using (
  exists (select 1 from public.topics t where t.community_id = id and t.visibility = 'public' and t.publication_status = 'published')
);
create policy memberships_own_read on public.memberships for select to authenticated using (user_id = auth.uid() or public.is_community_admin(community_id));

create policy places_read on public.places for select to anon, authenticated using (
  exists (select 1 from public.topics t where t.place_id = id and public.can_read_topic(t.id))
  or public.is_community_admin(community_id)
);
create policy places_admin_write on public.places for all to authenticated using (public.is_community_admin(community_id)) with check (public.is_community_admin(community_id));

create policy topics_read on public.topics for select to anon, authenticated using (public.can_read_topic(id));
create policy topics_admin_insert on public.topics for insert to authenticated with check (public.is_community_admin(community_id));
create policy topics_admin_update on public.topics for update to authenticated using (public.is_community_admin(community_id)) with check (public.is_community_admin(community_id));
create policy topics_admin_delete on public.topics for delete to authenticated using (public.is_community_admin(community_id));

create policy topic_options_read on public.topic_options for select to anon, authenticated using (public.can_read_topic(topic_id));
create policy topic_options_admin_write on public.topic_options for all to authenticated using (
  exists (select 1 from public.topics t where t.id = topic_id and public.is_community_admin(t.community_id))
) with check (exists (select 1 from public.topics t where t.id = topic_id and public.is_community_admin(t.community_id)));

create policy topic_selections_own_read on public.topic_selections for select to authenticated using (user_id = auth.uid() and public.can_read_topic(topic_id));
create policy topic_comments_admin_read on public.topic_comments for select to authenticated using (
  exists (select 1 from public.topics t where t.id = topic_id and public.is_community_admin(t.community_id))
);

create policy topic_attachments_read on public.topic_attachments for select to anon, authenticated using (public.can_read_topic(topic_id));
create policy topic_attachments_admin_write on public.topic_attachments for all to authenticated using (
  exists (select 1 from public.topics t where t.id = topic_id and public.is_community_admin(t.community_id))
) with check (exists (select 1 from public.topics t where t.id = topic_id and public.is_community_admin(t.community_id)));

create policy topic_updates_read on public.topic_updates for select to anon, authenticated using (public.can_read_topic(topic_id));
create policy topic_updates_admin_write on public.topic_updates for all to authenticated using (
  exists (select 1 from public.topics t where t.id = topic_id and public.is_community_admin(t.community_id))
) with check (exists (select 1 from public.topics t where t.id = topic_id and public.is_community_admin(t.community_id)));

revoke all on function public.public_display_name(uuid) from public;
revoke all on function public.set_topic_selections(uuid, uuid[]) from public;
grant execute on function public.set_topic_selections(uuid, uuid[]) to authenticated;
revoke all on function public.get_topic_results(uuid) from public;
grant execute on function public.get_topic_results(uuid) to anon, authenticated;
revoke all on function public.get_topic_comments(uuid) from public;
grant execute on function public.get_topic_comments(uuid) to anon, authenticated;
revoke all on function public.create_topic_comment(uuid, text, uuid) from public;
grant execute on function public.create_topic_comment(uuid, text, uuid) to authenticated;
revoke all on function public.edit_topic_comment(uuid, text) from public;
grant execute on function public.edit_topic_comment(uuid, text) to authenticated;
revoke all on function public.delete_topic_comment(uuid) from public;
grant execute on function public.delete_topic_comment(uuid) to authenticated;
revoke all on function public.hide_topic_comment(uuid) from public;
grant execute on function public.hide_topic_comment(uuid) to authenticated;
revoke all on function public.admin_upsert_membership(uuid, text, public.community_role, boolean) from public;
grant execute on function public.admin_upsert_membership(uuid, text, public.community_role, boolean) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('topic-attachments', 'topic-attachments', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy topic_storage_read on storage.objects for select to anon, authenticated using (
  bucket_id = 'topic-attachments' and exists (
    select 1 from public.topic_attachments a where a.storage_path = name and public.can_read_topic(a.topic_id)
  )
);
create policy topic_storage_admin_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'topic-attachments' and exists (
    select 1 from public.topics t
    where t.id::text = (storage.foldername(name))[1] and public.is_community_admin(t.community_id)
  )
);
create policy topic_storage_admin_update on storage.objects for update to authenticated using (
  bucket_id = 'topic-attachments' and exists (
    select 1 from public.topics t
    where t.id::text = (storage.foldername(name))[1] and public.is_community_admin(t.community_id)
  )
);
create policy topic_storage_admin_delete on storage.objects for delete to authenticated using (
  bucket_id = 'topic-attachments' and exists (
    select 1 from public.topics t
    where t.id::text = (storage.foldername(name))[1] and public.is_community_admin(t.community_id)
  )
);
