alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.is_community_member(uuid) to anon, authenticated;
grant execute on function public.is_community_admin(uuid) to authenticated;
grant execute on function public.can_read_topic(uuid) to anon, authenticated;
grant execute on function public.set_topic_selections(uuid, uuid[]) to authenticated;
grant execute on function public.get_topic_results(uuid) to anon, authenticated;
grant execute on function public.get_topic_comments(uuid) to anon, authenticated;
grant execute on function public.create_topic_comment(uuid, text, uuid) to authenticated;
grant execute on function public.edit_topic_comment(uuid, text) to authenticated;
grant execute on function public.delete_topic_comment(uuid) to authenticated;
grant execute on function public.hide_topic_comment(uuid) to authenticated;
grant execute on function public.admin_upsert_membership(uuid, text, public.community_role, boolean) to authenticated;
grant execute on function public.admin_replace_vote_options(uuid, text[]) to authenticated;
