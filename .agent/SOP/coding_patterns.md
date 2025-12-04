# Coding Patterns & Best Practices

> Standards and patterns for Next.js 15 + TypeScript + Drizzle ORM development

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │   Server Actions    │  │
│  │ (app/)      │  │ (ui/)       │  │   (actions/)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Service Layer                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Services (lib/services/)                            │    │
│  │  - Business logic                                    │    │
│  │  - Orchestrates repositories                         │    │
│  │  - Transaction management                            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Access Layer                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Repositories (lib/repositories/)                    │    │
│  │  - CRUD operations                                   │    │
│  │  - Database queries                                  │    │
│  │  - No business logic                                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Drizzle ORM (lib/db/)                               │    │
│  │  - Schema definitions                                │    │
│  │  - Database connection                               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Service Pattern

Use services to separate business logic from data access. This improves testability and maintainability.

### Structure

```
src/lib/
├── services/           # Business logic
│   ├── user.service.ts
│   └── post.service.ts
├── repositories/       # Data access
│   ├── user.repository.ts
│   └── post.repository.ts
└── db/
    ├── index.ts        # Database client
    └── schema.ts       # Schema definitions
```

### Repository Example

```typescript
// src/lib/repositories/user.repository.ts
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const userRepository = {
  async findById(id: string) {
    return db.query.user.findFirst({
      where: eq(user.id, id),
    });
  },

  async findByEmail(email: string) {
    return db.query.user.findFirst({
      where: eq(user.email, email),
    });
  },

  async create(data: typeof user.$inferInsert) {
    const [created] = await db.insert(user).values(data).returning();
    return created;
  },

  async update(id: string, data: Partial<typeof user.$inferInsert>) {
    const [updated] = await db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    return updated;
  },

  async delete(id: string) {
    await db.delete(user).where(eq(user.id, id));
  },
};
```

### Service Example

```typescript
// src/lib/services/user.service.ts
import { userRepository } from "@/lib/repositories/user.repository";

export const userService = {
  async getProfile(userId: string) {
    const userData = await userRepository.findById(userId);
    if (!userData) {
      throw new Error("User not found");
    }
    return userData;
  },

  async updateProfile(userId: string, data: { name?: string; image?: string }) {
    // Business logic here (validation, transformations)
    const updated = await userRepository.update(userId, data);
    return updated;
  },
};
```

### Usage in Server Actions

```typescript
// src/app/actions/user.actions.ts
"use server";

import { userService } from "@/lib/services/user.service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateProfileAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  return userService.updateProfile(session.user.id, { name });
}
```

---

## 2. Server Components vs Client Components

### Default to Server Components

```typescript
// src/app/profile/page.tsx (Server Component - default)
import { userService } from "@/lib/services/user.service";

export default async function ProfilePage() {
  const user = await userService.getProfile("user-id");

  return (
    <div>
      <h1>{user.name}</h1>
      <ProfileForm user={user} /> {/* Client component for interactivity */}
    </div>
  );
}
```

### Use Client Components Only When Needed

```typescript
// src/components/profile-form.tsx
"use client";

import { useState } from "react";
import { updateProfileAction } from "@/app/actions/user.actions";

export function ProfileForm({ user }: { user: { name: string } }) {
  const [name, setName] = useState(user.name);

  return (
    <form action={updateProfileAction}>
      <input
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Save</button>
    </form>
  );
}
```

### When to Use Each

| Use Server Components | Use Client Components |
|-----------------------|----------------------|
| Fetching data | useState, useEffect |
| Accessing backend resources | Event handlers (onClick, onChange) |
| Keeping sensitive info server-side | Browser APIs |
| Large dependencies | Interactivity & real-time updates |

---

## 3. Route Organization

### Use Route Groups for Organization

```
src/app/
├── (auth)/                 # Auth routes group (no /auth in URL)
│   ├── login/page.tsx      # /login
│   └── register/page.tsx   # /register
├── (main)/                 # Main app group
│   ├── layout.tsx          # Shared layout with nav
│   ├── page.tsx            # /
│   └── profile/page.tsx    # /profile
├── (admin)/                # Admin group
│   └── dashboard/page.tsx  # /dashboard
└── api/                    # API routes
    ├── auth/[...all]/route.ts
    └── ai/chat/route.ts
```

### Use Loading & Error Boundaries

```typescript
// src/app/(main)/profile/loading.tsx
export default function Loading() {
  return <div>Loading profile...</div>;
}

// src/app/(main)/profile/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

## 4. TypeScript Patterns

### Infer Types from Schema

```typescript
// Types inferred from Drizzle schema
import { user } from "@/lib/db/schema";

type User = typeof user.$inferSelect;       // For SELECT results
type NewUser = typeof user.$inferInsert;    // For INSERT data
```

### Zod for Validation

```typescript
// src/lib/validations/user.ts
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  image: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Usage in service
import { updateProfileSchema } from "@/lib/validations/user";

export const userService = {
  async updateProfile(userId: string, input: unknown) {
    const data = updateProfileSchema.parse(input); // Throws if invalid
    return userRepository.update(userId, data);
  },
};
```

### Avoid `any` - Use `unknown` Instead

```typescript
// Bad
function processData(data: any) { ... }

// Good
function processData(data: unknown) {
  if (typeof data === "string") {
    // TypeScript knows data is string here
  }
}
```

---

## 5. Database Transactions

### Transaction with Multiple Repositories

```typescript
// src/lib/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });

// Transaction helper type
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
```

```typescript
// src/lib/repositories/post.repository.ts
import { db, Transaction } from "@/lib/db";
import { post } from "@/lib/db/schema";

export const postRepository = {
  async create(data: typeof post.$inferInsert, tx?: Transaction) {
    const executor = tx ?? db;
    const [created] = await executor.insert(post).values(data).returning();
    return created;
  },
};
```

```typescript
// src/lib/services/post.service.ts
import { db } from "@/lib/db";
import { postRepository } from "@/lib/repositories/post.repository";
import { userRepository } from "@/lib/repositories/user.repository";

export const postService = {
  async createPostWithUpdate(userId: string, postData: PostInput) {
    // Transaction ensures both operations succeed or both fail
    return db.transaction(async (tx) => {
      const newPost = await postRepository.create(
        { ...postData, authorId: userId },
        tx
      );
      await userRepository.incrementPostCount(userId, tx);
      return newPost;
    });
  },
};
```

---

## 6. Error Handling

### Custom Error Classes

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Unauthorized", "UNAUTHORIZED", 401);
  }
}
```

### Error Handling in Services

```typescript
// src/lib/services/user.service.ts
import { NotFoundError } from "@/lib/errors";

export const userService = {
  async getProfile(userId: string) {
    const userData = await userRepository.findById(userId);
    if (!userData) {
      throw new NotFoundError("User");
    }
    return userData;
  },
};
```

---

## 7. Testing Patterns

### Unit Testing Services (Mock Repositories)

```typescript
// tests/unit/services/user.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { userService } from "@/lib/services/user.service";
import { userRepository } from "@/lib/repositories/user.repository";

vi.mock("@/lib/repositories/user.repository");

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user profile", async () => {
    const mockUser = { id: "1", name: "Test", email: "test@example.com" };
    vi.mocked(userRepository.findById).mockResolvedValue(mockUser);

    const result = await userService.getProfile("1");

    expect(result).toEqual(mockUser);
    expect(userRepository.findById).toHaveBeenCalledWith("1");
  });

  it("should throw NotFoundError when user not found", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(undefined);

    await expect(userService.getProfile("1")).rejects.toThrow("User not found");
  });
});
```

---

## 8. File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Services | kebab-case with `.service` | `user.service.ts` |
| Repositories | kebab-case with `.repository` | `user.repository.ts` |
| Actions | kebab-case with `.actions` | `user.actions.ts` |
| Validations | kebab-case | `user.validation.ts` |
| Types | kebab-case with `.types` | `user.types.ts` |
| Utils | kebab-case | `format-date.ts` |

---

## Summary Checklist

- [ ] Use Service Pattern for business logic separation
- [ ] Keep Server Components as default, Client Components minimal
- [ ] Use Route Groups for organization
- [ ] Infer types from Drizzle schema
- [ ] Validate inputs with Zod
- [ ] Use transactions for multi-table operations
- [ ] Create custom error classes
- [ ] Write unit tests for services (mock repositories)
- [ ] Follow file naming conventions

---

## Related Documentation

- [Project Architecture](../System/project_architecture.md)
- [Database Schema](../System/database_schema.md)
- [README.md](../README.md)

## External Resources

- [Next.js Best Practices 2025](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji)
- [Next.js App Router Guide](https://nextjs.org/docs/app/guides)
- [Repository Pattern with Drizzle](https://medium.com/@vimulatus/repository-pattern-in-nest-js-with-drizzle-orm-e848aa75ecae)
- [Atomic Repositories in TypeScript](https://blog.sentry.io/atomic-repositories-in-clean-architecture-and-typescript/)
