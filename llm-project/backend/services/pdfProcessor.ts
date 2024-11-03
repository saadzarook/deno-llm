// backend/services/pdfProcessor.ts

import { Status } from "../deps.ts";

/**
 * Converts a PDF file to text using the pdftotext command-line tool.
 * @param pdfPath - The path to the PDF file.
 * @param outputPath - The desired output path for the text file.
 * @returns The extracted text content.
 */
export const convertPdfToText = async (pdfPath: string, outputPath: string = '-'): Promise<string> => {
    try {
        // Execute the pdftotext command
        const process = Deno.run({
            cmd: ['pdftotext', pdfPath, outputPath],
            stdout: 'piped',
            stderr: 'piped',
        });

        const { code } = await process.status();

        if (code === 0) {
            // If outputPath is '-', read from stdout
            if (outputPath === '-') {
                const rawOutput = await process.output(); // Uint8Array
                const text = new TextDecoder().decode(rawOutput);
                process.close();
                return text;
            } else {
                // Read the text file from the outputPath
                const text = await Deno.readTextFile(outputPath);
                process.close();
                return text;
            }
        } else {
            const rawError = await process.stderrOutput();
            const errorString = new TextDecoder().decode(rawError);
            process.close();
            throw new Error(`pdftotext failed with code ${code}: ${errorString}`);
        }
    } catch (error) {
        console.error('Error converting PDF to text:', error);
        throw error;
    }
};
