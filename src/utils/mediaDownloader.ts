import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export const downloadTwilioMedia = async (mediaUrl: string, mimeType: string): Promise<string> => {
    // Generate a unique file name
    const ext = mimeType.split('/')[1] || 'tmp';
    const filename = `${crypto.randomBytes(16).toString('hex')}.${ext}`;

    // Create temp directory if it doesn't exist
    const tmpDir = path.resolve(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }

    const filePath = path.resolve(tmpDir, filename);

    // Download the file securely from Twilio using HTTP Basic Auth
    try {
        const response = await axios({
            method: 'GET',
            url: mediaUrl,
            responseType: 'stream',
            auth: {
                username: process.env.TWILIO_ACCOUNT_SID || '',
                password: process.env.TWILIO_AUTH_TOKEN || ''
            }
        });

        const writer = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error: Error | null = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(filePath);
                }
            });
        });
    } catch (err: any) {
        console.error('Failed to download media from Twilio:', err?.message || err);
        if (err?.response?.status) {
            console.error('Twilio Response Status:', err.response.status);
            console.error('Twilio Response Data:', typeof err.response.data === 'string' ? err.response.data : 'Binary stream data error');
        }
        throw err;
    }
};
