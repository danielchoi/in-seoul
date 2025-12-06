import { db, Transaction } from "@/lib/db";
import { tag } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";

export const tagRepository = {
  async findById(id: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.tag.findFirst({
      where: eq(tag.id, id),
      with: {
        parent: true,
        children: true,
      },
    });
  },

  async findBySlug(slug: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.tag.findFirst({
      where: eq(tag.slug, slug),
      with: {
        parent: true,
        children: true,
      },
    });
  },

  async findAll(tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.tag.findMany({
      with: {
        parent: true,
        children: true,
      },
      orderBy: (tag, { asc }) => [asc(tag.orderIndex), asc(tag.name)],
    });
  },

  async findRootTags(tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.tag.findMany({
      where: isNull(tag.parentId),
      with: {
        children: true,
      },
      orderBy: (tag, { asc }) => [asc(tag.orderIndex), asc(tag.name)],
    });
  },

  async findChildren(parentId: string, tx?: Transaction) {
    const executor = tx ?? db;
    return executor.query.tag.findMany({
      where: eq(tag.parentId, parentId),
      orderBy: (tag, { asc }) => [asc(tag.orderIndex), asc(tag.name)],
    });
  },

  async create(
    data: Omit<typeof tag.$inferInsert, "id" | "createdAt">,
    tx?: Transaction
  ) {
    const executor = tx ?? db;
    const [created] = await executor
      .insert(tag)
      .values({
        id: nanoid(),
        ...data,
        createdAt: new Date(),
      })
      .returning();
    return created;
  },

  async update(
    id: string,
    data: Partial<Omit<typeof tag.$inferInsert, "id" | "createdAt">>,
    tx?: Transaction
  ) {
    const executor = tx ?? db;
    const [updated] = await executor
      .update(tag)
      .set(data)
      .where(eq(tag.id, id))
      .returning();
    return updated;
  },

  async delete(id: string, tx?: Transaction) {
    const executor = tx ?? db;
    await executor.delete(tag).where(eq(tag.id, id));
  },
};
