# Project Architecture

> **Status**: Active Development - Heatmap Feature

## Project Overview

**Project Name**: in-seoul
**Type**: Next.js Web Application
**Purpose**: Korean university admissions Q&A assistant with AI-powered answer generation, vector search, and admission statistics visualization (heatmap)

The application provides a Q&A system for Korean university admissions. It uses OpenAI's file search to retrieve relevant information from uploaded documents (admissions guidelines, etc.) and generates answers using GPT models. The system supports:
- Pre-generated Q&A with versioned answers
- Follow-up question generation
- Question rephrasing for better search
- Vector store integration for document retrieval
- **Admission statistics heatmap** for 수시 (early admission) visualization

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.7 | React framework with App Router + Turbopack |
| React | 19.0.0 | UI library |
| TypeScript | 5.7.2 | Type-safe JavaScript (Strict mode) |

### Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 4.0.0-beta.8 | Utility-first CSS framework |
| shadcn/ui | new-york style | Component library built on Radix UI |
| next-themes | 0.4.4 | Dark/light mode support |
| @tailwindcss/typography | 0.5.19 | Prose styling for markdown content |

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
| Vercel AI SDK | 6.0.0-beta.131 | AI/LLM integration framework (Responses API) |
| @ai-sdk/openai | 3.0.0-beta.83 | OpenAI provider with file search & web search |
| @ai-sdk/react | 3.0.0-beta.132 | React hooks for AI SDK |
| openai | 6.10.0 | Native OpenAI SDK for vector store management |

### Content Rendering
| Technology | Version | Purpose |
|------------|---------|---------|
| react-markdown | 10.1.0 | Markdown rendering |
| remark-gfm | 4.0.1 | GitHub Flavored Markdown support |
| rehype-highlight | 7.0.2 | Syntax highlighting |

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
│   │   ├── project_architecture.md
│   │   └── database_schema.md
│   ├── Tasks/                      # PRD & implementation plans
│   ├── SOP/                        # Standard operating procedures
│   ├── External-APIs/              # External API documentation
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
│   │   ├── qna/
│   │   │   ├── page.tsx            # Q&A list page
│   │   │   ├── loading.tsx         # Loading skeleton
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Q&A detail page
│   │   │       └── loading.tsx     # Loading skeleton
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
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── markdown.tsx        # Markdown renderer
│   │   │   ├── skeleton.tsx
│   │   │   └── tabs.tsx
│   │   ├── qna/
│   │   │   └── answer-versions.tsx # Versioned answer display with tabs
│   │   ├── providers.tsx           # Theme provider wrapper
│   │   └── theme-toggle.tsx        # Dark/light mode toggle
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts            # Drizzle client + Transaction type
│   │   │   └── schema.ts           # Database schema + relations
│   │   ├── repositories/           # Data access layer
│   │   │   ├── question.repository.ts
│   │   │   ├── answer.repository.ts
│   │   │   ├── tag.repository.ts
│   │   │   ├── prompt.repository.ts
│   │   │   └── heatmap.repository.ts   # Admission statistics queries
│   │   ├── services/               # Business logic layer
│   │   │   ├── vector-store.service.ts  # OpenAI vector store management
│   │   │   ├── qa-generation.service.ts # Q&A generation with AI
│   │   │   └── heatmap.service.ts      # Heatmap data processing
│   │   ├── types/
│   │   │   └── heatmap.types.ts    # Heatmap TypeScript types
│   │   ├── utils/
│   │   │   └── heatmap-filters.ts  # URL state for filters
│   │   ├── prompts/
│   │   │   └── admissions-assistant.ts  # System prompt for Q&A
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
│   ├── qa/
│   │   └── manage.ts               # Q&A management CLI
│   └── vector-store/               # Vector store CLI scripts
│       ├── create.ts               # Create vector store
│       ├── manage.ts               # Manage files (list, upload, delete)
│       └── query.ts                # Query with file search
├── tests/
│   ├── setup.ts                    # Vitest setup
│   ├── unit/                       # Unit tests
│   └── e2e/                        # Playwright E2E tests
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

**Authentication Tables** (managed by better-auth): `user`, `session`, `account`, `verification`

**Q&A Tables**:
- `tag` - Hierarchical tags for categorizing questions
- `prompt` - Versioned prompt templates for AI generation
- `question` - Self-referencing for questions and follow-ups
- `question_tag` - Many-to-many join table
- `answer` - Versioned answers with generation metadata
- `answer_source` - Context chunks from vector store

**University Admission Tables**:
- `university` - Seoul-area universities
- `admission_statistic` - Raw admission statistics from adiga.kr

**Schema File**: `src/lib/db/schema.ts`

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...all]` | GET, POST | Authentication (sign-in, sign-out, OAuth callbacks, session) |
| `/api/ai/chat` | POST | Stream AI chat responses using GPT models |

---

## Frontend Routes

| Route | Purpose |
|-------|---------|
| `/` | Home page |
| `/heatmap/susi` | 수시 admission statistics heatmap visualization |
| `/qna` | Q&A list - displays all active questions |
| `/qna/[id]` | Q&A detail - shows question with versioned answers, tags, sources, and follow-ups |

---

## Environment Variables

```bash
# Database (Supabase PostgreSQL)
POSTGRES_URL=postgresql://[user]:[password]@[host]:[port]/[database]

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
OPENAI_VECTOR_STORE_ID=       # Vector store ID for file search

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
| `vs:create` | `bun scripts/vector-store/create.ts` | Create OpenAI vector store |
| `vs:manage` | `bun scripts/vector-store/manage.ts` | Manage vector store files |
| `vs:query` | `bun scripts/vector-store/query.ts` | Query with file search |
| `qa:manage` | `bun scripts/qa/manage.ts` | Manage Q&A content |
| `adiga:fetch` | `bun scripts/adiga-susi/fetch.ts` | Fetch 수시 admission data |

---

## Key Integration Points

### 1. Database Connection (Drizzle + Supabase)
- **Client**: `src/lib/db/index.ts`
- **Schema**: `src/lib/db/schema.ts`
- Connection via `POSTGRES_URL` environment variable
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
- **Q&A Service**: `src/lib/services/qa-generation.service.ts`
- **System Prompt**: `src/lib/prompts/admissions-assistant.ts`
- Models: `gpt-5.1` (default), `gpt-5-nano` for lightweight tasks
- Streaming responses via `streamText()` + `toUIMessageStreamResponse()`
- Tools: `openai.tools.fileSearch()`, `openai.tools.webSearchPreview()`

### 4. Q&A Generation System
- **Service**: `src/lib/services/qa-generation.service.ts`
- **Repositories**: `question`, `answer`, `tag`, `prompt` repositories
- **Features**:
  - Generate answers with file search from vector store
  - Auto-generate 5 follow-up questions
  - Auto-rephrase questions for better search
  - Version tracking for answers
  - Cost and usage tracking per answer
  - Source attribution from retrieved documents

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

### 6. Q&A Management CLI
- **Script**: `scripts/qa/manage.ts`
- Commands:
```bash
bun qa:manage list [status]              # List questions (draft/active/archived)
bun qa:manage create "question"          # Create new question
bun qa:manage generate <id>              # Generate answer for question
bun qa:manage regenerate <id>            # Regenerate with current prompt
bun qa:manage show <id>                  # Show question with answer
bun qa:manage tags                       # List all tags
bun qa:manage create-tag <name>          # Create tag
bun qa:manage prompts                    # List all prompts
bun qa:manage create-prompt <name> <content>  # Create prompt version
bun qa:manage activate-prompt <id>       # Activate prompt
bun qa:manage stats                      # Show question statistics
```

### 7. Admission Heatmap System
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

### 8. Theme System
- **Provider**: `src/components/providers.tsx`
- **Toggle**: `src/components/theme-toggle.tsx`
- Dark/Light mode via next-themes
- CSS variables in `src/app/globals.css`
- System preference detection enabled

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │   Route Handlers    │  │
│  │ (app/)      │  │ (components)│  │   (api/)            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Service Layer                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Services (lib/services/)                            │    │
│  │  - qa-generation.service.ts (Answer generation)     │    │
│  │  - vector-store.service.ts (Document management)    │    │
│  │  - heatmap.service.ts (Admission data processing)   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Access Layer                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Repositories (lib/repositories/)                    │    │
│  │  - question.repository.ts                            │    │
│  │  - answer.repository.ts                              │    │
│  │  - tag.repository.ts                                 │    │
│  │  - prompt.repository.ts                              │    │
│  │  - heatmap.repository.ts                             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Drizzle ORM (lib/db/)                               │    │
│  │  - schema.ts (Tables + Relations)                   │    │
│  │  - index.ts (Connection + Transaction type)         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
RootLayout (src/app/layout.tsx)
└── Providers (src/components/providers.tsx)
    └── ThemeProvider (next-themes)
        └── {children}
            ├── Home Page (src/app/page.tsx)
            │   └── ThemeToggle
            │
            ├── Heatmap Pages
            │   └── SusiHeatmapPage (src/app/heatmap/susi/page.tsx)
            │       ├── HeatmapFilters
            │       │   ├── GpaSlider
            │       │   └── UniversitySelector
            │       ├── HeatmapLegend
            │       └── HeatmapGrid
            │           └── UniversityGroup
            │               └── AdmissionTypeColumn
            │                   └── DepartmentRow
            │
            └── Q&A Pages
                ├── QnaPage (src/app/qna/page.tsx)
                │   └── Card, Badge components
                │
                └── QnaDetailPage (src/app/qna/[id]/page.tsx)
                    ├── Badge, Card components
                    └── AnswerVersions (src/components/qna/answer-versions.tsx)
                        ├── Tabs (for multiple versions)
                        ├── Markdown (content rendering)
                        └── Sources & Prompt display
```

---

## Related Documentation

- [README.md](../README.md) - Documentation index with quick start
- [Database Schema](./database_schema.md) - ER diagram, table definitions, Drizzle usage
- [Coding Patterns](../SOP/coding_patterns.md) - Service pattern, repository pattern, best practices
- [AI SDK + OpenAI Responses API](../External-APIs/ai_sdk_openai_response_api.md) - AI integration details
