begin;
select plan(21);

select has_table('public', 'profiles', 'public.profiles should exist');
select has_table('public', 'communities', 'public.communities should exist');
select has_table('public', 'memberships', 'public.memberships should exist');
select has_table('public', 'places', 'public.places should exist');
select has_table('public', 'topics', 'public.topics should exist');
select has_table('public', 'topic_options', 'public.topic_options should exist');
select has_table('public', 'topic_selections', 'public.topic_selections should exist');
select has_table('public', 'topic_comments', 'public.topic_comments should exist');
select has_table('public', 'topic_attachments', 'public.topic_attachments should exist');
select has_table('public', 'topic_updates', 'public.topic_updates should exist');
select has_column('public', 'communities', 'member_visibility_label', 'communities should have a tenant-specific visibility label');
select has_column('public', 'communities', 'member_visibility_help_text', 'communities should have tenant-specific visibility help text');

select has_function('public', 'set_topic_selections', array['uuid', 'uuid[]']);
select has_function('public', 'get_topic_results', array['uuid']);
select has_function('public', 'get_topic_comments', array['uuid']);
select has_function('public', 'create_topic_comment', array['uuid', 'text', 'uuid']);
select has_function('public', 'delete_topic_comment', array['uuid']);
select has_function('public', 'admin_upsert_membership', array['uuid', 'text', 'community_role', 'boolean']);
select has_function('public', 'admin_replace_vote_options', array['uuid', 'text[]']);

select policies_are(
  'public', 'topics',
  array['topics_admin_delete', 'topics_admin_insert', 'topics_admin_update', 'topics_read']
);
select policies_are(
  'public', 'profiles',
  array['profiles_own_insert', 'profiles_own_select', 'profiles_own_update']
);

select * from finish();
rollback;
