# Project Architecture

> **Status**: Active Development - Heatmap feature added

## Project Overview

**Project Name**: in-seoul
**Type**: Next.js Web Application
**Purpose**: University admission guidance platform for Seoul-area universities, providing Q&A assistance and admission statistics visualization (heatmap)

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
│   │   ├── heatmap/                # Admission heatmap pages
│   │   │   └── susi/               # 수시 (early admission) heatmap
│   │   │       ├── page.tsx        # Heatmap visualization
│   │   │       ├── loading.tsx     # Loading skeleton
│   │   │       └── error.tsx       # Error boundary
│   │   ├── qna/                    # Q&A pre-generation pages
│   │   │   ├── [id]/page.tsx       # Question detail page
│   │   │   ├── loading.tsx         # Loading state
│   │   │   └── page.tsx            # Question list page
│   │   ├── globals.css             # Global styles + theme variables
│   │   ├── layout.tsx              # Root layout with providers
│   │   └── page.tsx                # Home page
│   ├── components/
│   │   ├── heatmap/                # Heatmap visualization components
│   │   │   ├── GpaSlider.tsx       # GPA input slider (1-9 scale)
│   │   │   ├── UniversitySelector.tsx  # Multi-select university picker
│   │   │   ├── HeatmapFilters.tsx  # Combined filter controls
│   │   │   ├── HeatmapGrid.tsx     # Main grid layout
│   │   │   ├── HeatmapLegend.tsx   # Color legend for cut-offs
│   │   │   ├── UniversityGroup.tsx # University grouping in grid
│   │   │   ├── AdmissionTypeColumn.tsx # Admission type column
│   │   │   ├── DepartmentRow.tsx   # Department row with cells
│   │   │   └── index.ts            # Barrel exports
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── providers.tsx           # Theme provider wrapper
│   │   └── theme-toggle.tsx        # Dark/light mode toggle
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts            # Drizzle client
│   │   │   └── schema.ts           # Database schema
│   │   ├── prompts/                # AI prompt templates
│   │   ├── repositories/           # Data access layer
│   │   │   ├── answer.repository.ts
│   │   │   ├── heatmap.repository.ts   # Admission statistics queries
│   │   │   ├── prompt.repository.ts
│   │   │   ├── question.repository.ts
│   │   │   └── tag.repository.ts
│   │   ├── services/
│   │   │   ├── heatmap.service.ts      # Heatmap data processing
│   │   │   ├── qa-generation.service.ts  # Q&A generation with RAG
│   │   │   └── vector-store.service.ts   # OpenAI vector store management
│   │   ├── types/
│   │   │   └── heatmap.types.ts    # Heatmap TypeScript types
│   │   ├── utils/
│   │   │   └── heatmap-filters.ts  # URL state for filters
│   │   ├── ai.ts                   # AI model config (Responses API)
│   │   ├── auth.ts                 # better-auth server config
│   │   ├── auth-client.ts          # better-auth client hooks
│   │   └── utils.ts                # Utility functions (cn)
│   ├── hooks/                      # Custom React hooks
│   └── types/                      # TypeScript type definitions
├── scripts/
│   ├── adiga-susi/                 # Adiga.kr data fetcher
│   │   ├── fetch.ts                # Main script - fetches 수시 admission data
│   │   ├── config.ts               # Static config (CSRF tokens, headers)
│   │   └── parse-html.ts           # HTML parser for admission tables
│   ├── qa/                         # Q&A management CLI scripts
│   │   └── manage.ts               # Create, generate, list Q&A
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
| `/api/ai/chat` | POST | Stream AI chat responses using GPT-5.1 |

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Home page |
| `/heatmap/susi` | 수시 admission statistics heatmap visualization |
| `/qna` | Q&A pre-generation list (questions with answers) |
| `/qna/[id]` | Question detail with versioned answers |

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

### 4. Q&A Pre-generation System
- **Service**: `src/lib/services/qa-generation.service.ts`
- **Repositories**: `src/lib/repositories/` (question, answer, prompt, tag)
- **CLI**: `scripts/qa/manage.ts`
- **Pages**: `src/app/qna/`
- Uses file search tool for RAG-based answer generation
- Supports versioned answers with generation metadata (tokens, cost, latency)
- Answer sources tracked from vector store retrieval

**CLI Usage**:
```bash
bun qa:manage list [status]              # List questions
bun qa:manage create "question text"     # Create question
bun qa:manage generate <question_id>     # Generate answer
bun qa:manage regenerate <question_id>   # Regenerate with new prompt
bun qa:manage show <question_id>         # Show question details
```

### 5. Vector Store Management (OpenAI)
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

### 6. Admission Heatmap System
- **Page**: `src/app/heatmap/susi/page.tsx`
- **Components**: `src/components/heatmap/`
- **Service**: `src/lib/services/heatmap.service.ts`
- **Repository**: `src/lib/repositories/heatmap.repository.ts`
- **Types**: `src/lib/types/heatmap.types.ts`
- **Data Fetcher**: `scripts/adiga-susi/`

**Features**:
- Interactive GPA slider (1-9 scale, 1등급 = best)
- Multi-select university filter
- Color-coded cells: green (안전권), yellow (적정권), red (상향)
- Groups by university → admission type → department

**CLI Usage**:
```bash
bun adiga:fetch                      # Fetch all universities
bun adiga:fetch --dry-run            # Parse without saving
bun adiga:fetch --university "서울대" # Single university
bun adiga:fetch --delay 2000         # Custom delay between requests
```

### 7. Theme System
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
- [External-APIs/](../External-APIs/) - External API integration documentation
