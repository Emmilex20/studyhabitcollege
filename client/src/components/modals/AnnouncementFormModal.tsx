// src/components/modals/AnnouncementFormModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Announcement {
    _id: string;
    title: string;
    content: string;
    author: { _id: string; firstName: string; lastName: string; };
    datePublished: string;
    targetAudience: string[];
    expiryDate?: string; // ISO string or null
}

interface AnnouncementFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    announcementToEdit?: Announcement | null; // Null for create, object for edit
    onSave: (announcement: Announcement) => void;
}

const targetAudienceOptions = ['all', 'students', 'teachers', 'parents', 'JSS1', 'SS2', 'Year 7']; // Extend as needed

const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({ isOpen, onClose, announcementToEdit, onSave }) => {
    const { userInfo } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        targetAudience: [] as string[],
        expiryDate: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (announcementToEdit) {
            setFormData({
                title: announcementToEdit.title,
                content: announcementToEdit.content,
                targetAudience: announcementToEdit.targetAudience || ['all'],
                expiryDate: announcementToEdit.expiryDate ? announcementToEdit.expiryDate.split('T')[0] : '', // Format for input type="date"
            });
        } else {
            setFormData({
                title: '',
                content: '',
                targetAudience: ['all'],
                expiryDate: '',
            });
        }
        setError(null);
    }, [announcementToEdit, isOpen]);

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

        if (!userInfo?.token) {
            setError('User not authenticated.');
            setIsSubmitting(false);
            return;
        }

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
                'Content-Type': 'application/json',
            },
        };

        try {
            let response;
            const payload = {
                ...formData,
                targetAudience: formData.targetAudience.length > 0 ? formData.targetAudience : ['all'],
                expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
            };

            if (announcementToEdit) {
                response = await axios.put(`https://studyhabitcollege.onrender.com/api/announcements/${announcementToEdit._id}`, payload, config);
            } else {
                response = await axios.post('https://studyhabitcollege.onrender.com/api/announcements', payload, config);
            }
            onSave(response.data);
            onClose();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Announcement form submission error:", err);
            setError(err.response?.data?.message || 'Failed to save announcement.');
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
                            {announcementToEdit ? 'Edit Announcement' : 'Create New Announcement'}
                        </h2>

                        {error && <p className="text-red-500 mb-4">{error}</p>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
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
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    rows={5}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">Target Audience (Ctrl+Click to select multiple)</label>
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
                            <div>
                                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                                <input
                                    type="date"
                                    id="expiryDate"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">Announcement will no longer be visible after this date.</p>
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
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : (announcementToEdit ? 'Save Changes' : 'Create Announcement')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AnnouncementFormModal;