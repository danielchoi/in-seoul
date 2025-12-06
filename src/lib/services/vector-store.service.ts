import OpenAI from "openai";
import type {
  VectorStore,
  VectorStoreDeleted,
  VectorStoreFile,
} from "openai/resources/vector-stores";
import fs from "fs";

// Lazy initialization to allow dotenv to load first
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI();
  }
  return _openai;
}

export const vectorStoreService = {
  // Create a new vector store
  async create(name: string): Promise<{ id: string; name: string }> {
    const store = await getOpenAI().vectorStores.create({ name });
    return { id: store.id, name: store.name };
  },

  // List all vector stores
  async list(): Promise<VectorStore[]> {
    const stores = await getOpenAI().vectorStores.list();
    return stores.data;
  },

  // Get vector store details
  async get(vectorStoreId: string): Promise<VectorStore> {
    return getOpenAI().vectorStores.retrieve(vectorStoreId);
  },

  // Delete a vector store
  async delete(vectorStoreId: string): Promise<VectorStoreDeleted> {
    return getOpenAI().vectorStores.delete(vectorStoreId);
  },

  // Upload a local file to vector store
  async uploadFile(
    vectorStoreId: string,
    filePath: string
  ): Promise<{ fileId: string; status: VectorStoreFile["status"] }> {
    const openai = getOpenAI();
    const file = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: "assistants",
    });

    const vectorStoreFile = await openai.vectorStores.files.createAndPoll(
      vectorStoreId,
      { file_id: file.id }
    );

    return { fileId: file.id, status: vectorStoreFile.status };
  },

  // List files in vector store
  async listFiles(vectorStoreId: string): Promise<VectorStoreFile[]> {
    const files = await getOpenAI().vectorStores.files.list(vectorStoreId);
    return files.data;
  },

  // Delete a file from vector store
  async deleteFile(
    vectorStoreId: string,
    fileId: string
  ): Promise<{ deleted: boolean }> {
    const openai = getOpenAI();
    await openai.vectorStores.files.delete(fileId, {
      vector_store_id: vectorStoreId,
    });
    await openai.files.delete(fileId);
    return { deleted: true };
  },
};
