// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import chatbotRoutes from './routes/chatbotRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js'; // ⬅️ NEW: Import enrollment routes
import settingRoutes from './routes/settingRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://studyhabitcollege.vercel.app'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS: Origin ${origin} not allowed`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// ----------------------------------------------------
// All API Routes - Define them before starting server
// ----------------------------------------------------
app.get('/', (req, res) => {
    res.send('Studyhabit College API is running!');
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/parents', parentRoutes);
console.log('Parent routes initialized.'); // Keep this log for verification
app.use('/api/gallery', galleryRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/settings', settingRoutes);

// ----------------------------------------------------
// 404 Not Found Handler - MUST BE LAST AMONG ROUTES
// ----------------------------------------------------
app.use((req, res) => {
    console.log('❌ 404 Not Found:', req.originalUrl);
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Database Connection & Server Start - ONLY START LISTENING AFTER DB CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');
        // Start the server ONLY after MongoDB is connected
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));