// backend/controllers/syllabusController.ts

import { Context, Status } from "../deps.ts";
import { convertPdfToText } from "../services/pdfProcessor.ts";
import { createSyllabus, getLatestSyllabus } from "../models/Syllabus.ts";
import { generateEmbeddings, storeEmbeddings } from "../services/embeddingService.ts";

/**
 * Splits text into chunks of specified size.
 * @param text - The text to split.
 * @param chunkSize - The maximum size of each chunk.
 * @returns An array of text chunks.
 */
const splitTextIntoChunks = (text: string, chunkSize: number = 500): string[] => {
    const regex = new RegExp(`.{1,${chunkSize}}`, 'gs');
    return text.match(regex) || [];
};

/**
 * Handles syllabus upload, text extraction, and knowledge base building.
 * @param ctx - The Oak context.
 */
export const uploadSyllabus = async (ctx: Context) => {
    try {
        const body = await ctx.request.body({ type: "form-data" }).value;
        const syllabusFile = body.files?.[0];

        if (!syllabusFile || syllabusFile.contentType !== "application/pdf") {
            ctx.response.status = Status.BadRequest;
            ctx.response.body = { message: "A valid PDF file is required." };
            return;
        }

        // Save the uploaded file
        const uploadsDir = "./uploads/syllabi";
        await Deno.mkdir(uploadsDir, { recursive: true });
        const fileName = `${Date.now()}-${syllabusFile.filename}`;
        const filePath = `${uploadsDir}/${fileName}`;

        const file = await Deno.open(filePath, { write: true, create: true });

        await Deno.copyFile(syllabusFile, filePath);
        file.close();

        // Convert PDF to text
        const textContent = await convertPdfToText(filePath);

        // Save syllabus to database
        const syllabus = await createSyllabus(syllabusFile.filename, textContent);

        // Build knowledge base
        const textChunks = splitTextIntoChunks(textContent);
        const embeddings = await generateEmbeddings(textChunks);
        await storeEmbeddings(textChunks, embeddings);

        ctx.response.status = Status.OK;
        ctx.response.body = { message: "Syllabus uploaded and knowledge base built successfully." };
    } catch (error) {
        console.error('Error uploading syllabus:', error);
        ctx.response.status = Status.InternalServerError;
        ctx.response.body = { message: "Error processing syllabus." };
    }
};

/**
 * Rebuilds the knowledge base using the latest syllabus.
 * @param ctx - The Oak context.
 */
export const rebuildKnowledgeBase = async (ctx: Context) => {
    try {
        const syllabus = await getLatestSyllabus();
        if (!syllabus) {
            ctx.response.status = Status.NotFound;
            ctx.response.body = { message: "No syllabus found." };
            return;
        }

        const textChunks = splitTextIntoChunks(syllabus.content);
        const embeddings = await generateEmbeddings(textChunks);
        await storeEmbeddings(textChunks, embeddings);

        ctx.response.status = Status.OK;
        ctx.response.body = { message: "Knowledge base rebuilt successfully." };
    } catch (error) {
        console.error('Error rebuilding knowledge base:', error);
        ctx.response.status = Status.InternalServerError;
        ctx.response.body = { message: "Error rebuilding knowledge base." };
    }
};
