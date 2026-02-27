# Medsight Setup Guide

Since you mentioned you haven't set up anything yet, here is a step-by-step guide on how to configure the necessary accounts and link them to this project.

## 1. Get a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and sign in with your Google account.
2. Click **Create API Key** and generate it.
3. Copy the API key and paste it into your `.env` file as `GEMINI_API_KEY`.

## 2. Set Up a Twilio WhatsApp Sandbox
1. Go to [Twilio](https://www.twilio.com/) and create a free account.
2. Verify your email and phone number.
3. In the Twilio Console, find your **Account SID** and **Auth Token** (usually on the home dashboard page). Copy these into your `.env` file as `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.
4. Navigate to **Messaging > Try it out > Send a WhatsApp message**.
5. You'll see a Twilio Sandbox number (e.g., `+1 415 523 8886`) and a join code (e.g., `join your-word`). Send that join code via a WhatsApp message to the Sandbox number from your personal phone. 
6. Put the Sandbox number into your `.env` file as `TWILIO_PHONE_NUMBER`.

## 3. Expose Your Local Server with Ngrok
To receive WhatsApp messages from Twilio, Twilio needs a public URL to hook into. Ngrok is an excellent tool for this.
1. Download and install [ngrok](https://ngrok.com/download) (or install via homebrew: `brew install ngrok`).
2. Run your local server:
   ```bash
   npm run dev
   ```
3. In a new terminal tab, run ngrok:
   ```bash
   ngrok http 3000
   ```
4. Ngrok will give you a "Forwarding" HTTPS URL (e.g., `https://abcd-1-2-3-4.ngrok-free.app`).

## 4. Link Twilio Webhook to Local Server
1. Go back to your [Twilio Sandbox Settings](https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox).
2. Look for the input field labeled **"WHEN A MESSAGE COMES IN"**.
3. Paste your ngrok URL combined with the API endpoint route: \`https://YOUR_NGROK_URL/api/whatsapp\` (Make sure it's set to \`HTTP POST\`).
4. Click **Save**.

Now you can send WhatsApp messages (text or documents/images) to the Twilio number, and it should trigger the Medsight bot!
