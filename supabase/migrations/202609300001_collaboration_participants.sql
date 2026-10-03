create or replace function public.get_collaboration_participants(p_topic_id uuid)
returns table (
  option_id uuid,
  option_key text,
  option_label text,
  participant_name text
) language plpgsql stable security definer set search_path = '' as $$
declare
  v_topic public.topics%rowtype;
begin
  select * into v_topic from public.topics where id = p_topic_id;

  if not found or v_topic.type <> 'collaboration' or v_topic.publication_status <> 'published' then
    raise exception 'Participant names unavailable';
  end if;

  if auth.uid() is null or not exists (
    select 1
    from public.memberships m
    where m.community_id = v_topic.community_id
      and m.user_id = auth.uid()
      and m.verified_at is not null
  ) then
    raise exception 'Verified community membership required';
  end if;

  return query
    select o.id, o.key, o.label, public.public_display_name(s.user_id)
    from public.topic_selections s
    join public.topic_options o
      on o.topic_id = s.topic_id and o.id = s.option_id
    where s.topic_id = p_topic_id
    order by o.position, lower(public.public_display_name(s.user_id));
end;
$$;

revoke all on function public.get_collaboration_participants(uuid) from public, anon, authenticated;
grant execute on function public.get_collaboration_participants(uuid) to authenticated;
