// server/controllers/chatbotController.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Initialize the model here. Choose the appropriate model for your needs.
// For text-only chat, 'gemini-pro' is a good choice.
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// This function will handle messages from the frontend.
// For a stateful conversation, you'd manage chat history per user (e.g., in a database).
const handleChatbotMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message content is required.' });
    }

    try {
        // Send the user's message to the Gemini AI model
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text(); // Extract the plain text reply from the AI

        // Send the AI's reply back to the frontend
        res.status(200).json({ reply: text });
    } catch (error) {
        console.error('Error generating AI response:', error);
        res.status(500).json({ message: 'Failed to get a response from the AI.', error: error.message });
    }
});

export { handleChatbotMessage };