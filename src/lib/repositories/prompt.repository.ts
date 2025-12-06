import { db, Transaction } from "@/lib/db";
import { prompt } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const promptRepository = {
  async findById(id: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.prompt.findFirst({
      where: eq(prompt.id, id),
    });
  },

  async findByNameAndVersion(
    name: string,
    version: number,
    tx?: Transaction
  ) {
    const executor = tx ?? db;
    return executor.query.prompt.findFirst({
      where: and(eq(prompt.name, name), eq(prompt.version, version)),
    });
  },

  async findActiveByName(name: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.prompt.findFirst({
      where: and(eq(prompt.name, name), eq(prompt.isActive, true)),
    });
  },

  async findLatestByName(name: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.prompt.findFirst({
      where: eq(prompt.name, name),
      orderBy: [desc(prompt.version)],
    });
  },

  async findAll(tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.prompt.findMany({
      orderBy: [desc(prompt.createdAt)],
    });
  },

  async findAllByName(name: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.prompt.findMany({
      where: eq(prompt.name, name),
      orderBy: [desc(prompt.version)],
    });
  },

  async create(
    data: Omit<typeof prompt.$inferInsert, "id" | "createdAt">,
    tx?: Transaction
  ) {
    const executor = tx ?? db;
    const [created] = await executor
      .insert(prompt)
      .values({
        id: nanoid(),
        ...data,
        createdAt: new Date(),
      })
      .returning();
    return created;
  },

  async setActive(id: string, tx?: Transaction) {
    const executor = tx ?? db;

    // Get the prompt to find its name
    const targetPrompt = await executor.query.prompt.findFirst({
      where: eq(prompt.id, id),
    });

    if (!targetPrompt) {
      throw new Error("Prompt not found");
    }

    // Deactivate all prompts with the same name
    await executor
      .update(prompt)
      .set({ isActive: false })
      .where(eq(prompt.name, targetPrompt.name));

    // Activate the target prompt
    const [updated] = await executor
      .update(prompt)
      .set({ isActive: true })
      .where(eq(prompt.id, id))
      .returning();

    return updated;
  },

  async delete(id: string, tx?: Transaction) {
    const executor = tx ?? db;
    await executor.delete(prompt).where(eq(prompt.id, id));
  },
};
