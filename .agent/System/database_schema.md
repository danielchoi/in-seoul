# Database Schema

> PostgreSQL database hosted on Supabase, managed via Drizzle ORM

## Overview

**Database**: PostgreSQL (Supabase)
**ORM**: Drizzle ORM 0.38.2
**Schema File**: `src/lib/db/schema.ts`
**Connection**: Via `DATABASE_URL` environment variable

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           user                                   │
├─────────────────────────────────────────────────────────────────┤
│ id              TEXT         PK                                  │
│ name            TEXT         NOT NULL                            │
│ email           TEXT         NOT NULL, UNIQUE                    │
│ email_verified  BOOLEAN      NOT NULL                            │
│ image           TEXT         NULLABLE                            │
│ created_at      TIMESTAMP    NOT NULL                            │
│ updated_at      TIMESTAMP    NOT NULL                            │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                          session                                 │
├─────────────────────────────────────────────────────────────────┤
│ id              TEXT         PK                                  │
│ expires_at      TIMESTAMP    NOT NULL                            │
│ token           TEXT         NOT NULL, UNIQUE                    │
│ created_at      TIMESTAMP    NOT NULL                            │
│ updated_at      TIMESTAMP    NOT NULL                            │
│ ip_address      TEXT         NULLABLE                            │
│ user_agent      TEXT         NULLABLE                            │
│ user_id         TEXT         NOT NULL, FK → user.id              │
└─────────────────────────────────────────────────────────────────┘

                    │
        ┌───────────┘
        │ 1:N
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                          account                                 │
├─────────────────────────────────────────────────────────────────┤
│ id                        TEXT         PK                        │
│ account_id                TEXT         NOT NULL                  │
│ provider_id               TEXT         NOT NULL                  │
│ user_id                   TEXT         NOT NULL, FK → user.id    │
│ access_token              TEXT         NULLABLE                  │
│ refresh_token             TEXT         NULLABLE                  │
│ id_token                  TEXT         NULLABLE                  │
│ access_token_expires_at   TIMESTAMP    NULLABLE                  │
│ refresh_token_expires_at  TIMESTAMP    NULLABLE                  │
│ scope                     TEXT         NULLABLE                  │
│ password                  TEXT         NULLABLE                  │
│ created_at                TIMESTAMP    NOT NULL                  │
│ updated_at                TIMESTAMP    NOT NULL                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        verification                              │
├─────────────────────────────────────────────────────────────────┤
│ id              TEXT         PK                                  │
│ identifier      TEXT         NOT NULL                            │
│ value           TEXT         NOT NULL                            │
│ expires_at      TIMESTAMP    NOT NULL                            │
│ created_at      TIMESTAMP    NULLABLE                            │
│ updated_at      TIMESTAMP    NULLABLE                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tables

### user

Core user information. Managed by better-auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Unique user identifier |
| `name` | TEXT | NOT NULL | User's display name |
| `email` | TEXT | NOT NULL, UNIQUE | User's email address |
| `email_verified` | BOOLEAN | NOT NULL | Whether email is verified |
| `image` | TEXT | NULLABLE | Profile image URL |
| `created_at` | TIMESTAMP | NOT NULL | Account creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Last update time |

### session

Active user sessions. Managed by better-auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Unique session identifier |
| `expires_at` | TIMESTAMP | NOT NULL | Session expiration time |
| `token` | TEXT | NOT NULL, UNIQUE | Session token |
| `created_at` | TIMESTAMP | NOT NULL | Session creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Last update time |
| `ip_address` | TEXT | NULLABLE | Client IP address |
| `user_agent` | TEXT | NULLABLE | Client user agent |
| `user_id` | TEXT | NOT NULL, FK | Reference to user.id |

**Session Configuration** (from `src/lib/auth.ts`):
- Expiration: 7 days
- Update age: 1 day (refreshes session after 1 day of activity)
- Cookie cache: 5 minutes

**Repository**: `src/lib/repositories/` (none - auth tables managed by better-auth)

### account

OAuth provider accounts linked to users. Managed by better-auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Unique account identifier |
| `account_id` | TEXT | NOT NULL | Provider's account ID |
| `provider_id` | TEXT | NOT NULL | OAuth provider (google, kakao) |
| `user_id` | TEXT | NOT NULL, FK | Reference to user.id |
| `access_token` | TEXT | NULLABLE | OAuth access token |
| `refresh_token` | TEXT | NULLABLE | OAuth refresh token |
| `id_token` | TEXT | NULLABLE | OAuth ID token |
| `access_token_expires_at` | TIMESTAMP | NULLABLE | Access token expiry |
| `refresh_token_expires_at` | TIMESTAMP | NULLABLE | Refresh token expiry |
| `scope` | TEXT | NULLABLE | OAuth scopes granted |
| `password` | TEXT | NULLABLE | Not used (OAuth only) |
| `created_at` | TIMESTAMP | NOT NULL | Account link time |
| `updated_at` | TIMESTAMP | NOT NULL | Last update time |

**Supported Providers**:
- `google` - Google OAuth
- `kakao` - Kakao OAuth

### verification

Verification tokens for email/phone. Managed by better-auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Unique verification identifier |
| `identifier` | TEXT | NOT NULL | Email or phone to verify |
| `value` | TEXT | NOT NULL | Verification token/code |
| `expires_at` | TIMESTAMP | NOT NULL | Token expiration time |
| `created_at` | TIMESTAMP | NULLABLE | Creation time |
| `updated_at` | TIMESTAMP | NULLABLE | Last update time |

---

## Q&A Pre-generation Tables

The following tables store pre-generated questions and answers for the admissions assistant.

### tag

Hierarchical tags for categorizing questions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Unique tag identifier |
| `name` | TEXT | NOT NULL | Tag display name |
| `slug` | TEXT | NOT NULL, UNIQUE | URL-friendly slug |
| `description` | TEXT | NULLABLE | Tag description |
| `parent_id` | TEXT | FK → tag.id | Parent tag for hierarchy |
| `order_index` | INTEGER | DEFAULT 0 | Display order |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation time |

### prompt

Versioned prompt templates for answer generation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Unique prompt identifier |
| `name` | TEXT | NOT NULL | Prompt name (e.g., "admissions-qa") |
| `content` | TEXT | NOT NULL | Full prompt template |
| `version` | INTEGER | NOT NULL | Version number |
| `is_active` | BOOLEAN | DEFAULT false | Whether this version is active |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation time |

**Unique Constraint**: `(name, version)`

### question

Self-referencing table for questions and follow-ups.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Unique question identifier |
| `original_text` | TEXT | NOT NULL | Original question text |
| `rephrased_text` | TEXT | NULLABLE | Optimized question for search |
| `parent_question_id` | TEXT | FK → question.id | Parent for follow-up questions |
| `order_index` | INTEGER | NULLABLE | Order among siblings (1-5) |
| `status` | TEXT | NOT NULL | draft, active, archived |
| `priority` | INTEGER | DEFAULT 0 | Generation queue priority |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update time |

### question_tag

Many-to-many join table for questions and tags.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `question_id` | TEXT | PK, FK → question.id | Question reference |
| `tag_id` | TEXT | PK, FK → tag.id | Tag reference |

**Cascade**: Both foreign keys cascade on delete.

### answer

Versioned answers with generation metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Unique answer identifier |
| `question_id` | TEXT | NOT NULL, FK → question.id | Question reference |
| `prompt_id` | TEXT | FK → prompt.id | Prompt version used |
| `content` | TEXT | NOT NULL | Generated answer content |
| `model` | TEXT | NOT NULL | Model used (gpt-4o, gpt-4o-mini) |
| `input_tokens` | INTEGER | NULLABLE | Input token count |
| `output_tokens` | INTEGER | NULLABLE | Output token count |
| `total_tokens` | INTEGER | NULLABLE | Total token count |
| `cost_usd` | NUMERIC(10,6) | NULLABLE | Calculated cost in USD |
| `latency_ms` | INTEGER | NULLABLE | Response latency in ms |
| `is_current` | BOOLEAN | DEFAULT false | Active version flag |
| `version` | INTEGER | NOT NULL | Version number |
| `generated_at` | TIMESTAMPTZ | NOT NULL | When answer was generated |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation time |

### answer_source

Context chunks from vector store used in answer generation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Unique source identifier |
| `answer_id` | TEXT | NOT NULL, FK → answer.id | Answer reference |
| `file_id` | TEXT | NOT NULL | OpenAI file ID |
| `file_name` | TEXT | NOT NULL | Human-readable file name |
| `chunk_text` | TEXT | NOT NULL | Actual text chunk used |
| `chunk_index` | INTEGER | NULLABLE | Position in file |
| `relevance_score` | NUMERIC(5,4) | NULLABLE | Search ranking score |
| `metadata` | JSONB | NULLABLE | Additional file metadata |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation time |

**Cascade**: Foreign key cascades on delete.

---

## Repository Methods

Each table (except auth tables) has a corresponding repository in `src/lib/repositories/`:

### question.repository.ts
| Method | Description |
|--------|-------------|
| `findById(id)` | Get question with parent, follow-ups, tags, and answers |
| `findByIdWithCurrentAnswer(id)` | Get question with only current answer |
| `findByIdWithAllAnswers(id)` | Get question with all answer versions |
| `findRootQuestions(status?)` | Get top-level questions (no parent) |
| `findFollowUps(parentId)` | Get follow-up questions for a parent |
| `findByTag(tagId)` | Get questions with specific tag |
| `findByTagSlug(slug)` | Get questions by tag slug |
| `findAll(status?)` | Get all questions, optionally filtered |
| `create(data, tagIds?)` | Create question with optional tags |
| `update(id, data)` | Update question |
| `addTags(id, tagIds)` | Add tags to question |
| `removeTags(id, tagIds)` | Remove tags from question |
| `setTags(id, tagIds)` | Replace all tags |
| `delete(id)` | Delete question |
| `countByStatus()` | Get counts grouped by status |

### answer.repository.ts
| Method | Description |
|--------|-------------|
| `findById(id)` | Get answer with sources, prompt, and question |
| `findByQuestionId(questionId)` | Get all answers for question |
| `findCurrentByQuestionId(questionId)` | Get current active answer |
| `findByVersion(questionId, version)` | Get specific version |
| `getNextVersion(questionId)` | Calculate next version number |
| `create(data, sources)` | Create answer and sources (auto-versions) |
| `setCurrent(answerId)` | Set answer as current version |
| `delete(id)` | Delete answer |
| `deleteByQuestionId(questionId)` | Delete all answers for question |
| `findSourcesByAnswerId(answerId)` | Get sources for answer |
| `addSources(answerId, sources)` | Add sources to answer |

### tag.repository.ts
| Method | Description |
|--------|-------------|
| `findById(id)` | Get tag with parent and children |
| `findBySlug(slug)` | Get tag by slug |
| `findAll()` | Get all tags with hierarchy |
| `findRootTags()` | Get top-level tags only |
| `findChildren(parentId)` | Get child tags |
| `create(data)` | Create tag |
| `update(id, data)` | Update tag |
| `delete(id)` | Delete tag |

### prompt.repository.ts
| Method | Description |
|--------|-------------|
| `findById(id)` | Get prompt by ID |
| `findByNameAndVersion(name, version)` | Get specific version |
| `findActiveByName(name)` | Get active prompt for name |
| `findLatestByName(name)` | Get latest version by name |
| `findAll()` | Get all prompts |
| `findAllByName(name)` | Get all versions for name |
| `create(data)` | Create prompt version |
| `setActive(id)` | Activate prompt (deactivates others with same name) |
| `delete(id)` | Delete prompt |

---

## Relationships

### Authentication Tables
| Relationship | Type | Description |
|--------------|------|-------------|
| user → session | 1:N | A user can have multiple active sessions |
| user → account | 1:N | A user can link multiple OAuth accounts |

### Q&A Tables
| Relationship | Type | Description |
|--------------|------|-------------|
| tag → tag (parent) | 1:N | Tags can have child tags (hierarchy) |
| question → question (parent) | 1:N | Questions can have follow-up questions |
| question ↔ tag | N:M | Questions can have multiple tags (via question_tag) |
| question → answer | 1:N | A question can have multiple answer versions |
| answer → prompt | N:1 | Answers reference the prompt version used |
| answer → answer_source | 1:N | An answer has multiple source chunks |

### Q&A ERD

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    tag      │────<│   question_tag   │>────│    question     │
│ (hierarchy) │     │   (join table)   │     │ (self-ref)      │
└─────────────┘     └──────────────────┘     └─────────────────┘
      │                                              │
      └──[parent_id]                    [parent_question_id]──┘
                                                     │
                                              ┌──────┴──────┐
                                              │   answer    │──────┐
                                              └──────┬──────┘      │
                                                     │        [prompt_id]
                                              ┌──────┴──────┐      │
                                              │answer_source│   ┌──┴──┐
                                              └─────────────┘   │prompt│
                                                                └─────┘
```

---

## Drizzle Commands

```bash
# Generate migrations from schema changes
bun db:generate

# Apply migrations to database
bun db:migrate

# Push schema directly (dev only, no migration files)
bun db:push

# Open Drizzle Studio (database GUI)
bun db:studio
```

## Q&A Management Commands

```bash
# List all questions
bun qa:manage list [status]

# Create a new question
bun qa:manage create "서울대 수시 지원 자격이 어떻게 되나요?"

# Generate answer for a question
bun qa:manage generate <question_id>

# Regenerate answer with current active prompt
bun qa:manage regenerate <question_id>

# Show question with current answer
bun qa:manage show <question_id>

# Tag management
bun qa:manage tags
bun qa:manage create-tag <name> [slug] [parent_id]

# Prompt management
bun qa:manage prompts
bun qa:manage create-prompt <name> <content>
bun qa:manage activate-prompt <prompt_id>

# Statistics
bun qa:manage stats
```

---

## Usage Examples

### Query User with Sessions

```typescript
import { db } from "@/lib/db";
import { user, session } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Get user by email
const userData = await db.query.user.findFirst({
  where: eq(user.email, "user@example.com"),
});

// Get user with their sessions
const userWithSessions = await db.query.user.findFirst({
  where: eq(user.id, userId),
  with: {
    sessions: true,
  },
});
```

### Query OAuth Accounts

```typescript
import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Get user's Google account
const googleAccount = await db.query.account.findFirst({
  where: and(
    eq(account.userId, userId),
    eq(account.providerId, "google")
  ),
});
```

---

## Adding New Tables

When adding application-specific tables:

1. Add table definition to `src/lib/db/schema.ts`
2. Run `bun db:generate` to create migration
3. Run `bun db:migrate` to apply migration
4. Update this documentation

**Example - Adding a posts table:**

```typescript
// src/lib/db/schema.ts
export const post = pgTable("post", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
```

---

## Related Documentation

- [Project Architecture](./project_architecture.md) - Overall system architecture
- [README.md](../README.md) - Documentation index
