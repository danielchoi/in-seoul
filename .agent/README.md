# in-seoul Documentation Index

> Central hub for all project documentation

## Project Status

**Current Phase**: Initialized - Ready for development
**Last Updated**: 2025-12-04

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in the required values in .env.local

# Run development server
pnpm dev

# Run tests
pnpm test          # Unit tests (Vitest)
pnpm test:e2e      # E2E tests (Playwright)
```

---

## Quick Links

### System Documentation
Core technical documentation about the project architecture and infrastructure.

| Document | Description |
|----------|-------------|
| [Project Architecture](./System/project_architecture.md) | Tech stack, project structure, environment variables, integration points |

### Tasks & PRDs
Feature specifications and implementation plans.

| Document | Description |
|----------|-------------|
| *Coming soon* | PRDs will be added as features are defined |

### Standard Operating Procedures (SOP)
Step-by-step guides for common development tasks.

| Document | Description |
|----------|-------------|
| *Coming soon* | SOPs will be added as the project evolves |

---

## Tech Stack Summary

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (Strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL (Supabase) via Drizzle ORM |
| Auth | better-auth (Gmail + Kakao OAuth) |
| AI | Vercel AI SDK + OpenAI |
| Testing | Vitest + React Testing Library + Playwright |
| Package Manager | pnpm |

---

## Directory Structure

```
.agent/
├── README.md          # This file - documentation index
├── System/            # System architecture & technical docs
│   └── project_architecture.md
├── Tasks/             # PRDs & implementation plans
└── SOP/               # Standard operating procedures
```

---

## Getting Started

1. **New to the project?** Start with [Project Architecture](./System/project_architecture.md)
2. **Building a feature?** Check [Tasks/](./Tasks/) for PRDs
3. **Need how-to guides?** See [SOP/](./SOP/) for procedures

---

## Documentation Guidelines

- Keep documentation concise and actionable
- Update docs when making significant changes
- Each doc should have a "Related Documentation" section
- Avoid duplication - link to existing docs instead
