// server/controllers/eventController.js
import Event from '../models/Event.js';
import User from '../models/User.js'; // Ensure User model is needed and imported

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
    const { title, description, startDate, endDate, location, targetAudience, course } = req.body;
    // ✨ Get imageUrl from req.file.path (where Multer Cloudinary Storage puts it) ✨
    const imageUrl = req.file ? req.file.path : undefined;

    if (!title || !startDate || !endDate) {
        res.status(400);
        return res.json({ message: 'Please enter all required fields: Title, Start Date, End Date.' }); // Use return here
    }

    if (new Date(startDate) > new Date(endDate)) {
        res.status(400);
        return res.json({ message: 'End date cannot be before start date.' }); // Use return here
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
            course: course || undefined, // Assign course if provided
            imageUrl, // ✨ Assign the imageUrl ✨
        });

        const createdEvent = await event.save();
        await createdEvent.populate('organizer', 'firstName lastName email role');
        res.status(201).json(createdEvent);
    } catch (error) {
        console.error(error);
        // Use error.message for more specific errors
        res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
    const { title, description, startDate, endDate, location, targetAudience, course } = req.body;
    // ✨ Get imageUrl from req.file.path if a new file was uploaded ✨
    // If no new file, and imageUrl is explicitly sent as empty string, it means clear it.
    // Otherwise, retain the existing one.
    let imageUrl = req.file ? req.file.path : req.body.imageUrl;
    // If client sends imageUrl: '', it means they want to remove the existing image
    if (req.body.imageUrl === '') {
      imageUrl = '';
    }

    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                res.status(400);
                return res.json({ message: 'End date cannot be before start date.' });
            }

            event.title = title || event.title;
            event.description = description !== undefined ? description : event.description;
            event.startDate = startDate || event.startDate;
            event.endDate = endDate || event.endDate;
            event.location = location !== undefined ? location : event.location;
            event.targetAudience = targetAudience !== undefined ? targetAudience : event.targetAudience;
            event.course = course !== undefined ? course : event.course; // Update course field
            event.imageUrl = imageUrl; // ✨ Update imageUrl here ✨

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
            // Optional: If you want to delete the image from Cloudinary when event is deleted
            // if (event.imageUrl) {
            //   const publicId = event.imageUrl.split('/').pop().split('.')[0];
            //   await cloudinary.uploader.destroy(publicId);
            // }
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