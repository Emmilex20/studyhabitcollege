/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/dashboard/student/AnnouncementsPage.tsx
import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; // Adjust path

interface PostedBy {
    firstName: string;
    lastName: string;
}

interface Announcement {
    _id: string;
    title: string;
    content: string;
    datePosted: string;
    postedBy?: PostedBy;
    targetAudience: string;
}

const AnnouncementsPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const response = await api.get('/student/me/announcements');
                setAnnouncements(response.data);
            } catch (err: any) {
                console.error('Error fetching announcements:', err);
                setError(err.response?.data?.message || 'Failed to load announcements. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    if (loading) return <p>Loading announcements...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (announcements.length === 0) return <p>No announcements available.</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Announcements</h2>
            <div className="space-y-4">
                {announcements.map((announcement) => (
                    <div key={announcement._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-lg font-semibold text-blue-700">{announcement.title}</h3>
                        <p className="text-gray-700 mt-1">{announcement.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Posted by: {announcement.postedBy ? `${announcement.postedBy.firstName} ${announcement.postedBy.lastName}` : 'Admin'} on {new Date(announcement.datePosted).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">Target: {announcement.targetAudience}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnnouncementsPage;