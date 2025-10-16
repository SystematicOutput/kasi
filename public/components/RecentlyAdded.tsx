import React, { useState, useEffect } from 'react';
import { getRecentListings } from '../services/api';
import { Listing } from '../types';
import ListingCard from './ListingCard';

const RecentlyAdded: React.FC = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentListings = async () => {
            try {
                const data = await getRecentListings();
                setListings(data);
            } catch (error) {
                console.error("Failed to fetch recent listings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentListings();
    }, []);

    if (loading) {
        return (
            <section className="mb-12">
                <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-6"></div>
                <div className="flex space-x-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="min-w-[280px] h-72 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </section>
        );
    }
    
    if (listings.length === 0) {
        return null; // Don't render the section if there are no recent listings
    }

    return (
        <section id="recently-added" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Recently Added Properties</h2>
            <div className="flex overflow-x-auto space-x-6 pb-4 -mb-4">
                {listings.map(listing => (
                    <div key={listing.id} className="min-w-[280px] sm:min-w-[300px] flex-shrink-0">
                        <ListingCard listing={listing} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RecentlyAdded;