import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(process.env.DATABASE_URL);

export const db = drizzle(client, { schema });

// Transaction helper type
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
