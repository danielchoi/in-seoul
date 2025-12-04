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

## Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| user → session | 1:N | A user can have multiple active sessions |
| user → account | 1:N | A user can link multiple OAuth accounts |

---

## Drizzle Commands

```bash
# Generate migrations from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema directly (dev only, no migration files)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
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
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:migrate` to apply migration
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
