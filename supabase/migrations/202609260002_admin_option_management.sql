create or replace function public.admin_replace_vote_options(p_topic_id uuid, p_labels text[])
returns void language plpgsql security definer set search_path = '' as $$
declare v_community_id uuid; v_type public.topic_type; v_label text; v_position integer := 0;
begin
  select community_id, type into v_community_id, v_type from public.topics where id = p_topic_id for update;
  if not found or not public.is_community_admin(v_community_id) then raise exception 'Admin access required'; end if;
  if v_type <> 'vote' then raise exception 'Only vote options are editable'; end if;
  if coalesce(array_length(p_labels, 1), 0) < 2 then raise exception 'A vote requires at least two options'; end if;
  if exists (select 1 from public.topic_selections where topic_id = p_topic_id) then raise exception 'Options cannot change after participation started'; end if;
  delete from public.topic_options where topic_id = p_topic_id;
  foreach v_label in array p_labels loop
    if char_length(btrim(v_label)) not between 1 and 120 then raise exception 'Invalid option label'; end if;
    insert into public.topic_options (topic_id, key, label, position)
      values (p_topic_id, 'option-' || (v_position + 1), btrim(v_label), v_position);
    v_position := v_position + 1;
  end loop;
end;
$$;

revoke all on function public.admin_replace_vote_options(uuid, text[]) from public, anon, authenticated;
grant execute on function public.admin_replace_vote_options(uuid, text[]) to authenticated;
