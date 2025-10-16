import React, { useState, useEffect } from 'react';
import { getListings } from '../services/api';
import { Listing } from '../types';
import MapView from './MapView';
import ListingCard from './ListingCard';

interface ListingsGridProps {
    searchTerm: string;
}

const ListingsGrid: React.FC<ListingsGridProps> = ({ searchTerm }) => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'map'>('grid');

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                const data = await getListings(searchTerm);
                setListings(data);
            } catch (error) {
                console.error("Failed to fetch listings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [searchTerm]);

    return (
        <section id="available-rooms" className="mb-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">
                    {searchTerm ? `Results for "${searchTerm}"` : 'Available Rooms'}
                </h2>
                <div className="flex items-center space-x-2 bg-gray-200 p-1 rounded-lg">
                    <button 
                        onClick={() => setView('grid')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'grid' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                    >
                        <i data-lucide="layout-grid" className="w-4 h-4 inline-block mr-1"></i>
                        Grid
                    </button>
                    <button 
                        onClick={() => setView('map')}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${view === 'map' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                    >
                         <i data-lucide="map" className="w-4 h-4 inline-block mr-1"></i>
                        Map
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64"><div className="loader"></div></div>
            ) : listings.length === 0 ? (
                <div className="text-center py-16 bg-gray-100 rounded-lg">
                    <i data-lucide="search-x" className="w-16 h-16 mx-auto text-gray-400 mb-4"></i>
                    <h3 className="text-xl font-semibold">No Listings Found</h3>
                    <p className="text-gray-500 mt-2">
                        {searchTerm 
                            ? "Try adjusting your search terms." 
                            : "Check back later for new listings."}
                    </p>
                </div>
            ) : view === 'map' ? (
                 <MapView listings={listings} />
            ) : (
                <div id="listings-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default ListingsGrid;