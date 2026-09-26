begin;
select plan(18);

select has_table('public', 'profiles');
select has_table('public', 'communities');
select has_table('public', 'memberships');
select has_table('public', 'places');
select has_table('public', 'topics');
select has_table('public', 'topic_options');
select has_table('public', 'topic_selections');
select has_table('public', 'topic_comments');
select has_table('public', 'topic_attachments');
select has_table('public', 'topic_updates');

select has_function('public', 'set_topic_selections', array['uuid', 'uuid[]']);
select has_function('public', 'get_topic_results', array['uuid']);
select has_function('public', 'get_topic_comments', array['uuid']);
select has_function('public', 'create_topic_comment', array['uuid', 'text', 'uuid']);
select has_function('public', 'delete_topic_comment', array['uuid']);
select has_function('public', 'admin_upsert_membership', array['uuid', 'text', 'community_role', 'boolean']);

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
