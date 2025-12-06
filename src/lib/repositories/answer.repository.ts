import { db, Transaction } from "@/lib/db";
import { answer, answerSource } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export type AnswerSourceInput = Omit<
  typeof answerSource.$inferInsert,
  "id" | "answerId" | "createdAt"
>;

export const answerRepository = {
  async findById(id: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.answer.findFirst({
      where: eq(answer.id, id),
      with: {
        sources: true,
        prompt: true,
        question: true,
      },
    });
  },

  async findByQuestionId(questionId: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.answer.findMany({
      where: eq(answer.questionId, questionId),
      with: {
        sources: true,
        prompt: true,
      },
      orderBy: [desc(answer.version)],
    });
  },

  async findCurrentByQuestionId(questionId: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.answer.findFirst({
      where: and(eq(answer.questionId, questionId), eq(answer.isCurrent, true)),
      with: {
        sources: true,
        prompt: true,
      },
    });
  },

  async findByVersion(
    questionId: string,
    version: number,
    tx?: Transaction
  ) {
    const executor = tx ?? db;
    return executor.query.answer.findFirst({
      where: and(
        eq(answer.questionId, questionId),
        eq(answer.version, version)
      ),
      with: {
        sources: true,
        prompt: true,
      },
    });
  },

  async getNextVersion(questionId: string, tx?: Transaction): Promise<number> {
    const executor = tx ?? db;
    const latest = await executor.query.answer.findFirst({
      where: eq(answer.questionId, questionId),
      orderBy: [desc(answer.version)],
    });
    return (latest?.version ?? 0) + 1;
  },

  async create(
    data: Omit<
      typeof answer.$inferInsert,
      "id" | "createdAt" | "version" | "isCurrent"
    >,
    sources: AnswerSourceInput[],
    tx?: Transaction
  ): Promise<typeof answer.$inferSelect> {
    const executor = tx ?? db;
    const now = new Date();

    // Get next version number
    const nextVersion = await this.getNextVersion(data.questionId, tx);

    // Deactivate previous current answer
    await executor
      .update(answer)
      .set({ isCurrent: false })
      .where(
        and(
          eq(answer.questionId, data.questionId),
          eq(answer.isCurrent, true)
        )
      );

    // Create new answer as current
    const [created] = await executor
      .insert(answer)
      .values({
        id: nanoid(),
        ...data,
        version: nextVersion,
        isCurrent: true,
        createdAt: now,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create answer");
    }

    // Add sources
    if (sources.length > 0) {
      await executor.insert(answerSource).values(
        sources.map((source) => ({
          id: nanoid(),
          answerId: created.id,
          ...source,
          createdAt: now,
        }))
      );
    }

    return created;
  },

  async setCurrent(answerId: string, tx?: Transaction): Promise<typeof answer.$inferSelect> {
    const executor = tx ?? db;

    // Get the answer to find its question
    const targetAnswer = await executor.query.answer.findFirst({
      where: eq(answer.id, answerId),
    });

    if (!targetAnswer) {
      throw new Error("Answer not found");
    }

    // Deactivate all answers for the same question
    await executor
      .update(answer)
      .set({ isCurrent: false })
      .where(eq(answer.questionId, targetAnswer.questionId));

    // Activate the target answer
    const [updated] = await executor
      .update(answer)
      .set({ isCurrent: true })
      .where(eq(answer.id, answerId))
      .returning();

    if (!updated) throw new Error("Failed to set current answer");
    return updated;
  },

  async delete(id: string, tx?: Transaction) {
    const executor = tx ?? db;
    // Sources are cascade deleted via foreign key
    await executor.delete(answer).where(eq(answer.id, id));
  },

  async deleteByQuestionId(questionId: string, tx?: Transaction) {
    const executor = tx ?? db;
    await executor.delete(answer).where(eq(answer.questionId, questionId));
  },

  // Source-related methods
  async findSourcesByAnswerId(answerId: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.answerSource.findMany({
      where: eq(answerSource.answerId, answerId),
      orderBy: [desc(answerSource.relevanceScore)],
    });
  },

  async addSources(
    answerId: string,
    sources: AnswerSourceInput[],
    tx?: Transaction
  ) {
    const executor = tx ?? db;
    const now = new Date();

    await executor.insert(answerSource).values(
      sources.map((source) => ({
        id: nanoid(),
        answerId,
        ...source,
        createdAt: now,
      }))
    );
  },
};
