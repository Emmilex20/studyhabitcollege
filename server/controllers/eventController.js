// server/controllers/eventController.js
import Event from '../models/Event.js';
import User from '../models/User.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Private (All authenticated users can view, but filtering might apply later)
const getEvents = async (req, res) => {
    try {
        let query = {};
        // Future enhancement: Filter events by targetAudience based on user role
        // if (req.user.role === 'student') {
        //     query.targetAudience = { $in: ['all', 'students'] };
        // } else if (req.user.role === 'teacher') {
        //     query.targetAudience = { $in: ['all', 'teachers'] };
        // } etc.

        const events = await Event.find(query)
            .populate('organizer', 'firstName lastName email role')
            .sort({ startDate: 1 }); // Sort by upcoming events
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'firstName lastName email role');

        if (event) {
            res.status(200).json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    const { title, description, startDate, endDate, location, targetAudience } = req.body;

    if (!title || !startDate || !endDate) {
        res.status(400);
        throw new Error('Please enter all required fields: Title, Start Date, End Date.');
    }

    if (new Date(startDate) > new Date(endDate)) {
        res.status(400);
        throw new Error('End date cannot be before start date.');
    }

    try {
        const event = new Event({
            title,
            description,
            startDate,
            endDate,
            location,
            organizer: req.user._id, // The logged-in user is the organizer
            targetAudience: targetAudience || ['all'],
        });

        const createdEvent = await event.save();
        await createdEvent.populate('organizer', 'firstName lastName email role');
        res.status(201).json(createdEvent);
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
    const { title, description, startDate, endDate, location, targetAudience } = req.body;

    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            // Ensure the user updating is an admin or the original organizer (optional: check if req.user._id === event.organizer.toString())
            // For now, only admin is authorized by middleware.

            if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                res.status(400);
                throw new Error('End date cannot be before start date.');
            }

            event.title = title || event.title;
            event.description = description !== undefined ? description : event.description;
            event.startDate = startDate || event.startDate;
            event.endDate = endDate || event.endDate;
            event.location = location !== undefined ? location : event.location;
            event.targetAudience = targetAudience !== undefined ? targetAudience : event.targetAudience;

            const updatedEvent = await event.save();
            await updatedEvent.populate('organizer', 'firstName lastName email role');
            res.status(200).json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            // Ensure the user deleting is an admin or the original organizer (optional)
            await event.deleteOne();
            res.status(200).json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
};