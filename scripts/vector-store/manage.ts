#!/usr/bin/env bun
// Usage: pnpm vs:manage <command> [args]
// Commands:
//   list-stores              - List all vector stores
//   list-files               - List files in the store
//   upload <path>            - Upload file to store
//   delete-file <file_id>    - Delete file from store
//   delete-store             - Delete the vector store
import { config } from "dotenv";
config({ path: ".env" });
import { vectorStoreService } from "../../src/lib/services/vector-store.service";

const STORE_ID = process.env.OPENAI_VECTOR_STORE_ID;

function printHelp() {
  console.log(`
Usage: pnpm vs:manage <command> [args]

Commands:
  list-stores                List all vector stores
  list-files                 List files in the store
  upload <file_path>         Upload file to store
  delete-file <file_id>      Delete file from store
  delete-store               Delete the vector store

Store ID is read from OPENAI_VECTOR_STORE_ID in .env${STORE_ID ? ` (${STORE_ID})` : " (not set)"}

Examples:
  pnpm vs:manage list-stores
  pnpm vs:manage list-files
  pnpm vs:manage upload ./docs/guide.pdf
  pnpm vs:manage delete-file file_xyz789
`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  try {
    switch (command) {
      case "list-stores": {
        const stores = await vectorStoreService.list();
        if (stores.length === 0) {
          console.log("No vector stores found.");
        } else {
          console.table(
            stores.map((s) => ({
              id: s.id,
              name: s.name,
              files: s.file_counts.completed,
              status: s.status,
            }))
          );
        }
        break;
      }

      case "list-files": {
        if (!STORE_ID) {
          console.error("Error: OPENAI_VECTOR_STORE_ID is not set in .env");
          process.exit(1);
        }
        const files = await vectorStoreService.listFiles(STORE_ID);
        if (files.length === 0) {
          console.log("No files found in this vector store.");
        } else {
          console.table(
            files.map((f) => ({
              id: f.id,
              status: f.status,
              created_at: new Date(f.created_at * 1000).toISOString(),
            }))
          );
        }
        break;
      }

      case "upload": {
        if (!STORE_ID) {
          console.error("Error: OPENAI_VECTOR_STORE_ID is not set in .env");
          process.exit(1);
        }
        const filePath = args[0];
        if (!filePath) {
          console.error("Error: file_path is required");
          console.error("Usage: pnpm vs:manage upload <file_path>");
          process.exit(1);
        }

        console.log(`Uploading ${filePath} to ${STORE_ID}...`);
        const result = await vectorStoreService.uploadFile(STORE_ID, filePath);
        console.log(`Uploaded successfully!`);
        console.log(`File ID: ${result.fileId}`);
        console.log(`Status: ${result.status}`);
        break;
      }

      case "delete-file": {
        if (!STORE_ID) {
          console.error("Error: OPENAI_VECTOR_STORE_ID is not set in .env");
          process.exit(1);
        }
        const fileId = args[0];
        if (!fileId) {
          console.error("Error: file_id is required");
          console.error("Usage: pnpm vs:manage delete-file <file_id>");
          process.exit(1);
        }

        await vectorStoreService.deleteFile(STORE_ID, fileId);
        console.log("File deleted successfully.");
        break;
      }

      case "delete-store": {
        if (!STORE_ID) {
          console.error("Error: OPENAI_VECTOR_STORE_ID is not set in .env");
          process.exit(1);
        }
        await vectorStoreService.delete(STORE_ID);
        console.log("Vector store deleted successfully.");
        break;
      }

      default:
        printHelp();
        break;
    }
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
