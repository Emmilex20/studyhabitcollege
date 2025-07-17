/* eslint-disable @typescript-eslint/no-explicit-any */
// server/controllers/announcementController.js
import Announcement from '../models/Announcement.js';
import User from '../models/User.js'; // Assuming User model is needed for context but not directly used in the provided snippets.

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (All authenticated users can view, but filtering might apply later)
const getAnnouncements = async (req, res) => {
    try {
        // Only show active announcements (not expired or no expiry date)
        const query = {
            $or: [
                { expiryDate: null },
                { expiryDate: { $gte: new Date() } }
            ]
        };

        // Future enhancement: Filter announcements by targetAudience based on user role
        // if (req.user.role === 'student') {
        //    query.targetAudience = { $in: ['all', 'students'] };
        // }

        const announcements = await Announcement.find(query)
            .populate('author', 'firstName lastName email role')
            .sort({ datePublished: -1 }); // Sort by most recent first

        res.status(200).json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single announcement by ID
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncementById = async (req, res) => {
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
};

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
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
            expiryDate: expiryDate || null,
        });

        const createdAnnouncement = await announcement.save();
        await createdAnnouncement.populate('author', 'firstName lastName email role');
        res.status(201).json(createdAnnouncement);
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = async (req, res) => {
    const { title, content, targetAudience, expiryDate } = req.body;

    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        announcement.title = title || announcement.title;
        announcement.content = content || announcement.content;

        // Handle targetAudience update: if provided and empty, default to ['all'].
        // If not provided in the request, keep existing value.
        if (targetAudience !== undefined) {
            announcement.targetAudience = targetAudience.length > 0 ? targetAudience : ['all'];
        }

        announcement.expiryDate = expiryDate !== undefined ? expiryDate : announcement.expiryDate;

        const updatedAnnouncement = await announcement.save();
        await updatedAnnouncement.populate('author', 'firstName lastName email role');
        res.status(200).json(updatedAnnouncement);
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        await announcement.deleteOne();
        res.status(200).json({ message: 'Announcement removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
};