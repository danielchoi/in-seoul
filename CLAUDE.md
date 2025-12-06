# in-seoul

## Project Overview

Next.js 15 web application with AI capabilities, OAuth authentication, and PostgreSQL database.

## Tech Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york style)
- **Database**: PostgreSQL (Supabase) via Drizzle ORM
- **Auth**: better-auth (Google + Kakao OAuth only)
- **AI**: Vercel AI SDK + OpenAI (GPT-4o)
- **Testing**: Vitest + Playwright
- **Package Manager**: bun

## Quick Commands

```bash
bun dev          # Start dev server
bun run build    # Production build
bun test         # Run unit tests
bun test:e2e     # Run E2E tests
bun db:push      # Push schema to database
bun db:studio    # Open Drizzle Studio
bun lint         # Run ESLint
```

## Key Files

| Purpose | Location |
|---------|----------|
| Database schema | `src/lib/db/schema.ts` |
| Auth config | `src/lib/auth.ts` |
| AI models | `src/lib/ai.ts` |
| API routes | `src/app/api/` |
| Components | `src/components/` |

## Documentation

All project documentation is in `.agent/` folder:

We keep all important docs in agent folder and keep updating them, structure like below
- Tasks: PRD & implementation plan for each feature
- System: Document the current state of the system (project structure, tech stack, integration points, database schema, and core functionalities such as agent architecture, LLM layer, etc.)
- SOP: Best practices of execute certain tasks (e.g. how to add a schema migration, how to add a new page route, etc.)
- README.md: an index of all the documentations we have so people know what & where to look for things
We should always update agent docs after we implement certain featrue, to make sure it fully reflect the up to date information
Before you plan any implementation, always read the •agent/README first to get context

```
.agent/
├── README.md                    # Documentation index & quick start
├── System/
│   ├── project_architecture.md  # Full architecture reference
│   └── database_schema.md       # ER diagram & table definitions
├── Tasks/                       # PRDs & implementation plans
└── SOP/
    └── coding_patterns.md       # Patterns & best practices
```

**Always read `.agent/README.md` first before planning any implementation.**

## Guidelines

- Do not change any code if we haven't discussed about it
- Always update `.agent/` docs after implementing features
- OAuth only - no email/password authentication
- Use `bunx shadcn@latest add <component>` to add UI components
- **NEVER use `any` type** - Always define explicit types or use `unknown` with type guards

## Coding Patterns

See `.agent/SOP/coding_patterns.md` for full details.

- **Service Pattern**: Separate business logic from data access for testability
  - Controllers/Actions → Services → Repositories → Database
- **Server Components**: Default for data fetching, keep client components minimal
- **TypeScript**: NEVER use `any`. Infer types from Drizzle/Zod schema, use `unknown` for external data
- **Transactions**: Pass `tx` to repositories for atomic multi-table operations
- **Testing**: Mock repositories when unit testing services