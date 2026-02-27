import axios from 'axios';

async function testUpload() {
    try {
        const payload = new URLSearchParams({
            From: 'whatsapp:+1234567890',
            Body: 'Here is my report',
            NumMedia: '1',
            MediaUrl0: 'https://raw.githubusercontent.com/twilio/twilio-node/main/package.json', // Dummy text file, just to test download
            MediaContentType0: 'text/plain'
        });

        const response = await axios.post('http://localhost:3000/api/whatsapp', payload, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        console.log("Response:", response.data);
    } catch (err: any) {
        console.error("Test failed:", err.message);
    }
}

testUpload();
