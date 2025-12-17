# in-seoul Documentation Index

> Central hub for all project documentation

## Project Status

**Current Phase**: Active Development - Heatmap Feature
**Last Updated**: 2025-12-18

---

## About This Project

**in-seoul** is a Korean university admissions Q&A assistant. It uses OpenAI's file search to retrieve relevant information from uploaded documents (admissions guidelines, etc.) and generates answers using GPT models.

**Key Features**:
- Pre-generated Q&A with versioned answers
- Follow-up question generation
- Question rephrasing for better search
- Vector store integration for document retrieval
- Source attribution from retrieved documents
- **Admission statistics heatmap** for 수시 (early admission) visualization

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
| [Project Architecture](./System/project_architecture.md) | Tech stack, project structure, API routes, environment variables, integration points, architecture layers |
| [Database Schema](./System/database_schema.md) | ER diagram, table definitions, relationships, repository methods, Drizzle usage examples |

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
| [AI SDK + OpenAI Responses API](./External-APIs/ai_sdk_openai_response_api.md) | Vercel AI SDK 6 beta integration with OpenAI Responses API, file search, web search |
| [OpenAI File Search](./External-APIs/openai_file_search.md) | File search tool usage and configuration |
| [OpenAI Retrieval](./External-APIs/openai_retreival.md) | Vector store and semantic search documentation |

---

## Tech Stack Summary

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.5.7 (App Router + Turbopack) |
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
| Q&A generation service | `src/lib/services/qa-generation.service.ts` |
| Vector store service | `src/lib/services/vector-store.service.ts` |
| Heatmap service | `src/lib/services/heatmap.service.ts` |
| Heatmap components | `src/components/heatmap/` |
| System prompt | `src/lib/prompts/admissions-assistant.ts` |
| Theme provider | `src/components/providers.tsx` |
| Global styles | `src/app/globals.css` |
| Environment template | `.env.example` |

### Repositories
| Repository | Purpose |
|------------|---------|
| `src/lib/repositories/question.repository.ts` | Question CRUD + relations |
| `src/lib/repositories/answer.repository.ts` | Answer versioning + sources |
| `src/lib/repositories/tag.repository.ts` | Hierarchical tags |
| `src/lib/repositories/prompt.repository.ts` | Versioned prompts |
| `src/lib/repositories/heatmap.repository.ts` | Admission statistics queries |

---

## Frontend Routes

| Route | Purpose |
|-------|---------|
| `/` | Home page |
| `/heatmap/susi` | 수시 admission statistics heatmap |
| `/qna` | Q&A list - displays all active questions |
| `/qna/[id]` | Q&A detail - shows question with versioned answers, tags, sources, and follow-ups |

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
| `bun vs:manage <cmd>` | Manage vector store files |
| `bun vs:query "prompt"` | Query with file search |
| `bun qa:manage <cmd>` | Manage Q&A content |
| `bun adiga:fetch` | Fetch 수시 admission statistics from adiga.kr |

### Q&A Management Commands

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

### Adiga Data Fetcher Commands

```bash
bun adiga:fetch                      # Fetch all universities
bun adiga:fetch --dry-run            # Parse without saving
bun adiga:fetch --university "서울대" # Single university
bun adiga:fetch --delay 2000         # Custom delay between requests
```

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
└── External-APIs/                      # External API documentation
    ├── ai_sdk_openai_response_api.md   # AI SDK 6 + OpenAI Responses API
    ├── openai_file_search.md           # OpenAI File Search tool
    └── openai_retreival.md             # OpenAI Vector Store retrieval

scripts/
├── adiga-susi/                         # Adiga.kr data fetcher
│   ├── fetch.ts                        # Main script - fetches 수시 admission data
│   ├── config.ts                       # Static config (CSRF tokens, headers)
│   └── parse-html.ts                   # HTML parser for admission tables
├── qa/
│   └── manage.ts                       # Q&A management CLI
└── vector-store/
    ├── create.ts                       # Create vector store
    ├── manage.ts                       # Manage vector store files
    └── query.ts                        # Query vector store
```

---

## Getting Started Guide

1. **New to the project?** Start with [Project Architecture](./System/project_architecture.md)
2. **Setting up locally?** Follow Quick Start above
3. **Understanding the database?** See [Database Schema](./System/database_schema.md)
4. **Building a feature?** Check [Tasks/](./Tasks/) for PRDs
5. **Need how-to guides?** See [SOP/](./SOP/) for procedures

---

## Core Workflows

### Adding a New Question
```bash
# 1. Create the question (auto-rephrases)
bun qa:manage create "서울대 수시 지원 자격이 어떻게 되나요?"

# 2. Generate answer (uses vector store search)
bun qa:manage generate <question_id>

# 3. View the result
bun qa:manage show <question_id>
```

### Managing Vector Store
```bash
# Upload admissions documents
bun vs:manage upload ./docs/서울대_2026_모집요강.pdf

# Query to test
bun vs:query "서울대 수시 지원자격"
```

### Prompt Versioning
```bash
# List current prompts
bun qa:manage prompts

# Create new version
bun qa:manage create-prompt admissions-qa "New prompt content..."

# Activate it
bun qa:manage activate-prompt <prompt_id>

# Regenerate all answers with new prompt
# (requires custom script or manual regeneration)
```

---

## Documentation Guidelines

- Keep documentation concise and actionable
- Update docs when making significant changes
- Each doc should have a "Related Documentation" section
- Avoid duplication - link to existing docs instead
- Include file paths for easy navigation
