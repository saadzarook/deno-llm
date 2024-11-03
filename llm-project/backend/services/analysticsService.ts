// backend/services/analyticsService.ts

import { InteractionSchema } from "../models/Interaction.ts";

/**
 * Extracts topics from a given text. This is a placeholder and can be enhanced with NLP techniques.
 * @param text - The text to extract topics from.
 * @returns An array of topics found in the text.
 */
const extractTopics = (text: string): string[] => {
    // Implement NLP-based topic extraction or use predefined keywords
    // For simplicity, using predefined keywords
    const keywords = ['algebra', 'calculus', 'geometry', 'trigonometry', 'statistics', 'probability']; // Example keywords
    return keywords.filter((keyword) => text.toLowerCase().includes(keyword));
};

/**
 * Analyzes user interactions to determine strengths and gaps.
 * @param interactions - Array of interaction documents.
 * @returns An object containing topic counts, strengths, and gaps.
 */
export const analyzeInteractions = (interactions: InteractionSchema[]) => {
    const topicCount: { [key: string]: number } = {};

    interactions.forEach((interaction) => {
        const topics = extractTopics(interaction.prompt);
        topics.forEach((topic) => {
            topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
    });

    // Determine strengths and gaps based on topic count
    const sortedTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]);
    const half = Math.ceil(sortedTopics.length / 2);
    const strengths = sortedTopics.slice(0, half).map(([topic]) => topic);
    const gaps = sortedTopics.slice(half).map(([topic]) => topic);

    return { topicCount, strengths, gaps };
};
