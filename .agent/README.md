# in-seoul Documentation Index

> Central hub for all project documentation

## Project Status

**Current Phase**: Active Development
**Last Updated**: 2025-12-06

---

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
# Fill in the required values in .env

# Push database schema to Supabase
bun db:push

# Run development server
bun dev

# Run tests
bun test          # Unit tests (Vitest)
bun test:e2e      # E2E tests (Playwright)
```

---

## Documentation Index

### System Documentation

| Document | Description |
|----------|-------------|
| [Project Architecture](./System/project_architecture.md) | Tech stack, project structure, API routes, environment variables, integration points |
| [Database Schema](./System/database_schema.md) | ER diagram, table definitions, relationships, Drizzle usage examples |

### Tasks & PRDs

| Document | Description |
|----------|-------------|
| *Coming soon* | PRDs will be added as features are defined |

### Standard Operating Procedures (SOP)

| Document | Description |
|----------|-------------|
| [Coding Patterns](./SOP/coding_patterns.md) | Service pattern, repository pattern, Server/Client components, TypeScript patterns, testing |

### External API Documentation

| Document | Description |
|----------|-------------|
| [AI SDK + OpenAI Responses API](./external_APIs/ai_sdk_openai_response_api.md) | Vercel AI SDK 6 beta integration with OpenAI Responses API, file search, web search |
| [OpenAI File Search](./external_APIs/openai_file_search.md) | File search tool usage and configuration |
| [OpenAI Retrieval](./external_APIs/openai_retreival.md) | Vector store and semantic search documentation |

---

## Tech Stack Summary

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.1.0 (App Router + Turbopack) |
| Language | TypeScript 5.7.2 (Strict mode) |
| Styling | Tailwind CSS 4.0 + shadcn/ui (new-york) |
| Database | PostgreSQL (Supabase) via Drizzle ORM |
| Auth | better-auth (Google + Kakao OAuth) |
| AI | Vercel AI SDK 6 Beta + OpenAI (GPT-5.1, Responses API) |
| Vector Store | OpenAI File Search + Vector Stores |
| Testing | Vitest + React Testing Library + Playwright |
| Package Manager | bun |

---

## Key Files Reference

| Purpose | File Location |
|---------|---------------|
| Database schema | `src/lib/db/schema.ts` |
| Auth config (server) | `src/lib/auth.ts` |
| Auth hooks (client) | `src/lib/auth-client.ts` |
| AI models config | `src/lib/ai.ts` |
| Vector store service | `src/lib/services/vector-store.service.ts` |
| Theme provider | `src/components/providers.tsx` |
| Global styles | `src/app/globals.css` |
| Environment template | `.env.example` |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...all]` | GET, POST | Authentication flows |
| `/api/ai/chat` | POST | AI chat streaming |

---

## NPM Scripts

| Command | Purpose |
|---------|---------|
| `bun dev` | Start dev server with Turbopack |
| `bun run build` | Production build |
| `bun test` | Run unit tests |
| `bun test:e2e` | Run E2E tests |
| `bun db:push` | Push schema to database |
| `bun db:studio` | Open Drizzle Studio |
| `bun lint` | Run ESLint |
| `bun vs:create <name>` | Create OpenAI vector store |
| `bun vs:manage <cmd>` | Manage vector store files (uses `OPENAI_VECTOR_STORE_ID` from .env) |
| `bun vs:query "prompt"` | Query with file search (uses `OPENAI_VECTOR_STORE_ID` from .env) |

---

## Directory Structure

```
.agent/
├── README.md                           # This file
├── System/
│   ├── project_architecture.md         # Full architecture doc
│   └── database_schema.md              # Database ER diagram & tables
├── Tasks/                              # PRDs & implementation plans
├── SOP/
│   └── coding_patterns.md              # Patterns & best practices
└── external_APIs/                      # External API documentation
    ├── ai_sdk_openai_response_api.md   # AI SDK 6 + OpenAI Responses API
    ├── openai_file_search.md           # OpenAI File Search tool
    └── openai_retreival.md             # OpenAI Vector Store retrieval
```

---

## Getting Started Guide

1. **New to the project?** Start with [Project Architecture](./System/project_architecture.md)
2. **Setting up locally?** Follow Quick Start above
3. **Building a feature?** Check [Tasks/](./Tasks/) for PRDs
4. **Need how-to guides?** See [SOP/](./SOP/) for procedures

---

## Documentation Guidelines

- Keep documentation concise and actionable
- Update docs when making significant changes
- Each doc should have a "Related Documentation" section
- Avoid duplication - link to existing docs instead
- Include file paths for easy navigation
