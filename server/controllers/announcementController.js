/* eslint-disable @typescript-eslint/no-explicit-any */
// server/controllers/announcementController.js
import Announcement from '../models/Announcement.js';
import User from '../models/User.js'; // Assuming User model is needed for context but not directly used in the provided snippets.
import asyncHandler from 'express-async-handler'; // Assuming you have express-async-handler installed and used for error handling

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (All authenticated users can view, but filtering might apply later)
const getAnnouncements = asyncHandler(async (req, res) => {
    try {
        let query = {}; // Initialize an empty query object

        // Check if req.user exists and if the user is NOT an admin.
        // If the user is not an admin, apply the expiryDate filter.
        // If the user IS an admin, no expiryDate filter is added, so all announcements are fetched.
        if (req.user && req.user.role !== 'admin') {
            query.$or = [
                { expiryDate: null }, // Announcements that never expire
                { expiryDate: { $gte: new Date() } } // Announcements whose expiryDate is today or in the future
            ];
        }

        // You can add more filtering logic here based on targetAudience if needed,
        // for different user roles (student, faculty, etc.)
        // Example for students:
        // if (req.user && req.user.role === 'student') {
        //    query.targetAudience = { $in: ['all', 'students'] };
        // }

        const announcements = await Announcement.find(query)
            .populate('author', 'firstName lastName email role')
            .sort({ datePublished: -1 }); // Sort by most recent first

        res.status(200).json(announcements);
    } catch (error) {
        console.error(error); // Log the server-side error for debugging
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get single announcement by ID
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncementById = asyncHandler(async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate('author', 'firstName lastName email role');

        if (announcement) {
            res.status(200).json(announcement);
        } else {
            res.status(404).json({ message: 'Announcement not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = asyncHandler(async (req, res) => {
    const { title, content, targetAudience, expiryDate } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please enter all required fields: Title, Content.' });
    }

    try {
        const announcement = new Announcement({
            title,
            content,
            author: req.user._id, // The logged-in user is the author
            // Ensure targetAudience defaults to ['all'] if explicitly empty or not provided
            targetAudience: targetAudience && targetAudience.length > 0 ? targetAudience : ['all'],
            expiryDate: expiryDate || null, // Store null if expiryDate is not provided
        });

        const createdAnnouncement = await announcement.save();
        await createdAnnouncement.populate('author', 'firstName lastName email role');
        res.status(201).json(createdAnnouncement);
    } catch (error) {
        console.error(error);
        // Use error.statusCode if available from a custom error handler, otherwise default to 500
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
});

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = asyncHandler(async (req, res) => {
    const { title, content, targetAudience, expiryDate } = req.body;

    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Update fields if provided in the request body, otherwise keep existing values
        announcement.title = title !== undefined ? title : announcement.title;
        announcement.content = content !== undefined ? content : announcement.content;

        // Handle targetAudience update: if provided, update it. If it's an empty array, default to ['all'].
        // If targetAudience is not provided in the request, keep existing value.
        if (targetAudience !== undefined) {
            announcement.targetAudience = targetAudience.length > 0 ? targetAudience : ['all'];
        }

        // Update expiryDate: if provided (even if null explicitly), update it.
        // If not provided in the request, keep existing value.
        // Use 'null' to explicitly clear an expiry date.
        announcement.expiryDate = expiryDate !== undefined ? expiryDate : announcement.expiryDate;

        const updatedAnnouncement = await announcement.save();
        await updatedAnnouncement.populate('author', 'firstName lastName email role');
        res.status(200).json(updatedAnnouncement);
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Using deleteOne() for Mongoose 6+ to ensure hooks are run if defined
        await announcement.deleteOne();
        res.status(200).json({ message: 'Announcement removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
};