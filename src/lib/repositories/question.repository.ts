import { db, Transaction } from "@/lib/db";
import { question, questionTag, tag } from "@/lib/db/schema";
import { eq, isNull, and, inArray, desc, asc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export const questionRepository = {
  async findById(id: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.question.findFirst({
      where: eq(question.id, id),
      with: {
        parent: true,
        followUps: {
          orderBy: [asc(question.orderIndex)],
        },
        questionTags: {
          with: {
            tag: true,
          },
        },
        answers: {
          where: eq(question.id, id), // Will be overridden by relation
          orderBy: [desc(question.createdAt)],
        },
      },
    });
  },

  async findByIdWithCurrentAnswer(id: string, tx?: Transaction) {
    const executor = tx ?? db;
    const result = await executor.query.question.findFirst({
      where: eq(question.id, id),
      with: {
        answers: {
          where: (answer, { eq }) => eq(answer.isCurrent, true),
          with: {
            sources: true,
          },
        },
        questionTags: {
          with: {
            tag: true,
          },
        },
      },
    });
    return result;
  },

  async findRootQuestions(
    status?: string,
    tx?: Transaction
  ) {
    const executor = tx ?? db;
    const conditions = [isNull(question.parentQuestionId)];
    if (status) {
      conditions.push(eq(question.status, status));
    }

    return executor.query.question.findMany({
      where: and(...conditions),
      with: {
        questionTags: {
          with: {
            tag: true,
          },
        },
        answers: {
          where: (answer, { eq }) => eq(answer.isCurrent, true),
        },
      },
      orderBy: [desc(question.priority), desc(question.createdAt)],
    });
  },

  async findFollowUps(parentId: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.question.findMany({
      where: eq(question.parentQuestionId, parentId),
      orderBy: [asc(question.orderIndex)],
      with: {
        questionTags: {
          with: {
            tag: true,
          },
        },
      },
    });
  },

  async findByTag(tagId: string, tx?: Transaction) {
    const executor = tx ?? db;
    const questionIds = await executor
      .select({ questionId: questionTag.questionId })
      .from(questionTag)
      .where(eq(questionTag.tagId, tagId));

    if (questionIds.length === 0) return [];

    return executor.query.question.findMany({
      where: inArray(
        question.id,
        questionIds.map((q) => q.questionId)
      ),
      with: {
        questionTags: {
          with: {
            tag: true,
          },
        },
        answers: {
          where: (answer, { eq }) => eq(answer.isCurrent, true),
        },
      },
    });
  },

  async findByTagSlug(tagSlug: string, tx?: Transaction) {
    const executor = tx ?? db;

    // Find the tag first
    const foundTag = await executor.query.tag.findFirst({
      where: eq(tag.slug, tagSlug),
    });

    if (!foundTag) return [];

    return this.findByTag(foundTag.id, tx);
  },

  async findAll(status?: string, tx?: Transaction) {
    const executor = tx ?? db;
    const conditions = status ? [eq(question.status, status)] : [];

    return executor.query.question.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        parent: true,
        questionTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(question.createdAt)],
    });
  },

  async create(
    data: Omit<typeof question.$inferInsert, "id" | "createdAt" | "updatedAt">,
    tagIds?: string[],
    tx?: Transaction
  ) {
    const executor = tx ?? db;
    const now = new Date();

    const [created] = await executor
      .insert(question)
      .values({
        id: nanoid(),
        ...data,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await executor.insert(questionTag).values(
        tagIds.map((tagId) => ({
          questionId: created.id,
          tagId,
        }))
      );
    }

    return created;
  },

  async update(
    id: string,
    data: Partial<
      Omit<typeof question.$inferInsert, "id" | "createdAt" | "updatedAt">
    >,
    tx?: Transaction
  ) {
    const executor = tx ?? db;
    const [updated] = await executor
      .update(question)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(question.id, id))
      .returning();
    return updated;
  },

  async addTags(questionId: string, tagIds: string[], tx?: Transaction) {
    const executor = tx ?? db;
    await executor.insert(questionTag).values(
      tagIds.map((tagId) => ({
        questionId,
        tagId,
      }))
    );
  },

  async removeTags(questionId: string, tagIds: string[], tx?: Transaction) {
    const executor = tx ?? db;
    await executor
      .delete(questionTag)
      .where(
        and(
          eq(questionTag.questionId, questionId),
          inArray(questionTag.tagId, tagIds)
        )
      );
  },

  async setTags(questionId: string, tagIds: string[], tx?: Transaction) {
    const executor = tx ?? db;
    // Remove all existing tags
    await executor
      .delete(questionTag)
      .where(eq(questionTag.questionId, questionId));

    // Add new tags
    if (tagIds.length > 0) {
      await executor.insert(questionTag).values(
        tagIds.map((tagId) => ({
          questionId,
          tagId,
        }))
      );
    }
  },

  async delete(id: string, tx?: Transaction) {
    const executor = tx ?? db;
    // Tags are cascade deleted via foreign key
    await executor.delete(question).where(eq(question.id, id));
  },

  async countByStatus(tx?: Transaction) {
    const executor = tx ?? db;
    const result = await executor
      .select({
        status: question.status,
        count: sql<number>`count(*)::int`,
      })
      .from(question)
      .groupBy(question.status);

    return result.reduce(
      (acc, row) => {
        acc[row.status] = row.count;
        return acc;
      },
      {} as Record<string, number>
    );
  },
};
