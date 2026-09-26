# Agora Architecture V0.1

## Current Project State

As of the initial project setup, the repository contained no application files and no Git repository. The V0.1 architecture below is therefore a proposed starting point rather than an analysis of existing implementation decisions.

## Information Architecture

Primary objects:

- Community: a real-world group such as a tennis club, neighborhood, or cooperative
- Place: an optional physical location within a community
- Topic: a concrete participation question connected to a community and optionally a place
- Reaction: one user's simple stance on a topic
- Comment: optional written feedback on a topic
- Topic update: official admin-published result or implementation update
- Membership: relation between users and communities with a role

## User Flow

### Visitor or Member Reading

1. User scans a QR code or opens a direct link.
2. User lands directly on the topic page.
3. User reads topic context, status, participation period, reaction summary, comments, and official updates.
4. No login is required for reading.

### Member Participating

1. User chooses a reaction.
2. If unauthenticated, the app asks for authentication at this moment.
3. After authentication, the user returns to the same topic and the intended action can continue.
4. User submits or updates their reaction.
5. User may optionally add a comment.

### Administrator Managing

1. Admin opens a protected admin area.
2. Admin creates or edits a topic.
3. Admin publishes a QR-safe topic URL.
4. Admin reviews participation.
5. Admin changes status.
6. Admin publishes an official result or implementation update.

## Proposed Routes

Public:

- `/t/[topicSlug]` - public topic page optimized for QR/direct links
- `/c/[communitySlug]` - optional public community overview, not central for V0.1

Authenticated member actions:

- `/auth/sign-in` - sign-in entry point with redirect back to topic
- Server actions or route handlers for reaction and comment submission

Admin:

- `/admin` - admin topic overview
- `/admin/topics/new` - create topic
- `/admin/topics/[topicId]` - edit topic, status, result, and updates

API or route handlers:

- `POST /api/topics/[topicId]/reaction`
- `POST /api/topics/[topicId]/comments`
- `POST /api/admin/topics`
- `PATCH /api/admin/topics/[topicId]`

Prefer Next.js server actions if the chosen app structure and Supabase auth helpers make them simpler and testable.

## Components

Topic page:

- `TopicHeader`
- `TopicStatusBadge`
- `TopicMeta`
- `TopicImage`
- `ParticipationPanel`
- `ReactionButtons`
- `ReactionSummary`
- `CommentForm`
- `CommentList`
- `OfficialUpdateList`

Admin:

- `AdminShell`
- `TopicTable`
- `TopicForm`
- `StatusSelect`
- `OfficialUpdateForm`
- `QrLinkPanel`

Shared UI:

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Badge`
- `Card`
- `EmptyState`
- `AuthGate`

## Supabase Data Model

Recommended enums:

```sql
create type topic_status as enum ('open', 'evaluating', 'decided', 'implemented');
create type reaction_value as enum ('positive', 'neutral', 'critical');
create type community_role as enum ('admin', 'member');
```

Recommended tables:

- `communities`
  - `id uuid primary key`
  - `name text not null`
  - `slug text not null unique`
  - `created_at timestamptz not null default now()`

- `places`
  - `id uuid primary key`
  - `community_id uuid not null references communities(id)`
  - `name text not null`
  - `description text`
  - `created_at timestamptz not null default now()`

- `memberships`
  - `id uuid primary key`
  - `community_id uuid not null references communities(id)`
  - `user_id uuid not null references auth.users(id)`
  - `role community_role not null default 'member'`
  - `created_at timestamptz not null default now()`
  - unique `(community_id, user_id)`

- `topics`
  - `id uuid primary key`
  - `community_id uuid not null references communities(id)`
  - `place_id uuid references places(id)`
  - `title text not null`
  - `slug text not null`
  - `description text not null`
  - `context text`
  - `image_url text`
  - `status topic_status not null default 'open'`
  - `participation_starts_at timestamptz`
  - `participation_ends_at timestamptz`
  - `published_at timestamptz`
  - `created_by uuid references auth.users(id)`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
  - unique `(community_id, slug)`

- `topic_reactions`
  - `id uuid primary key`
  - `topic_id uuid not null references topics(id)`
  - `user_id uuid not null references auth.users(id)`
  - `value reaction_value not null`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
  - unique `(topic_id, user_id)`

- `topic_comments`
  - `id uuid primary key`
  - `topic_id uuid not null references topics(id)`
  - `user_id uuid not null references auth.users(id)`
  - `body text not null`
  - `is_hidden boolean not null default false`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`

- `topic_updates`
  - `id uuid primary key`
  - `topic_id uuid not null references topics(id)`
  - `created_by uuid references auth.users(id)`
  - `title text not null`
  - `body text not null`
  - `published_at timestamptz not null default now()`

## Roles and Permissions

Public visitor:

- Can read published topics, visible comments, reaction summaries, and official updates.
- Cannot react or comment without authentication.

Member:

- Can read published topics.
- Can create or update own reaction.
- Can create comments.
- Can edit or delete own comment only if V0.1 explicitly includes that UX; otherwise defer.

Admin:

- Can create, update, publish, and archive topics in their community.
- Can change topic status.
- Can publish official updates.
- Can hide comments.
- Cannot administer other communities.

System/service role:

- Reserved for trusted backend operations only.
- Must never be exposed to the browser.

## Authentication Strategy

- Reading public topic pages should use anonymous/public Supabase access with row-level security.
- Login is triggered only for concrete actions: reacting, commenting, or admin access.
- Use Supabase Auth with email magic link for the pilot unless the team chooses invite-only password accounts.
- Always carry a `redirectTo` parameter so users return to the topic after sign-in.
- Gate writes with both application checks and Supabase RLS.
- Keep admin authorization based on `memberships.role = 'admin'`.

## Suggested Project Structure

```text
.
├── AGENTS.md
├── docs/
│   ├── product-v0.1.md
│   └── architecture-v0.1.md
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   ├── (auth)/
│   │   │   └── auth/
│   │   └── t/
│   │       └── [topicSlug]/
│   ├── components/
│   │   ├── admin/
│   │   ├── topic/
│   │   └── ui/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── auth/
│   │   └── dates.ts
│   └── types/
└── tests/
```

## Implementation Steps

1. Scaffold Next.js, TypeScript, Tailwind, linting, and basic app shell.
2. Add Supabase client helpers for browser, server, and middleware contexts.
3. Create initial Supabase migrations for communities, places, memberships, topics, reactions, comments, and updates.
4. Add RLS policies for public reads, member writes, and community admin management.
5. Build public topic route `/t/[topicSlug]`.
6. Add reaction submission with auth redirect and one reaction per user/topic.
7. Add comment submission and visible comment list.
8. Build minimal admin topic creation and edit flow.
9. Add status transitions and official result/update publishing.
10. Add QR/link panel for published topic URLs.
11. Add seed data for the tennis club pilot.
12. Add focused tests for permissions, topic rendering, reaction constraints, and auth redirects.
13. Prepare Vercel and Supabase environment documentation.

