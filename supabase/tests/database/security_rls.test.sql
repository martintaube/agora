begin;
select plan(20);

insert into auth.users (id, email, raw_user_meta_data) values
  ('91000000-0000-0000-0000-000000000001', 'registered@example.invalid', '{}'),
  ('91000000-0000-0000-0000-000000000002', 'member@example.invalid', '{}'),
  ('91000000-0000-0000-0000-000000000003', 'admin-a@example.invalid', '{}'),
  ('91000000-0000-0000-0000-000000000004', 'admin-b@example.invalid', '{}');

insert into public.profiles (id, first_name, last_name, username) values
  ('91000000-0000-0000-0000-000000000001', 'Registered', 'Person', 'registered-test'),
  ('91000000-0000-0000-0000-000000000002', 'Member', 'Person', 'member-test'),
  ('91000000-0000-0000-0000-000000000003', 'Admin', 'Alpha', 'admin-alpha'),
  ('91000000-0000-0000-0000-000000000004', 'Admin', 'Beta', 'admin-beta');

insert into public.communities (id, name, slug) values
  ('92000000-0000-0000-0000-000000000001', 'Test Community A', 'test-a'),
  ('92000000-0000-0000-0000-000000000002', 'Test Community B', 'test-b');

insert into public.memberships (community_id, user_id, role, verified_at, verified_by) values
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', 'member', null, null),
  ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000003', 'admin', now(), '91000000-0000-0000-0000-000000000003'),
  ('92000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000004', 'admin', now(), '91000000-0000-0000-0000-000000000004');

insert into public.topics (
  id, community_id, type, visibility, title, slug, content, selection_mode,
  publication_status, participation_status, published_at, created_by
) values
  ('93000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', 'opinion', 'public', 'Public A', 'public-a', 'Public topic', 'single', 'published', 'open', now(), '91000000-0000-0000-0000-000000000003'),
  ('93000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000001', 'vote', 'community', 'Community A', 'community-a', 'Community topic A', 'multiple', 'published', 'open', now(), '91000000-0000-0000-0000-000000000003'),
  ('93000000-0000-0000-0000-000000000003', '92000000-0000-0000-0000-000000000002', 'vote', 'community', 'Community B', 'community-b', 'Community topic B', 'single', 'published', 'open', now(), '91000000-0000-0000-0000-000000000004'),
  ('93000000-0000-0000-0000-000000000004', '92000000-0000-0000-0000-000000000001', 'information', 'community', 'Draft A', 'draft-a', 'Draft topic A', 'multiple', 'draft', null, null, '91000000-0000-0000-0000-000000000003');

insert into public.topic_options (id, topic_id, key, label, position) values
  ('94000000-0000-0000-0000-000000000001', '93000000-0000-0000-0000-000000000001', 'positive', 'Gute Idee', 0),
  ('94000000-0000-0000-0000-000000000002', '93000000-0000-0000-0000-000000000001', 'critical', 'Kritisch', 1),
  ('94000000-0000-0000-0000-000000000003', '93000000-0000-0000-0000-000000000002', 'one', 'Option 1', 0),
  ('94000000-0000-0000-0000-000000000004', '93000000-0000-0000-0000-000000000002', 'two', 'Option 2', 1),
  ('94000000-0000-0000-0000-000000000005', '93000000-0000-0000-0000-000000000003', 'one', 'Option 1', 0);

insert into public.topic_attachments (id, topic_id, storage_path, file_name, mime_type) values
  ('95000000-0000-0000-0000-000000000001', '93000000-0000-0000-0000-000000000001', '93000000-0000-0000-0000-000000000001/public.pdf', 'public.pdf', 'application/pdf'),
  ('95000000-0000-0000-0000-000000000002', '93000000-0000-0000-0000-000000000002', '93000000-0000-0000-0000-000000000002/community.pdf', 'community.pdf', 'application/pdf'),
  ('95000000-0000-0000-0000-000000000003', '93000000-0000-0000-0000-000000000003', '93000000-0000-0000-0000-000000000003/private.pdf', 'private.pdf', 'application/pdf');

insert into storage.objects (bucket_id, name) values
  ('topic-attachments', '93000000-0000-0000-0000-000000000001/public.pdf'),
  ('topic-attachments', '93000000-0000-0000-0000-000000000002/community.pdf'),
  ('topic-attachments', '93000000-0000-0000-0000-000000000003/private.pdf');

set local role anon;
select results_eq(
  $$select count(*)::bigint from public.topics where id::text like '93000000-%'$$,
  $$values (1::bigint)$$,
  'Guests see only published public topics'
);
select results_eq(
  $$select count(*)::bigint from public.profiles$$,
  $$values (0::bigint)$$,
  'Official profiles are not public'
);
select ok(
  not has_function_privilege('anon', 'public.public_display_name(uuid)', 'execute'),
  'Anonymous callers cannot query display names for arbitrary users'
);
select results_eq(
  $$select count(*)::bigint from public.topic_attachments$$,
  $$values (1::bigint)$$,
  'Guests see attachment metadata only for public topics'
);
select results_eq(
  $$select count(*)::bigint from storage.objects where bucket_id = 'topic-attachments'$$,
  $$values (1::bigint)$$,
  'Guests see storage objects only for public topics'
);
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '91000000-0000-0000-0000-000000000001';
select results_eq(
  $$select count(*)::bigint from public.topics where id::text like '93000000-%'$$,
  $$values (1::bigint)$$,
  'Registered non-members cannot read community topics'
);
select lives_ok(
  $$select public.set_topic_selections('93000000-0000-0000-0000-000000000001', array['94000000-0000-0000-0000-000000000001']::uuid[])$$,
  'Registered users can participate in public topics'
);
select results_eq(
  $$select count(*)::bigint from public.topic_selections where user_id = auth.uid()$$,
  $$values (1::bigint)$$,
  'Users can read their own selection'
);
select throws_ok(
  $$insert into public.topic_selections (topic_id, option_id, user_id) values ('93000000-0000-0000-0000-000000000001', '94000000-0000-0000-0000-000000000002', auth.uid())$$,
  '42501', null,
  'Direct selection writes are denied by RLS'
);
reset role;

set local role anon;
select results_eq(
  $$select selection_count, participant_count from public.get_topic_results('93000000-0000-0000-0000-000000000001') where option_key = 'positive'$$,
  $$values (1::bigint, 1::bigint)$$,
  'Public result aggregation exposes counts, not voters'
);
select results_eq(
  $$select count(*)::bigint from public.topic_selections$$,
  $$values (0::bigint)$$,
  'Guests cannot read individual selections'
);
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '91000000-0000-0000-0000-000000000002';
select results_eq(
  $$select count(*)::bigint from public.topics where id = '93000000-0000-0000-0000-000000000002'$$,
  $$values (1::bigint)$$,
  'Community members can read their community topic'
);
select results_eq(
  $$select count(*)::bigint from storage.objects where bucket_id = 'topic-attachments'$$,
  $$values (2::bigint)$$,
  'Community members see public and own-community storage, but not other communities'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('topic-attachments', '93000000-0000-0000-0000-000000000002/member-upload.pdf')$$,
  '42501', null,
  'Community members cannot upload topic attachments'
);
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '91000000-0000-0000-0000-000000000003';
select results_eq(
  $$update public.topics set title = 'Updated by A' where id = '93000000-0000-0000-0000-000000000002' returning id$$,
  $$values ('93000000-0000-0000-0000-000000000002'::uuid)$$,
  'Admins can update topics in their own community'
);
select is_empty(
  $$update public.topics set title = 'Cross-community update' where id = '93000000-0000-0000-0000-000000000003' returning id$$,
  'Admins cannot update topics in another community'
);
select lives_ok(
  $$insert into storage.objects (bucket_id, name) values ('topic-attachments', '93000000-0000-0000-0000-000000000002/admin-upload.pdf')$$,
  'Admins can upload attachments to topics in their own community'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('topic-attachments', '93000000-0000-0000-0000-000000000003/cross-community.pdf')$$,
  '42501', null,
  'Admins cannot upload attachments to another community'
);
select throws_ok(
  $$select public.admin_upsert_membership('92000000-0000-0000-0000-000000000002', 'registered-test', 'member', true)$$,
  'P0001', 'Admin access required',
  'Admin RPCs enforce community boundaries'
);
select results_eq(
  $$select count(*)::bigint from public.topics where publication_status = 'draft'$$,
  $$values (1::bigint)$$,
  'Admins can read drafts in their own community'
);
reset role;

select * from finish();
rollback;
