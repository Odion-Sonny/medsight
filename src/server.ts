import express from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Load env variables first
dotenv.config();

import { initDb, cleanupOldMessages } from './database/db';
import webhookRouter from './routes/webhook';

const app = express();
const port = process.env.PORT || 3000;

// Parse incoming TwiML/UrlEncoded body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/api', webhookRouter);

// Database Initialization
initDb().then(() => {
    console.log("Database initialized successfully.");

    // Setup Cron Job - Run every hour
    cron.schedule('0 * * * *', async () => {
        try {
            console.log("Running scheduled cleanup of old messages...");
            const deletedCount = await cleanupOldMessages();
            console.log(`Cleanup complete: ${deletedCount} messages older than 24 hours deleted.`);
        } catch (err) {
            console.error("Error during scheduled cleanup:", err);
        }
    });

    // Start server
    app.listen(port, () => {
        console.log(`Medsight Server is running on port ${port}`);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
    });
}).catch((err) => {
    console.error("Failed to initialize database. Exiting.", err);
    process.exit(1);
});
