# AGENTS.md

## Project

Agora is an open-source platform for digital participation in real-world communities such as clubs, neighborhoods, and cooperatives.

The V0.1 product scope is deliberately narrow: administrators create participation topics; members and visitors reach a concrete topic through a QR code or direct link; reading is public; reactions and optional comments require authentication only when the user acts.

## Technical Direction

- Next.js with TypeScript
- Tailwind CSS
- Supabase for database and authentication
- Vercel for deployment
- Multi-community data model from the beginning

## Working Principles

- Keep the first implementation focused on one complete use case.
- Do not build social-network, chat, event, booking, member-management, or open-forum features in V0.1.
- Prefer clear server-side boundaries for data access and authorization.
- Reading public topic pages must not force login.
- Authentication should appear only at the point of action.
- Never commit secrets, credentials, API keys, `.env` files, Supabase service-role keys, or local personal files.
- Keep migrations, schema changes, and product decisions documented.

## Development Notes

- Use `main` as the primary branch.
- Add or update documentation when product or architecture decisions change.
- Keep components small and route-oriented until repeated patterns justify extraction.
- Treat public pages as shareable URLs intended for QR codes.

