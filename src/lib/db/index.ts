import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("POSTGRES_URL or DATABASE_URL environment variable is not set");
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });

// Transaction helper type
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
