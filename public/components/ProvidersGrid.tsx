import React, { useState, useEffect } from 'react';
import { getServiceProviders } from '../services/api';
import { ServiceProvider } from '../types';

const ProviderCard: React.FC<{ provider: ServiceProvider }> = ({ provider }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex items-center space-x-4 transform hover:scale-105 transition-transform duration-300">
        <img src={provider.imageUrl || `https://ui-avatars.com/api/?name=${provider.name.replace(' ', '+')}&background=random`} alt={provider.name} className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"/>
        <div>
            <h3 className="font-bold text-lg">{provider.name}</h3>
            <p className="text-blue-600 font-medium">{provider.service}</p>
            <p className="text-gray-500 text-sm">{provider.contact}</p>
        </div>
    </div>
);

interface ProvidersGridProps {
    searchTerm: string;
}

const ProvidersGrid: React.FC<ProvidersGridProps> = ({ searchTerm }) => {
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchProviders = async () => {
            setLoading(true);
            try {
                const data = await getServiceProviders(searchTerm);
                setProviders(data);
            } catch (error) {
                console.error("Failed to fetch service providers:", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchProviders();
    }, [searchTerm]);

    return (
        <section id="local-services">
            <h2 className="text-3xl font-bold mb-6 text-slate-800">
                {searchTerm ? `Providers matching "${searchTerm}"` : 'Local Service Providers'}
            </h2>
             {loading ? (
                <div className="flex justify-center items-center h-40"><div className="loader"></div></div>
            ) : providers.length > 0 ? (
                <div id="providers-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {providers.map(provider => (
                        <ProviderCard key={provider.id} provider={provider} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-100 rounded-lg">
                    <i data-lucide="users" className="w-16 h-16 mx-auto text-gray-400 mb-4"></i>
                    <h3 className="text-xl font-semibold">No Service Providers Found</h3>
                    <p className="text-gray-500 mt-2">
                        {searchTerm 
                            ? "Try a different search, like 'cleaning' or 'transport'." 
                            : "We are expanding our network of local providers."}
                    </p>
                </div>
            )}
        </section>
    );
};

export default ProvidersGrid;