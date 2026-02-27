import twilio from 'twilio';

// Use this for returning simple TwiML responses inline a webhook
export const createTwiMLResponse = (message: string): string => {
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const response = new MessagingResponse();
    response.message(message);
    return response.toString();
};

export const sendProactiveMessage = async (to: string, message: string) => {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // WhatsApp Sandbox number or approved sender
    const from = `whatsapp:${process.env.TWILIO_PHONE_NUMBER || '+14155238886'}`;

    // Twilio WhatsApp has a max length limit (approx 1600 characters). 
    // We split cleanly so we do not hit API errors.
    const maxSize = 1500;
    const parts = message.match(new RegExp(`[\\s\\S]{1,${maxSize}}`, 'g')) || [];

    for (const part of parts) {
        try {
            await client.messages.create({
                body: part,
                from: from,
                to: to
            });
        } catch (twilioErr: any) {
            console.error("Twilio Error during sendProactiveMessage:", twilioErr?.message || twilioErr);
        }
    }
};
