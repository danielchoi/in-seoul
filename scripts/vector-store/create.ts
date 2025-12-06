#!/usr/bin/env bun
// Usage: pnpm vs:create <name>
import { config } from "dotenv";
config({ path: ".env" });
import { vectorStoreService } from "../../src/lib/services/vector-store.service";

async function main() {
  const name = process.argv[2];

  if (!name) {
    console.error("Usage: pnpm vs:create <name>");
    console.error("Example: pnpm vs:create my-knowledge-base");
    process.exit(1);
  }

  try {
    const store = await vectorStoreService.create(name);
    console.log(`Created vector store: ${store.id}`);
    console.log(`Name: ${store.name}`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating vector store:", error);
    process.exit(1);
  }
}

main();
