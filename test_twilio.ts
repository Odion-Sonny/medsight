import dotenv from 'dotenv';
import { sendProactiveMessage } from './src/services/twilioService';

dotenv.config();

async function testTwilio() {
    try {
        console.log("Testing proactive message...");
        // Use a dummy sender or maybe one that will fail but give an error message
        await sendProactiveMessage('whatsapp:+1234567890', 'Hello this is a test from medsight.');
        console.log("Success");
    } catch (e: any) {
        console.error("Twilio Error:", e?.message || e);
    }
}
testTwilio();
