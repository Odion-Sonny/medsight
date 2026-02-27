import { Router, Request, Response } from 'express';
import { analyzeTextReport, analyzeMediaReport } from '../services/geminiService';
import { createTwiMLResponse, sendProactiveMessage } from '../services/twilioService';
import { downloadTwilioMedia } from '../utils/mediaDownloader';
import { saveMessage, getHistory } from '../database/db';

const router = Router();

router.post('/whatsapp', async (req: Request, res: Response) => {
    console.log("Received a webhook request from Twilio!");
    try {
        const twilioPayload = req.body;
        console.log("Payload:", twilioPayload);

        const sender = twilioPayload.From;
        const incomingMsg = twilioPayload.Body ? twilioPayload.Body.trim() : '';
        const numMedia = parseInt(twilioPayload.NumMedia || '0');

        // Twilio has a hard 15-second webhook limit. Gemini processing documents takes longer.
        // We MUST acknowledge immediately and process the document in the background.
        if (numMedia > 0) {
            const ackMsg = "I'm downloading and reviewing your medical document now. This might take up to a minute, please wait... ⏱️";
            res.type('text/xml').send(createTwiMLResponse(ackMsg));
        } else {
            // For text, just acknowledge silently to Twilio and reply via API later
            res.type('text/xml').send('<Response></Response>');
        }

        // Background Processing - avoids the HTTP connection closing randomly
        setImmediate(async () => {
            let replyText = '';

            try {
                // Retrieve last 10 messages for context
                const rawHistory = await getHistory(sender, 10);

                // Map "assistant" to "model" for Gemini
                const history = rawHistory.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    message: msg.message
                }));

                if (numMedia > 0) {
                    // Processing Media
                    const mediaUrl = twilioPayload.MediaUrl0;
                    const mimeType = twilioPayload.MediaContentType0;

                    if (!mediaUrl || !mimeType) {
                        replyText = "Sorry, I couldn't download the file you sent. Please try again.";
                    } else {
                        // Download media
                        const localPath = await downloadTwilioMedia(mediaUrl, mimeType);

                        // Send to Gemini
                        replyText = await analyzeMediaReport(localPath, mimeType, incomingMsg);
                    }
                } else {
                    // Processing Text
                    if (!incomingMsg) {
                        replyText = "Please send a text description of your medical report or upload an image/PDF document.";
                    } else {
                        replyText = await analyzeTextReport(incomingMsg, history);
                    }
                }
            } catch (error: any) {
                replyText = "I encountered an error while trying to process your request. Please ensure it's a valid text or image/PDF document.";
                console.error("Processing err:", error?.message || error);
                if (error?.response?.data) console.error("Axios Data:", error.response.data);
            }

            // Save interaction to DB
            try {
                if (incomingMsg || numMedia > 0) {
                    await saveMessage(sender, incomingMsg || '[Media Uploaded]', 'user');
                }
                await saveMessage(sender, replyText, 'assistant');
            } catch (dbErr) {
                console.error("DB Save Error:", dbErr);
            }

            // Send actual conversational response via Twilio REST API directly
            try {
                await sendProactiveMessage(sender, replyText);
            } catch (twilioErr) {
                console.error("Failed to send proactive message:", twilioErr);
            }
        });

    } catch (err) {
        console.error("Critical Webhook Error:", err);
        const errTwiml = createTwiMLResponse("An unexpected error occurred. Please try again later.");
        if (!res.headersSent) {
            res.type('text/xml').send(errTwiml);
        }
    }
});

export default router;
