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
| Next.js | 15.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type-safe JavaScript (Strict mode) |

### Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | v4 | Utility-first CSS framework |
| shadcn/ui | latest | Component library built on Radix UI |
| next-themes | latest | Dark mode support |

### Database & ORM
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary database (hosted on Supabase) |
| Drizzle ORM | Type-safe ORM with connection via URI string |

### Authentication
| Technology | Purpose |
|------------|---------|
| better-auth | Authentication library |
| OAuth Providers | Gmail, Kakao (only - no email/password) |

### AI Integration
| Technology | Purpose |
|------------|---------|
| Vercel AI SDK | AI/LLM integration framework |
| OpenAI | Primary AI model provider |

### Testing
| Technology | Purpose |
|------------|---------|
| Vitest | Unit/integration testing |
| React Testing Library | Component testing |
| Playwright | End-to-end testing |

### Development Tools
| Tool | Purpose |
|------|---------|
| pnpm | Package manager |
| ESLint | Code linting |
| Prettier | Code formatting |

---

## Project Structure

```
in-seoul/
├── .agent/                    # Documentation
│   ├── System/               # System architecture docs
│   ├── Tasks/                # PRD & implementation plans
│   ├── SOP/                  # Standard operating procedures
│   └── README.md             # Documentation index
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Auth-related routes (grouped)
│   │   ├── (main)/          # Main app routes (grouped)
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # better-auth endpoints
│   │   │   └── ai/          # AI-related endpoints
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── [feature]/       # Feature-specific components
│   ├── lib/
│   │   ├── auth.ts          # better-auth client setup
│   │   ├── db/
│   │   │   ├── index.ts     # Drizzle client
│   │   │   ├── schema.ts    # Database schema
│   │   │   └── migrations/  # SQL migrations
│   │   ├── ai.ts            # Vercel AI SDK setup
│   │   └── utils.ts         # Utility functions
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Additional styles
├── tests/
│   ├── unit/                # Vitest unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # Playwright E2E tests
├── public/                   # Static assets
├── .env.example             # Environment variables template
├── .env.local               # Local environment (git-ignored)
├── drizzle.config.ts        # Drizzle ORM configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── vitest.config.ts         # Vitest configuration
├── playwright.config.ts     # Playwright configuration
├── components.json          # shadcn/ui configuration
└── package.json             # Dependencies & scripts
```

---

## Environment Variables

Required environment variables for the project:

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

# Authentication (better-auth)
BETTER_AUTH_SECRET=           # Random secret for session encryption
BETTER_AUTH_URL=              # Base URL (e.g., http://localhost:3000)

# OAuth - Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OAuth - Kakao
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

# AI - OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=          # Public app URL
```

---

## Key Integration Points

### 1. Database Connection (Drizzle + Supabase)
- Connection via PostgreSQL URI string
- Schema defined in `src/lib/db/schema.ts`
- Migrations managed via Drizzle Kit

### 2. Authentication Flow (better-auth)
- OAuth-only authentication (no email/password)
- Providers: Gmail, Kakao
- Session management via better-auth
- Protected routes via middleware

### 3. AI Integration (Vercel AI SDK)
- OpenAI as primary provider
- Streaming responses support
- Server-side API routes for AI calls

### 4. Theme System
- Dark/Light mode via next-themes
- System preference detection
- Persistent theme selection

---

## Related Documentation

- [README.md](../README.md) - Documentation index
- [SOP/](../SOP/) - Standard operating procedures (to be created)
- [Tasks/](../Tasks/) - Feature PRDs and implementation plans (to be created)
