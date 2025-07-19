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
    imageUrl?: string; // ✨ NEW: Include imageUrl in the interface ✨
    // createdAt and other fields might be present from the backend but not needed for form input
}

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventToEdit?: Event | null; // Null for create, object for edit
    onSave: (event: Event) => void;
    currentUserId: string | undefined;
    userToken: string | undefined;
}

const targetAudienceOptions = ['all', 'students', 'teachers', 'parents', 'JSS1', 'SS2', 'Year 7']; // Extend as needed

const EventFormModal: React.FC<EventFormModalProps> = ({
    isOpen,
    onClose,
    eventToEdit,
    onSave,
    currentUserId,
    userToken,
}) => {
    const { userInfo } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        targetAudience: [] as string[],
        // ✨ Initialize imageUrl for existing events or empty for new ✨
        imageUrl: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null); // For displaying selected image
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
                imageUrl: eventToEdit.imageUrl || '', // ✨ Set existing image URL ✨
            });
            setImagePreview(eventToEdit.imageUrl || null); // Display existing image
            setSelectedFile(null); // Clear any previously selected file
        } else {
            setFormData({
                title: '',
                description: '',
                startDate: '',
                endDate: '',
                location: '',
                targetAudience: ['all'],
                imageUrl: '',
            });
            setImagePreview(null); // Clear image preview for new events
            setSelectedFile(null); // Clear selected file for new events
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

    // ✨ Handle file selection ✨
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file)); // Create a local URL for preview
        } else {
            setSelectedFile(null);
            setImagePreview(null);
        }
    };

    // ✨ Handle removing existing image for edit ✨
    const handleRemoveImage = () => {
        setSelectedFile(null); // Clear selected file
        setImagePreview(null); // Clear preview
        setFormData(prev => ({ ...prev, imageUrl: '' })); // Set imageUrl to empty string to signal removal
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const tokenToUse = userToken || userInfo?.token;
        const userIdToUse = currentUserId || userInfo?._id;

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

        const dataToSend = new FormData();
        dataToSend.append('title', formData.title);
        dataToSend.append('description', formData.description);
        dataToSend.append('startDate', new Date(formData.startDate).toISOString());
        dataToSend.append('endDate', new Date(formData.endDate).toISOString());
        dataToSend.append('location', formData.location);
        formData.targetAudience.forEach(audience => dataToSend.append('targetAudience[]', audience)); // Append array elements correctly
        dataToSend.append('organizer', userIdToUse); // Organizer ID

        // ✨ Append image if selected, or existing imageUrl if no new file and not removed ✨
        if (selectedFile) {
            dataToSend.append('image', selectedFile); // 'image' should match the name in multerConfig.js upload.single('image')
        } else if (eventToEdit && !selectedFile && formData.imageUrl) {
            // If no new file selected, but there's an existing image URL from the eventToEdit,
            // and it hasn't been explicitly cleared by the user, send the old URL back.
            // Backend update function needs to handle if imageUrl is empty string for removal.
             dataToSend.append('imageUrl', formData.imageUrl);
        } else if (eventToEdit && !selectedFile && formData.imageUrl === '') {
            // If the user explicitly removed the image (imageUrl in state is empty)
            dataToSend.append('imageUrl', ''); // Send empty string to backend to clear image
        }


        const config = {
            headers: {
                Authorization: `Bearer ${tokenToUse}`,
                // 'Content-Type': 'multipart/form-data' is automatically set by axios when sending FormData
            },
        };

        try {
            let response;
            if (eventToEdit) {
                response = await axios.put(`https://studyhabitcollege.onrender.com/api/events/${eventToEdit._id}`, dataToSend, config);
            } else {
                response = await axios.post('https://studyhabitcollege.onrender.com/api/events', dataToSend, config);
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

                            {/* ✨ NEW: Image Upload Field ✨ */}
                            <div className="border border-dashed border-gray-300 p-4 rounded-md text-center">
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                                    Upload Event Image (Optional)
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden" // Hide default file input
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('image')?.click()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <i className="fas fa-upload mr-2"></i> Choose File
                                </button>
                                {imagePreview && (
                                    <div className="mt-4 flex flex-col items-center">
                                        <img src={imagePreview} alt="Event Preview" className="max-h-48 w-auto rounded-md shadow-md object-contain" />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                                        >
                                            <i className="fas fa-times-circle mr-1"></i> Remove Image
                                        </button>
                                    </div>
                                )}
                                {!imagePreview && selectedFile && (
                                    <p className="mt-2 text-sm text-gray-500">{selectedFile.name}</p>
                                )}
                                {!imagePreview && !selectedFile && !formData.imageUrl && (
                                    <p className="mt-2 text-sm text-gray-500">No file chosen</p>
                                )}
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