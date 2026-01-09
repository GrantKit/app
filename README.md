# GrantKit App

The web application for GrantKit - manage and sync grant proposals with your local file system.

## Features

- **Google OAuth** - Sign in with your Google account
- **Grant management** - Create, edit, and track grant proposals
- **Collaboration** - Share grants with team members
- **Sync** - Two-way sync between web and local markdown files

## Tech stack

- React 19 + Vite
- Supabase (auth + database)
- TailwindCSS

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build
```

## Environment variables

Copy `.env.example` to `.env` and configure:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Related repos

- [grantkit](https://github.com/GrantKit/grantkit) - Python CLI for local sync
- [website](https://github.com/GrantKit/website) - Marketing site at grantkit.io
