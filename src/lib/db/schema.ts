import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// User table (managed by better-auth)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Session table (managed by better-auth)
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

// Account table (for OAuth providers - managed by better-auth)
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Verification table (managed by better-auth)
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// =============================================================================
// Q&A Pre-generation Tables
// =============================================================================

// Tag table - hierarchical tagging for questions
export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: text("parent_id").references((): ReturnType<typeof text> => tag.id),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const tagRelations = relations(tag, ({ one, many }) => ({
  parent: one(tag, {
    fields: [tag.parentId],
    references: [tag.id],
    relationName: "tagHierarchy",
  }),
  children: many(tag, { relationName: "tagHierarchy" }),
  questionTags: many(questionTag),
}));

// Prompt table - versioned prompt templates
export const prompt = pgTable(
  "prompt",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    content: text("content").notNull(),
    version: integer("version").notNull(),
    isActive: boolean("is_active").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [unique("prompt_name_version_unique").on(table.name, table.version)]
);

export const promptRelations = relations(prompt, ({ many }) => ({
  answers: many(answer),
}));

// Question table - self-referencing for follow-ups
export const question = pgTable("question", {
  id: text("id").primaryKey(),
  originalText: text("original_text").notNull(),
  rephrasedText: text("rephrased_text"),
  parentQuestionId: text("parent_question_id").references(
    (): ReturnType<typeof text> => question.id
  ),
  orderIndex: integer("order_index"),
  status: text("status").notNull(), // draft, active, archived
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const questionRelations = relations(question, ({ one, many }) => ({
  parent: one(question, {
    fields: [question.parentQuestionId],
    references: [question.id],
    relationName: "questionHierarchy",
  }),
  followUps: many(question, { relationName: "questionHierarchy" }),
  questionTags: many(questionTag),
  answers: many(answer),
}));

// Question-Tag join table
export const questionTag = pgTable(
  "question_tag",
  {
    questionId: text("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.questionId, table.tagId] })]
);

export const questionTagRelations = relations(questionTag, ({ one }) => ({
  question: one(question, {
    fields: [questionTag.questionId],
    references: [question.id],
  }),
  tag: one(tag, {
    fields: [questionTag.tagId],
    references: [tag.id],
  }),
}));

// Answer table - versioned answers with generation metadata
export const answer = pgTable("answer", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => question.id),
  promptId: text("prompt_id").references(() => prompt.id),
  content: text("content").notNull(),

  // Generation metadata
  model: text("model").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  costUsd: numeric("cost_usd", { precision: 10, scale: 6 }),
  latencyMs: integer("latency_ms"),

  // Versioning
  isCurrent: boolean("is_current").default(false),
  version: integer("version").notNull(),

  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const answerRelations = relations(answer, ({ one, many }) => ({
  question: one(question, {
    fields: [answer.questionId],
    references: [question.id],
  }),
  prompt: one(prompt, {
    fields: [answer.promptId],
    references: [prompt.id],
  }),
  sources: many(answerSource),
}));

// Answer Source table - context chunks from vector store
export const answerSource = pgTable("answer_source", {
  id: text("id").primaryKey(),
  answerId: text("answer_id")
    .notNull()
    .references(() => answer.id, { onDelete: "cascade" }),

  // Vector store reference
  fileId: text("file_id").notNull(),
  fileName: text("file_name").notNull(),

  // Retrieved content
  chunkText: text("chunk_text").notNull(),
  chunkIndex: integer("chunk_index"),
  relevanceScore: numeric("relevance_score", { precision: 5, scale: 4 }),

  // Metadata
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const answerSourceRelations = relations(answerSource, ({ one }) => ({
  answer: one(answer, {
    fields: [answerSource.answerId],
    references: [answer.id],
  }),
}));
