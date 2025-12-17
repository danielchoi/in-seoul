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
  type AnyPgColumn,
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
  parentId: text("parent_id").references((): AnyPgColumn => tag.id),
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
    (): AnyPgColumn => question.id
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

// =============================================================================
// University Admission Tables
// =============================================================================

// University table - 40 Seoul-area universities
export const university = pgTable("university", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  shortName: text("short_name"),
  adigaCode: text("adiga_code"), // 7-digit code used by adiga.kr (e.g., "0000019")
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const universityRelations = relations(university, ({ many }) => ({
  majors: many(major),
  yearWeights: many(universityYearWeight),
  admissionStatistics: many(admissionStatistic),
}));

// University Year Weight - per-year GPA weights (고1, 고2, 고3)
export const universityYearWeight = pgTable(
  "university_year_weight",
  {
    id: text("id").primaryKey(),
    universityId: text("university_id")
      .notNull()
      .references(() => university.id, { onDelete: "cascade" }),
    year: integer("year").notNull(), // 1, 2, 3 (고1, 고2, 고3)
    weight: numeric("weight", { precision: 3, scale: 1 }).notNull().default("1.0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [unique().on(table.universityId, table.year)]
);

export const universityYearWeightRelations = relations(
  universityYearWeight,
  ({ one }) => ({
    university: one(university, {
      fields: [universityYearWeight.universityId],
      references: [university.id],
    }),
  })
);

// Subject table - individual subjects (국어, 수학, 영어, etc.)
export const subject = pgTable("subject", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(), // 국, 수, 영, 사, 과
  name: text("name").notNull(), // 국어, 수학, 영어, 사회, 과학
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const subjectRelations = relations(subject, ({ many }) => ({
  groupItems: many(subjectGroupItem),
  criteriaWeights: many(criteriaSubjectWeight),
}));

// Subject Group - reusable groupings (국수영, 국수영사, etc.)
export const subjectGroup = pgTable("subject_group", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(), // 국수영, 국수영사, 국수영과, etc.
  name: text("name").notNull(), // Display name: 국어·수학·영어
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const subjectGroupRelations = relations(subjectGroup, ({ many }) => ({
  items: many(subjectGroupItem),
  criteria: many(admissionCriteria),
}));

// Subject Group Item - M:N join between groups and subjects
export const subjectGroupItem = pgTable(
  "subject_group_item",
  {
    id: text("id").primaryKey(),
    groupId: text("group_id")
      .notNull()
      .references(() => subjectGroup.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subject.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [unique().on(table.groupId, table.subjectId)]
);

export const subjectGroupItemRelations = relations(
  subjectGroupItem,
  ({ one }) => ({
    group: one(subjectGroup, {
      fields: [subjectGroupItem.groupId],
      references: [subjectGroup.id],
    }),
    subject: one(subject, {
      fields: [subjectGroupItem.subjectId],
      references: [subject.id],
    }),
  })
);

// Major table - university-specific departments
export const major = pgTable(
  "major",
  {
    id: text("id").primaryKey(),
    universityId: text("university_id")
      .notNull()
      .references(() => university.id),
    name: text("name").notNull(), // 공과대학, 경영학과, etc.
    canonicalName: text("canonical_name"), // Normalized name for cross-university comparison
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [unique().on(table.universityId, table.name)]
);

export const majorRelations = relations(major, ({ one, many }) => ({
  university: one(university, {
    fields: [major.universityId],
    references: [university.id],
  }),
  admissionCriteria: many(admissionCriteria),
}));

// Admission Criteria - tracks with thresholds per major
export const admissionCriteria = pgTable(
  "admission_criteria",
  {
    id: text("id").primaryKey(),
    majorId: text("major_id")
      .notNull()
      .references(() => major.id),
    name: text("name").notNull(), // Track name: 일반전형, 교과전형, etc.
    year: integer("year").notNull(), // Admission year (2025, 2026, etc.)
    subjectGroupId: text("subject_group_id").references(() => subjectGroup.id), // null = V1 (overall GPA)
    percentile50: numeric("percentile_50", { precision: 3, scale: 2 }), // 안전권: 50th percentile
    percentile70: numeric("percentile_70", { precision: 3, scale: 2 }), // 적정권: 70th percentile
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [unique().on(table.majorId, table.name, table.year)]
);

export const admissionCriteriaRelations = relations(
  admissionCriteria,
  ({ one, many }) => ({
    major: one(major, {
      fields: [admissionCriteria.majorId],
      references: [major.id],
    }),
    subjectGroup: one(subjectGroup, {
      fields: [admissionCriteria.subjectGroupId],
      references: [subjectGroup.id],
    }),
    subjectWeights: many(criteriaSubjectWeight),
  })
);

// Criteria Subject Weight - per-subject weights for V2 calculation
export const criteriaSubjectWeight = pgTable(
  "criteria_subject_weight",
  {
    id: text("id").primaryKey(),
    criteriaId: text("criteria_id")
      .notNull()
      .references(() => admissionCriteria.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subject.id),
    weight: numeric("weight", { precision: 3, scale: 1 }).notNull().default("1.0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [unique().on(table.criteriaId, table.subjectId)]
);

export const criteriaSubjectWeightRelations = relations(
  criteriaSubjectWeight,
  ({ one }) => ({
    criteria: one(admissionCriteria, {
      fields: [criteriaSubjectWeight.criteriaId],
      references: [admissionCriteria.id],
    }),
    subject: one(subject, {
      fields: [criteriaSubjectWeight.subjectId],
      references: [subject.id],
    }),
  })
);

// Admission Statistic - raw admission statistics from external sources (e.g., adiga.kr)
// departmentName can be either a department or major name, so no FK to major table
export const admissionStatistic = pgTable(
  "admission_statistic",
  {
    id: text("id").primaryKey(),
    universityId: text("university_id")
      .notNull()
      .references(() => university.id, { onDelete: "cascade" }),
    departmentName: text("department_name").notNull(), // 모집단위 (raw text)
    admissionType: text("admission_type").notNull(), // 전형 (e.g., 수시 지역균형전형)
    year: integer("year").notNull(), // 학년도
    quota: integer("quota"), // 모집인원
    competitionRate: numeric("competition_rate", { precision: 5, scale: 2 }), // 경쟁률
    waitlistRank: integer("waitlist_rank"), // 충원합격순위
    cut50: numeric("cut_50", { precision: 4, scale: 2 }), // 50% cut
    cut70: numeric("cut_70", { precision: 4, scale: 2 }), // 70% cut
    subjects: text("subjects"), // 평가에 반영된 교과목
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    unique().on(table.universityId, table.departmentName, table.admissionType, table.year),
  ]
);

export const admissionStatisticRelations = relations(
  admissionStatistic,
  ({ one }) => ({
    university: one(university, {
      fields: [admissionStatistic.universityId],
      references: [university.id],
    }),
  })
);
