// src/components/modals/EventFormModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Event {
    _id: string;
    title: string;
    description?: string;
    startDate: string; // ISO string
    endDate: string; // ISO string
    location?: string;
    organizer: { _id: string; firstName: string; lastName: string; };
    targetAudience: string[];
    // createdAt and other fields might be present from the backend but not needed for form input
}

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventToEdit?: Event | null; // Null for create, object for edit
    onSave: (event: Event) => void;
    // Add the new props here
    currentUserId: string | undefined;
    userToken: string | undefined;
}

const targetAudienceOptions = ['all', 'students', 'teachers', 'parents', 'JSS1', 'SS2', 'Year 7']; // Extend as needed

const EventFormModal: React.FC<EventFormModalProps> = ({
    isOpen,
    onClose,
    eventToEdit,
    onSave,
    currentUserId, // Destructure the new prop
    userToken,   // Destructure the new prop
}) => {
    // We already have userInfo from useAuth, which contains _id and token,
    // so `currentUserId` and `userToken` passed as props are redundant if `useAuth` is already used internally.
    // However, for explicit prop passing as per your request and to ensure they're available if `useAuth` isn't fully reliable or for testing, we'll use them.
    // For this specific use case, relying on `userInfo` directly from `useAuth` is more idiomatic.
    const { userInfo } = useAuth(); // Keeping this as it's already used for auth token

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        targetAudience: [] as string[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (eventToEdit) {
            setFormData({
                title: eventToEdit.title,
                description: eventToEdit.description || '',
                startDate: eventToEdit.startDate.split('T')[0], // Format for input type="date"
                endDate: eventToEdit.endDate.split('T')[0],     // Format for input type="date"
                location: eventToEdit.location || '',
                targetAudience: eventToEdit.targetAudience || ['all'],
            });
        } else {
            setFormData({
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                location: '',
                targetAudience: ['all'], // Default to 'all' for new events
            });
        }
        setError(null);
    }, [eventToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAudienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, targetAudience: options }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Prefer `userToken` from props if provided, otherwise fall back to `userInfo.token`
        const tokenToUse = userToken || userInfo?.token;
        const userIdToUse = currentUserId || userInfo?._id; // Prefer `currentUserId` from props

        if (!tokenToUse || !userIdToUse) {
            setError('Authentication token or user ID is missing. Cannot save event.');
            setIsSubmitting(false);
            return;
        }

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError('End date cannot be before start date.');
            setIsSubmitting(false);
            return;
        }

        const config = {
            headers: {
                Authorization: `Bearer ${tokenToUse}`,
                'Content-Type': 'application/json',
            },
        };

        try {
            let response;
            const payload = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                targetAudience: formData.targetAudience.length > 0 ? formData.targetAudience : ['all'],
                // Set organizer for new events or if editing an event created by current user
                // The backend should handle validation if `organizer` needs to match `currentUserId` for updates.
                // For creation, we ensure the current user is set as the organizer.
                organizer: userIdToUse, // This sends the organizer's ID
            };

            if (eventToEdit) {
                // When editing, the backend might ignore the organizer field from payload
                // if the event already has an organizer and updates are restricted to that organizer.
                // This typically depends on your backend's API design.
                response = await axios.put(`https://studyhabitcollege.onrender.com/api/events/${eventToEdit._id}`, payload, config);
            } else {
                response = await axios.post('https://studyhabitcollege.onrender.com/api/events', payload, config);
            }
            onSave(response.data);
            onClose();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Event form submission error:", err);
            setError(err.response?.data?.message || 'Failed to save event. Please check your input and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg my-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b pb-3">
                            {eventToEdit ? 'Edit Event' : 'Create New Event'}
                        </h2>

                        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (Optional)</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="e.g., Main Hall, Online"
                                />
                            </div>
                            <div>
                                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">Target Audience (Ctrl/Cmd+Click to select multiple)</label>
                                <select
                                    id="targetAudience"
                                    name="targetAudience"
                                    multiple
                                    value={formData.targetAudience}
                                    onChange={handleAudienceChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-32"
                                >
                                    {targetAudienceOptions.map(option => (
                                        <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-2"></i> Saving...
                                        </>
                                    ) : (
                                        eventToEdit ? 'Save Changes' : 'Create Event'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EventFormModal;