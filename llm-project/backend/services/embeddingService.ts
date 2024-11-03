// backend/services/embeddingService.ts

import {load, OpenAI} from "../deps.ts";
import env = Deno.env;

await load({export: true});

const openai = new OpenAI({
    apiKey: env.get("OPENAI_API_KEY"),
});


const pineconeApiKey = env.get("PINECONE_API_KEY");
const pineconeEnvironment = env.get("PINECONE_ENVIRONMENT");
const pineconeIndexName = "syllabus-index";

// Construct Pinecone base URL
const pineconeBaseURL = `https://${pineconeIndexName}-${pineconeEnvironment}.svc.us-west1-gcp.pinecone.io/vectors`;

/**
 * Generates embeddings for an array of text chunks using OpenAI.
 * @param textChunks - Array of text strings.
 * @returns Array of embedding vectors.
 */
export const generateEmbeddings = async (textChunks: string[]): Promise<number[][]> => {
    const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: textChunks,
    });

    return response.data.map((item: any) => item.embedding);
};

/**
 * Stores embeddings in Pinecone.
 * @param texts - Array of text strings.
 * @param embeddings - Array of embedding vectors corresponding to the texts.
 */
export const storeEmbeddings = async (texts: string[], embeddings: number[][]): Promise<void> => {
    const upserts = texts.map((text, idx) => ({
        id: `${Date.now()}-${idx}`,
        values: embeddings[idx],
        metadata: { text },
    }));

    const response = await fetch(`${pineconeBaseURL}/upsert`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Api-Key": pineconeApiKey,
        },
        body: JSON.stringify({
            vectors: upserts,
            namespace: "syllabus",
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upsert embeddings to Pinecone: ${errorText}`);
    }
};
