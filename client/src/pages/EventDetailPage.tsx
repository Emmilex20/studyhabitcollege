// src/pages/EventDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns'; // For better date formatting
import { IoArrowBackCircleOutline } from 'react-icons/io5'; // Example icon for back button

interface EventDetail {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location?: string;
    imageUrl?: string;
    organizer?: {
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
    targetAudience: string[];
    createdAt: string;
    updatedAt: string;
}

const EventDetailPage: React.FC = () => {
    // Get the 'id' parameter from the URL
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            setError(null);
            try {
                // Adjust this URL to your actual backend API endpoint
                // If your public events are at /api/events/public/:id, change this
                // Based on your server/routes/eventRoutes.js, the public endpoint is /api/events/public
                // However, getEventById is a PROTECTED route in eventController.js.
                // For public access, you'd need a separate public route for single events, e.g.,
                // router.get('/public/:id', getEventById);
                // For now, I'll assume you want to use the protected one, which means
                // a user must be logged in to view event details this way.
                // If you want it public, you need to create a `getPublicEventById` in your controller
                // and a public route for it in `eventRoutes.js`.
                const token = localStorage.getItem('token'); // Assuming you store token in localStorage
                
                const response = await axios.get(
                    `https://studyhabitcollege.onrender.com/api/events/${id}`, // Your backend API base URL
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Include token for protected route
                        },
                    }
                );
                setEvent(response.data);
            } catch (err) {
                console.error('Failed to fetch event details:', err);
                if (axios.isAxiosError(err) && err.response) {
                    if (err.response.status === 404) {
                        setError('Event not found. It might have been removed or the link is incorrect.');
                    } else if (err.response.status === 401 || err.response.status === 403) {
                         setError('You are not authorized to view this event. Please log in or ensure you have the correct permissions.');
                    } else {
                        setError(`Error loading event: ${err.response.data.message || 'Server error'}`);
                    }
                } else {
                    setError('An unexpected error occurred while fetching event details.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEvent();
        } else {
            setLoading(false);
            setError('No event ID provided in the URL.');
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-lg text-gray-700">Loading event details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 px-4">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
                <p className="text-xl text-gray-700">{error}</p>
                <Link to="/news" className="mt-8 inline-flex items-center text-blue-700 hover:text-yellow-600 font-semibold transition-colors">
                    <IoArrowBackCircleOutline className="mr-2 text-2xl" /> Back to News & Events
                </Link>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center py-20 px-4">
                <h1 className="text-3xl font-bold text-gray-700 mb-4">Event Not Found</h1>
                <p className="text-xl text-gray-600">The event you are looking for does not exist.</p>
                <Link to="/news" className="mt-8 inline-flex items-center text-blue-700 hover:text-yellow-600 font-semibold transition-colors">
                    <IoArrowBackCircleOutline className="mr-2 text-2xl" /> Back to News & Events
                </Link>
            </div>
        );
    }

    // Format dates
    const formattedStartDate = format(new Date(event.startDate), 'MMMM dd, yyyy HH:mm');
    const formattedEndDate = format(new Date(event.endDate), 'MMMM dd, yyyy HH:mm');

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <nav className="mb-6">
                <Link to="/news" className="inline-flex items-center text-blue-700 hover:text-yellow-600 font-semibold transition-colors">
                    <IoArrowBackCircleOutline className="mr-2 text-2xl" /> Back to News & Events
                </Link>
            </nav>

            <article className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                {event.imageUrl && (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-80 object-cover"
                    />
                )}
                <div className="p-6 sm:p-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 mb-4 leading-tight">
                        {event.title}
                    </h1>
                    <div className="text-gray-600 text-sm sm:text-base mb-6 space-y-1">
                        <p><strong className="text-blue-800">Date:</strong> {formattedStartDate} - {formattedEndDate}</p>
                        {event.location && <p><strong className="text-blue-800">Location:</strong> {event.location}</p>}
                        {event.organizer && (
                            <p>
                                <strong className="text-blue-800">Organizer:</strong> {event.organizer.firstName} {event.organizer.lastName} ({event.organizer.role})
                            </p>
                        )}
                        {event.targetAudience && event.targetAudience.length > 0 && (
                            <p>
                                <strong className="text-blue-800">Audience:</strong> {event.targetAudience.map(audience => audience.charAt(0).toUpperCase() + audience.slice(1)).join(', ')}
                            </p>
                        )}
                    </div>
                    
                    <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-8">
                        {/* Assuming description might contain paragraphs or line breaks */}
                        {event.description.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4 text-justify">{paragraph}</p>
                        ))}
                    </div>

                    <p className="text-sm text-gray-500 mt-4">
                        Last updated: {format(new Date(event.updatedAt), 'MMMM dd, yyyy HH:mm')}
                    </p>
                </div>
            </article>
        </div>
    );
};

export default EventDetailPage;