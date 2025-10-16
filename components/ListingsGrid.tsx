import React, { useState, useEffect } from 'react';
import { getListings } from '../services/firebase';
import { Listing } from '../types';
import MapView from './MapView'; // Import the new MapView component

const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
        <div className="relative">
            <img src={listing.imageUrl} alt={listing.title} className="w-full h-48 object-cover"/>
            {listing.isVerified && (
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <i data-lucide="shield-check" className="w-4 h-4 mr-1"></i>
                    Verified
                </div>
            )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-bold text-lg mb-1">{listing.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{listing.location}</p>
            <p className="text-blue-600 font-semibold text-lg mt-auto">R{listing.price} / month</p>
        </div>
    </div>
);

const ListingsGrid: React.FC = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'map'>('grid');

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const data = await getListings();
                setListings(data);
            } catch (error) {
                console.error("Failed to fetch listings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    return (
        <section id="available-rooms" className="mb-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Available Rooms</h2>
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
            ) : view === 'map' ? (
                 <MapView listings={listings} />
            ) : (
                <div id="listings-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {listings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default ListingsGrid;