# Agora Product V0.1

## Product Idea

Agora connects a physical place with a concrete digital participation topic.

Core flow:

```text
Physical place -> QR/link -> topic -> participation -> discussion -> decision -> result
```

Agora is not a social network, chat, open forum, club administration suite, booking system, event platform, or member-management tool.

## V0.1 Use Case

An administrator creates a topic, for example:

> Neue Sitzbank zwischen Platz 2 und 3?

A member scans a QR code or opens a direct link and lands directly on the topic page. The page explains the context and allows a simple reaction plus an optional comment.

## Topic Page Content

- Title
- Description and context
- Optional image
- Community
- Location
- Participation period
- Current status
- Reaction summary
- Comments
- Published result or update once available

## Participation Options

- Gute Idee
- Unentschieden
- Sehe ich kritisch

Comments are optional and attached to a concrete topic.

## Topic Lifecycle

```text
Offen -> Wird ausgewertet -> Entschieden -> Umgesetzt
```

Administrators can change status. For `Entschieden` and `Umgesetzt`, they should publish a visible result or update.

## MVP Boundary

Included:

- Multi-community-ready data model
- Admin-created topics
- Public topic reading by direct URL
- Authenticated reactions
- Authenticated comments
- Status lifecycle
- Admin result/update publishing
- Basic participation and comment display

Excluded from V0.1:

- Chat
- Direct messages
- Work-hour administration
- Court booking
- Events
- Full member management
- Member-created public topics
- General forum index as the primary experience
- Social feed mechanics

## Open Product Decisions

- Should reactions be limited to one per user per topic, and can users change them later?
- Are comments visible immediately or moderated before publication?
- Can anonymous visitors react after lightweight verification, or only authenticated members?
- Which authentication method is best for the pilot: email magic link, password, invite-only accounts, or club-managed allowlist?
- Should public topic URLs use numeric IDs, slugs, or short QR-safe tokens?
- Should the topic page show exact counts, percentages, or both?
- Should comments support display names, real names, or pseudonyms?
- Who may read draft topics before publication?
- Does `Umgesetzt` require evidence such as a photo or only a text update?

