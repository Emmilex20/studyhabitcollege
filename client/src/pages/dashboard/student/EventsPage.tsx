/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/student/EventsPage.tsx
import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; // Adjust path

interface Event {
    _id: string;
    name: string;
    description?: string;
    eventDate: string;
    endDate?: string;
    location?: string;
    targetAudience: string;
}

const EventsPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await api.get('/student/me/events');
                setEvents(response.data);
            } catch (err: any) {
                console.error('Error fetching events:', err);
                setError(err.response?.data?.message || 'Failed to load events. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) return <p>Loading events...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (events.length === 0) return <p>No upcoming events.</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
            <div className="space-y-4">
                {events.map((event) => (
                    <div key={event._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-lg font-semibold text-blue-700">{event.name}</h3>
                        <p className="text-gray-700 mt-1">{event.description}</p>
                        <p className="text-sm text-gray-600 mt-2">
                            Date: {new Date(event.eventDate).toLocaleDateString()}
                            {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                        </p>
                        {event.location && <p className="text-sm text-gray-600">Location: {event.location}</p>}
                        <p className="text-xs text-gray-400">Target: {event.targetAudience}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventsPage;