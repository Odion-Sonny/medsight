# Medsight - WhatsApp AI Assistant

Medsight is an intelligent WhatsApp chatbot designed to assist with processing medical contexts, specifically text messages and medical reports (images and PDFs). Using the **Gemini API** for AI-driven analysis and **Twilio** for seamless WhatsApp integration, Medsight operates as an active virtual health assistant capable of receiving uploads, extracting text/information, and generating natural language insights.

## Features

- **WhatsApp Integration:** Built with Twilio's API to receive and send messages through a WhatsApp Sandbox or Live Phone Number limitlessly.
- **Multimodal AI Responses:** Employs the Gemini API from Google to interpret text and analyze attached medical reports (like PDFs or images).
- **Media Downloading & Processing:** Fetches attached media securely from Twilio, handles format conversions, and prepares the data for AI context.
- **Conversation State/Memory Management:** Uses SQLite to store the state or recent history of messages ensuring context-aware dialog with users.
- **Automated Memory Cleanup:** Uses `node-cron` to automatically scrub chat context older than 24 hours, guaranteeing user privacy and database efficiency.
- **TypeScript Support:** Strictly typed Node.js codebase assuring high reliability, easier refactoring, and robustness.

## Tech Stack

- **Runtime Engine:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **AI Core:** Google Gemini API (`@google/genai`)
- **Messaging/Comms:** Twilio WhatsApp API
- **Database:** SQLite3
- **Scheduling:** Node-Cron (for 24h data lifecycle)
- **Deployment & Dev:** ts-node, nodemon, ngrok (for local webhooks)

## Project Structure

```text
medsight/
├── src/
│   ├── database/          # SQLite connection and cleanup transactions (db.ts)
│   ├── routes/            # Express endpoints (webhook.ts maps /api/whatsapp)
│   ├── services/          # Core logics (geminiService.ts, twilioService.ts)
│   ├── utils/             # Helpers (mediaDownloader.ts downloads Twilio media)
│   └── server.ts          # Main Express application entry point
├── .env.example           # Environment variable template
├── SETUP_INSTRUCTIONS.md  # Detailed account setup guides (Twilio/Gemini/Ngrok)
├── package.json           # Dependencies and core project scripts
└── tsconfig.json          # TypeScript compiler options
```

## Getting Started

### Prerequisites
- Node.js installed (v16+ recommended).
- A valid Google Account for creating a Gemini AI Studio API key.
- A free/paid Twilio Account to set up a WhatsApp sandbox.
- [Ngrok](https://ngrok.com/) installed (for testing webhooks locally).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Odion-Sonny/medsight.git
   cd medsight
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the Environment**
   Duplicate `.env.example` into a new file named `.env`, then fill in your keys:
   ```bash
   cp .env.example .env
   ```
   *Required variables typically include `GEMINI_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.*

> **Note:** For a complete, step-by-step walkthrough on how to generate the API keys for Twilio, Gemini, and linking Ngrok, please refer strictly to the `SETUP_INSTRUCTIONS.md` file included in this repo.

## Running the Application

### Development Mode

Starts the server with `nodemon` to automatically restart upon any code modifications:
```bash
npm run dev
```

### Production Mode

Starts the compiled or direct `ts-node` server for persistent deployment:
```bash
npm start
```

### Connecting the Webhook (Local Testing)
If running locally, you must tunnel your `localhost:3000` via Ngrok to provide Twilio with a publicly available HTTPS route.

1. Once the server is running, open a new terminal:
   ```bash
   ngrok http 3000
   ```
2. Copy the resulting forwarding URL.
3. Apply `https://<YOUR_NGROK_URL>/api/whatsapp` to your Twilio Sandbox settings under "WHEN A MESSAGE COMES IN...".

## License

This project is licensed under the **ISC** License.
