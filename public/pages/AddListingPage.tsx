import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing, NewListingPayload } from '../services/api';
import { Lucide } from '../components/Lucide';

const AddListingPage: React.FC = () => {
    const [formData, setFormData] = useState<NewListingPayload>({
        title: '',
        price: 0,
        location: '',
        description: '',
        imageUrl: '',
        gpsLat: 0,
        gpsLng: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createListing(formData);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'An error occurred while creating the listing.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 py-12">
            <Lucide />
            <div className="container mx-auto max-w-2xl">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Add a New Property</h2>
                    <p className="text-center text-gray-600 mb-8">Fill out the details below to list your room on KasiStays.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
                        
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Property Title</label>
                            <input type="text" name="title" id="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location / Address</label>
                            <input type="text" name="location" id="location" required value={formData.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" id="description" rows={4} required value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price per month (R)</label>
                            <input type="number" name="price" id="price" required value={formData.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>

                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                            <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="https://example.com/image.jpg"/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="gpsLat" className="block text-sm font-medium text-gray-700">GPS Latitude</label>
                                <input type="number" step="any" name="gpsLat" id="gpsLat" required value={formData.gpsLat} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div>
                                <label htmlFor="gpsLng" className="block text-sm font-medium text-gray-700">GPS Longitude</label>
                                <input type="number" step="any" name="gpsLng" id="gpsLng" required value={formData.gpsLng} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                             <button type="button" onClick={() => navigate('/dashboard')} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors mr-2">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-blue-700 transition-colors disabled:bg-blue-300">
                                {loading ? <div className="loader !w-5 !h-5 !border-2 mr-2"></div> : <i data-lucide="plus" className="w-4 h-4 mr-2"></i>}
                                {loading ? 'Submitting...' : 'Submit Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddListingPage;