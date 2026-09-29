-- Synthetic development and pilot data only. No real personal data is included.
insert into auth.users (id, email, raw_user_meta_data)
values (
  '10000000-0000-0000-0000-000000000001',
  'demo-admin@example.invalid',
  '{}'
) on conflict (id) do nothing;

insert into public.profiles (id, first_name, last_name, username, display_name)
values ('10000000-0000-0000-0000-000000000001', 'Demo', 'Admin', 'demo-admin', 'Demo Admin')
on conflict (id) do nothing;

insert into public.communities (id, name, slug, member_visibility_label)
values ('20000000-0000-0000-0000-000000000001', 'Lichtenberger TC', 'ltc', 'Vereinsweit')
on conflict (id) do update set member_visibility_label = excluded.member_visibility_label;

insert into public.memberships (community_id, user_id, role, verified_at, verified_by)
values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'admin', now(), '10000000-0000-0000-0000-000000000001'
) on conflict (community_id, user_id) do nothing;

insert into public.places (id, community_id, name, description)
values (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Vereinsanlage', 'Tennisanlage des Lichtenberger TC'
) on conflict (id) do nothing;

insert into public.topics (
  id, community_id, place_id, type, visibility, title, slug, guiding_question,
  content, task, selection_mode, publication_status, participation_status,
  participation_ends_at, event_starts_at, published_at, created_by
) values
  (
    '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001', 'information', 'public',
    'Frühjahrsarbeiten auf der Anlage', 'fruehjahrsarbeiten', null,
    'Die Plätze werden in den kommenden Wochen für die Saison vorbereitet.', null,
    'multiple', 'published', null, null, null, now(), '10000000-0000-0000-0000-000000000001'
  ),
  (
    '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001', 'opinion', 'public',
    'Neue Sitzbank zwischen Platz 2 und 3?', 'neue-sitzbank',
    'Sollen wir zwischen Platz 2 und 3 eine neue Sitzbank aufstellen?',
    'An dieser Stelle fehlt bislang eine Sitzmöglichkeit. Wir möchten vor der Anschaffung ein Stimmungsbild einholen.', null,
    'single', 'published', 'open', now() + interval '21 days', null, now(), '10000000-0000-0000-0000-000000000001'
  ),
  (
    '40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001', 'vote', 'community',
    'Farbe der neuen Sonnenschirme', 'sonnenschirm-farbe',
    'Welche Farbe sollen die neuen Sonnenschirme haben?',
    'Für die Terrasse werden neue Sonnenschirme angeschafft. Mehrere Farben können ausgewählt werden.', null,
    'multiple', 'published', 'open', now() + interval '14 days', null, now(), '10000000-0000-0000-0000-000000000001'
  ),
  (
    '40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001', 'collaboration', 'public',
    'Helfende Hände für den Aktionstag', 'aktionstag-helfen', null,
    'Gemeinsam machen wir die Anlage fit für die Saison.',
    'Laub entfernen, Bänke reinigen und Material verteilen.',
    'single', 'published', 'open', now() + interval '30 days', now() + interval '10 days', now(),
    '10000000-0000-0000-0000-000000000001'
  )
on conflict (id) do nothing;

insert into public.topic_options (id, topic_id, key, label, position) values
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'read', 'Gelesen', 0),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'thanks', 'Danke', 1),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'interested', 'Interessiert mich', 2),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', 'positive', 'Gute Idee', 0),
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000002', 'neutral', 'Unentschieden', 1),
  ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000002', 'critical', 'Sehe ich kritisch', 2),
  ('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000003', 'green', 'Grün', 0),
  ('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000003', 'white', 'Weiß', 1),
  ('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000003', 'yellow', 'Gelb', 2),
  ('50000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000004', 'joining', 'Ich bin dabei', 0),
  ('50000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000004', 'maybe', 'Vielleicht', 1)
on conflict (id) do nothing;
