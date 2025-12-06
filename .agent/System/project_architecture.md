# Project Architecture

> **Status**: Initialized - Base project scaffolded

## Project Overview

**Project Name**: in-seoul
**Type**: Next.js Web Application
**Purpose**: TBD (to be defined based on business requirements)

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.1.0 | React framework with App Router + Turbopack |
| React | 19.0.0 | UI library |
| TypeScript | 5.7.2 | Type-safe JavaScript (Strict mode) |

### Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 4.0.0-beta.8 | Utility-first CSS framework |
| shadcn/ui | new-york style | Component library built on Radix UI |
| next-themes | 0.4.4 | Dark/light mode support |

### Database & ORM
| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | - | Primary database (Supabase hosted) |
| Drizzle ORM | 0.38.2 | Type-safe ORM |
| postgres | 3.4.5 | PostgreSQL client driver |

### Authentication
| Technology | Version | Purpose |
|------------|---------|---------|
| better-auth | 1.1.3 | Authentication library |
| OAuth | - | Google + Kakao providers only |

### AI Integration
| Technology | Version | Purpose |
|------------|---------|---------|
| Vercel AI SDK | 6.0.0-beta | AI/LLM integration framework (Responses API) |
| @ai-sdk/openai | 3.0.0-beta | OpenAI provider with file search & web search |
| @ai-sdk/react | 3.0.0-beta | React hooks for AI SDK |
| openai | 6.10.0 | Native OpenAI SDK for vector store management |

### Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| Vitest | 2.1.8 | Unit/integration testing |
| React Testing Library | 16.1.0 | Component testing |
| Playwright | 1.49.0 | End-to-end testing |

### Development Tools
| Tool | Purpose |
|------|---------|
| bun | Package manager & runtime |
| ESLint 9.16.0 | Code linting |
| Turbopack | Fast dev server bundler |

---

## Project Structure

```
in-seoul/
├── .agent/                         # Documentation
│   ├── System/                     # System architecture docs
│   │   └── project_architecture.md
│   ├── Tasks/                      # PRD & implementation plans
│   ├── SOP/                        # Standard operating procedures
│   └── README.md                   # Documentation index
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/[...all]/route.ts  # better-auth endpoints
│   │   │   └── ai/chat/route.ts        # AI chat streaming endpoint
│   │   ├── globals.css             # Global styles + theme variables
│   │   ├── layout.tsx              # Root layout with providers
│   │   └── page.tsx                # Home page
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── providers.tsx           # Theme provider wrapper
│   │   └── theme-toggle.tsx        # Dark/light mode toggle
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts            # Drizzle client
│   │   │   └── schema.ts           # Database schema
│   │   ├── services/
│   │   │   └── vector-store.service.ts  # OpenAI vector store management
│   │   ├── ai.ts                   # AI model config (Responses API)
│   │   ├── auth.ts                 # better-auth server config
│   │   ├── auth-client.ts          # better-auth client hooks
│   │   └── utils.ts                # Utility functions (cn)
│   ├── hooks/                      # Custom React hooks
│   └── types/                      # TypeScript type definitions
├── scripts/
│   └── vector-store/               # Vector store CLI scripts
│       ├── create.ts               # Create vector store
│       ├── manage.ts               # Manage files (list, upload, delete)
│       └── query.ts                # Query with file search
├── tests/
│   ├── setup.ts                    # Vitest setup
│   ├── unit/                       # Unit tests
│   │   └── example.test.tsx
│   └── e2e/                        # Playwright E2E tests
│       └── example.spec.ts
├── public/                         # Static assets
├── drizzle/                        # Generated migrations (git-ignored)
│
├── .env.example                    # Environment template
├── .gitignore
├── components.json                 # shadcn/ui config
├── drizzle.config.ts               # Drizzle Kit config
├── eslint.config.mjs               # ESLint config
├── next.config.ts                  # Next.js config
├── package.json
├── playwright.config.ts            # Playwright config
├── postcss.config.mjs              # PostCSS config
├── tsconfig.json                   # TypeScript config
└── vitest.config.ts                # Vitest config
```

---

## Database Schema

> See [Database Schema](./database_schema.md) for complete ER diagram, table definitions, and usage examples.

**Tables**: `user`, `session`, `account`, `verification` (managed by better-auth)

**Schema File**: `src/lib/db/schema.ts`

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...all]` | GET, POST | Authentication (sign-in, sign-out, OAuth callbacks, session) |
| `/api/ai/chat` | POST | Stream AI chat responses using GPT-4o |

---

## Environment Variables

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

# Authentication (better-auth)
BETTER_AUTH_SECRET=           # Random secret (32+ chars)
BETTER_AUTH_URL=              # Base URL (e.g., http://localhost:3000)

# OAuth - Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OAuth - Kakao
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

# AI - OpenAI
OPENAI_API_KEY=
OPENAI_VECTOR_STORE_ID=       # Optional: Vector store ID for file search

# App
NEXT_PUBLIC_APP_URL=          # Public app URL
```

---

## NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev --turbopack` | Start dev server |
| `build` | `next build` | Production build |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | Run ESLint |
| `test` | `vitest` | Run unit tests |
| `test:ui` | `vitest --ui` | Unit tests with UI |
| `test:e2e` | `playwright test` | Run E2E tests |
| `test:e2e:ui` | `playwright test --ui` | E2E with UI |
| `db:generate` | `drizzle-kit generate` | Generate migrations |
| `db:migrate` | `drizzle-kit migrate` | Run migrations |
| `db:push` | `drizzle-kit push` | Push schema to DB |
| `db:studio` | `drizzle-kit studio` | Open Drizzle Studio |
| `vs:create` | `tsx scripts/vector-store/create.ts` | Create OpenAI vector store |
| `vs:manage` | `tsx scripts/vector-store/manage.ts` | Manage vector store files (uses env) |
| `vs:query` | `tsx scripts/vector-store/query.ts` | Query with file search (uses env) |

---

## Key Integration Points

### 1. Database Connection (Drizzle + Supabase)
- **Client**: `src/lib/db/index.ts`
- **Schema**: `src/lib/db/schema.ts`
- Connection via `DATABASE_URL` environment variable
- Migrations managed via Drizzle Kit

### 2. Authentication Flow (better-auth)
- **Server config**: `src/lib/auth.ts`
- **Client hooks**: `src/lib/auth-client.ts` (signIn, signOut, useSession)
- **API route**: `src/app/api/auth/[...all]/route.ts`
- OAuth-only (no email/password)
- Session: 7-day expiration, 1-day refresh, 5-min cookie cache

### 3. AI Integration (Vercel AI SDK 6 Beta)
- **Config**: `src/lib/ai.ts`
- **API route**: `src/app/api/ai/chat/route.ts`
- **Vector Store Service**: `src/lib/services/vector-store.service.ts`
- Models: `gpt-5.1` (default), `gpt-5-nano` via Responses API
- Streaming responses via `streamText()` + `toUIMessageStreamResponse()`
- Tools: `openai.tools.fileSearch()`, `openai.tools.webSearchPreview()`

### 4. Vector Store Management (OpenAI)
- **Service**: `src/lib/services/vector-store.service.ts`
- **CLI Scripts**: `scripts/vector-store/`
- Uses native OpenAI SDK for CRUD operations
- File search via Vercel AI SDK's `openai.tools.fileSearch()`
- Store ID configured via `OPENAI_VECTOR_STORE_ID` in `.env`

**CLI Usage**:
```bash
bun vs:create "my-kb"                    # Create store (returns ID for .env)
bun vs:manage list-stores                # List all stores
bun vs:manage list-files                 # List files in store
bun vs:manage upload ./file.pdf          # Upload file to store
bun vs:manage delete-file <file_id>      # Delete file from store
bun vs:manage delete-store               # Delete the store
bun vs:query "question"                  # Query with file search
```

> **Note**: All commands except `list-stores` and `vs:create` use `OPENAI_VECTOR_STORE_ID` from `.env`.

### 5. Theme System
- **Provider**: `src/components/providers.tsx`
- **Toggle**: `src/components/theme-toggle.tsx`
- Dark/Light mode via next-themes
- CSS variables in `src/app/globals.css`
- System preference detection enabled

---

## Component Hierarchy

```
RootLayout (src/app/layout.tsx)
└── Providers (src/components/providers.tsx)
    └── ThemeProvider (next-themes)
        └── {children}
            └── Pages...

Home Page (src/app/page.tsx)
└── ThemeToggle (src/components/theme-toggle.tsx)
```

---

## Related Documentation

- [README.md](../README.md) - Documentation index with quick start
- [Database Schema](./database_schema.md) - ER diagram, table definitions, Drizzle usage
- [SOP/](../SOP/) - Standard operating procedures
- [Tasks/](../Tasks/) - Feature PRDs and implementation plans
