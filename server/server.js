// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors'; 
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


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); 
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://studyhabitcollege.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // ✅ Allow cookies / auth headers
})); 

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Studyhabit College API is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes); 
app.use('/api/students', studentRoutes);
console.log('✅ Mounting gradeRoutes on /api/grades');
app.use('/api/grades', gradeRoutes); 
app.use('/api/attendance', attendanceRoutes); 
app.use('/api/events', eventRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/gallery', galleryRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.originalUrl);
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});
