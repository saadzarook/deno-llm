// backend/models/Syllabus.ts

import { Bson } from "../deps.ts";
import db from "../services/db.ts";

export interface SyllabusSchema {
    _id: Bson.ObjectId;
    title: string;
    content: string; // Extracted text from PDF
    uploadedAt: Date;
}

const syllabi = db.collection<SyllabusSchema>("syllabi");

/**
 * Creates a new syllabus entry.
 * @param title - The syllabus title.
 * @param content - The extracted text content.
 * @returns The created syllabus document.
 */
export const createSyllabus = async (title: string, content: string): Promise<SyllabusSchema> => {
    const id = await syllabi.insertOne({ title, content, uploadedAt: new Date() });
    return { _id: id, title, content, uploadedAt: new Date() };
};

/**
 * Retrieves the latest uploaded syllabus.
 * @returns The latest syllabus document or undefined.
 */
export const getLatestSyllabus = async (): Promise<SyllabusSchema | undefined> => {
    return await syllabi.findOne({}, { sort: { uploadedAt: -1 } });
};
