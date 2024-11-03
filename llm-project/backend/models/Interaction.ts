// backend/models/Interaction.ts

import { Bson } from "../deps.ts";
import db from "../services/db.ts";

export interface InteractionSchema {
    _id: Bson.ObjectId;
    userId: Bson.ObjectId;
    prompt: string;
    reply: string;
    timestamp: Date;
}

const interactions = db.collection<InteractionSchema>("interactions");

/**
 * Logs a user interaction.
 * @param userId - The user's ObjectId.
 * @param prompt - The user's prompt.
 * @param reply - The AI's reply.
 * @returns The created interaction document.
 */
export const logInteraction = async (
    userId: Bson.ObjectId,
    prompt: string,
    reply: string,
): Promise<InteractionSchema> => {
    const id = await interactions.insertOne({ userId, prompt, reply, timestamp: new Date() });
    return { _id: id, userId, prompt, reply, timestamp: new Date() };
};

/**
 * Retrieves all interactions for a specific user.
 * @param userId - The user's ObjectId.
 * @returns An array of interaction documents.
 */
export const getUserInteractions = async (userId: Bson.ObjectId): Promise<InteractionSchema[]> => {
    return await interactions.find({ userId }).toArray();
};
