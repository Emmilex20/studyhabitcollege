// server/controllers/chatbotController.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

dotenv.config();

console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Key Loaded' : 'Key NOT Loaded');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// CHANGE THIS LINE:
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // <--- Try "gemini-1.5-flash"

// If "gemini-1.5-flash" doesn't work or you need more power, try "gemini-1.5-pro"
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });


const handleChatbotMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        console.log('Received empty message.');
        return res.status(400).json({ message: 'Message content is required.' });
    }

    console.log('Received message for AI:', message);

    try {
        const result = await model.generateContent(message);
        console.log('AI response result object:', result);
        const response = await result.response;
        const text = response.text();
        console.log('AI response text:', text);

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error('Error generating AI response:', error);
        res.status(500).json({ message: 'Failed to get a response from the AI.', error: error.message });
    }
});

export { handleChatbotMessage };