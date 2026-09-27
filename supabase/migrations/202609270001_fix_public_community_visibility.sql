create or replace function public.has_public_topic(p_community_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.topics t
    where t.community_id = p_community_id
      and t.visibility = 'public'
      and t.publication_status = 'published'
  );
$$;

revoke all on function public.has_public_topic(uuid) from public, anon, authenticated;
grant execute on function public.has_public_topic(uuid) to anon, authenticated;

drop policy communities_public_topic_read on public.communities;
create policy communities_public_topic_read on public.communities
for select to anon using (public.has_public_topic(id));
