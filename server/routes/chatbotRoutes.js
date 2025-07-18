// server/routes/chatbotRoutes.js
import express from 'express';
import { handleChatbotMessage } from '../controllers/chatbotController.js';
// import { protect } from '../middleware/authMiddleware.js'; // Uncomment if you need authentication

const router = express.Router();

// Define the POST route for sending messages to the chatbot.
// Consider adding 'protect' middleware if only authenticated users should use the chatbot.
router.post('/message', handleChatbotMessage);

export default router;