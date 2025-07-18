// server/controllers/chatbotController.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
import fs from 'fs'; // Import the file system module
import path from 'path'; // Import the path module
import { fileURLToPath } from 'url'; // For ES Modules to get __dirname

dotenv.config();

// --- Configuration for __dirname in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- End Configuration ---

// Path to your JSON data file
const schoolDataPath = path.join(__dirname, '../data/schoolData.json');
let schoolData = {};

try {
    const rawData = fs.readFileSync(schoolDataPath, 'utf8');
    schoolData = JSON.parse(rawData);
} catch (error) {
    console.error('Error loading schoolData.json:', error);
    // Handle the error appropriately, e.g., log it and continue with empty data
    // or exit the process if the data is critical.
}


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// Helper function to find relevant data (very basic keyword matching)
const retrieveRelevantInfo = (query) => {
    query = query.toLowerCase();
    let context = [];

    // Ensure schoolData is loaded before trying to access its properties
    if (Object.keys(schoolData).length === 0) {
        console.warn('schoolData is empty. Cannot retrieve specific info.');
        return ''; // Return empty if data isn't loaded
    }

    if (query.includes('about') || query.includes('college')) {
        if (schoolData.about) context.push(`About our college: ${schoolData.about}`);
    }
    if (query.includes('admissions') || query.includes('apply')) {
        if (schoolData.admissions) context.push(`Admissions information: ${schoolData.admissions}`);
    }
    if (query.includes('courses') || query.includes('classes') || query.includes('subjects')) {
        if (schoolData.courses && schoolData.courses.length > 0) {
            context.push("Here are some of our courses:");
            schoolData.courses.forEach(course => {
                context.push(`- ${course.code}: ${course.name} - ${course.description}`);
            });
        }
    }
    if (query.includes('contact') || query.includes('reach us')) {
        if (schoolData.contact) context.push(`Contact information: ${schoolData.contact}`);
    }
    if (query.includes('events') || query.includes('calendar')) {
        if (schoolData.events && schoolData.events.length > 0) {
            context.push("Upcoming events:");
            schoolData.events.forEach(event => {
                context.push(`- ${event.name} on ${event.date}`);
            });
        }
    }

    return context.join('\n');
};


const handleChatbotMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message content is required.' });
    }

    try {
        const relevantInfo = retrieveRelevantInfo(message);

        let systemInstruction = `You are a helpful assistant for Study Habit College. Use the provided information to answer questions about the college. If the information does not contain the answer, state that you don't have that specific detail but can answer general college-related questions.`;

        let promptContent = `User: ${message}`;

        if (relevantInfo) {
            promptContent = `Here is some information about Study Habit College:\n\n${relevantInfo}\n\n${promptContent}`;
        }

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: promptContent }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
        });

        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error('Error generating AI response:', error);
        res.status(500).json({ message: 'Failed to get a response from the AI.', error: error.message });
    }
});

export { handleChatbotMessage };