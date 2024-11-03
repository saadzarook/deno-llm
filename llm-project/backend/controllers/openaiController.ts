// backend/controllers/openaiController.ts

import {Bson, Context, load, Status} from "../deps.ts";
import {  OpenAI } from "../deps.ts";
import { logInteraction, getUserInteractions } from "../models/Interaction.ts";


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
 * Handles AI chatbot responses.
 * @param ctx - The Oak context.
 */
export const getResponse = async (ctx: Context) => {
    try {
        const { prompt } = await ctx.request.body({ type: "json" }).value;
        const userId = ctx.state.user.id;

        if (!prompt) {
            ctx.response.status = Status.BadRequest;
            ctx.response.body = { message: "Prompt is required." };
            return;
        }

        // Generate embedding for the prompt
        const embeddingResponse = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: prompt,
        });

        const queryEmbedding = embeddingResponse.data.data[0].embedding;

        // Retrieve relevant syllabus chunks from Pinecone
        const pineconeResponse = await fetch(`${pineconeBaseURL}/query`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": pineconeApiKey,
            },
            body: JSON.stringify({
                vector: queryEmbedding,
                topK: 5,
                includeMetadata: true,
                namespace: "syllabus",
            }),
        });

        if (!pineconeResponse.ok) {
            const errorText = await pineconeResponse.text();
            throw new Error(`Pinecone query failed: ${errorText}`);
        }

        const pineconeData = await pineconeResponse.json();
        const relevantTexts = pineconeData.matches.map((match: any) => match.metadata.text).join("\n");

        // Create a prompt with context
        const aiPrompt = `${relevantTexts}\n\nUser Question: ${prompt}\nAI Answer:`;

        // Generate AI response with context
        const aiResponse = await openai.completions.create({
            model: "text-davinci-004",
            prompt: aiPrompt,
            max_tokens: 300,
            temperature: 0.7,
        });

        const reply = aiResponse.choices[0].text.trim();

        // Log the interaction
        await logInteraction(new Bson.ObjectId(userId), prompt, reply);

        ctx.response.status = Status.OK;
        ctx.response.body = { reply };
    } catch (error) {
        console.error('Error generating AI response:', error);
        ctx.response.status = Status.InternalServerError;
        ctx.response.body = { message: "Error generating response." };
    }
};
