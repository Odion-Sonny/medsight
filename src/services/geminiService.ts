import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `You are Medsight, an AI-powered WhatsApp chatbot designed to help users understand their medical reports in simple, human-friendly language. 
Your tone should be empathetic, professional, and accessible. You must avoid medical jargon where possible, or explain it simply. 

CRITICAL RULES:
1. You are NOT a doctor. You must never provide medical diagnoses or prescribe treatment.
2. Always include a short, clear disclaimer at the end of every response stating: "Disclaimer: This interpretation is for informational purposes only. Please consult a licensed medical professional for advice or diagnosis."
3. If the user uploads a lab result/medical report, summarize what it tests for, explain the results compared to typical reference ranges, and highlight any values that are out of the norm in a gentle, non-alarmist way.
4. Keep the summary concise since users read this on WhatsApp. Avoid giant walls of text. Use bullet points and spacing optimally.`;

export const analyzeTextReport = async (text: string, history: { role: string, message: string }[] = []) => {
    // Format history for Gemini
    const contents = history.map(h => ({
        role: h.role, // "user" or "model"
        parts: [{ text: h.message }]
    }));

    // Add current message
    contents.push({ role: 'user', parts: [{ text }] });

    const response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.3,
        }
    });

    return response.text || '';
};

export const analyzeMediaReport = async (mediaPath: string, mimeType: string, additionalText: string = '') => {
    try {
        // Upload the file to Gemini File API
        const uploadedFile = await ai.files.upload({
            file: mediaPath,
            config: { mimeType: mimeType },
        });

        // Generate content with the uploaded file
        const prompt = `Here is my medical report. Please help me understand it. 
        ${additionalText ? 'Additional context from me: ' + additionalText : ''}`;

        const response = await ai.models.generateContent({
            model: MODEL,
            contents: [
                {
                    fileData: {
                        fileUri: uploadedFile.uri,
                        mimeType: uploadedFile.mimeType
                    }
                },
                prompt
            ],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.3,
            }
        });

        return response.text || '';
    } catch (error: any) {
        console.error("Error analyzing media report inside geminiService:", error?.message || error);
        throw error;
    } finally {
        // We delete the local file right away to preserve privacy.
        if (fs.existsSync(mediaPath)) {
            try {
                fs.unlinkSync(mediaPath);
                console.log(`Deleted local temporary file: ${mediaPath}`);
            } catch (err) {
                console.error("Error deleting temp file:", err);
            }
        }
    }
};
