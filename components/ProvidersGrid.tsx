import React, { useState, useEffect } from 'react';
import { getServiceProviders } from '../services/firebase';
import { ServiceProvider } from '../types';

const ProviderCard: React.FC<{ provider: ServiceProvider }> = ({ provider }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex items-center space-x-4 transform hover:scale-105 transition-transform duration-300">
        <img src={provider.imageUrl} alt={provider.name} className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"/>
        <div>
            <h3 className="font-bold text-lg">{provider.name}</h3>
            <p className="text-blue-600 font-medium">{provider.service}</p>
            <p className="text-gray-500 text-sm">{provider.contact}</p>
        </div>
    </div>
);

const ProvidersGrid: React.FC = () => {
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const data = await getServiceProviders();
                setProviders(data);
            } catch (error) {
                console.error("Failed to fetch service providers:", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchProviders();
    }, []);

    return (
        <section id="local-services">
            <h2 className="text-3xl font-bold mb-6">Local Service Providers</h2>
             {loading ? (
                <div className="flex justify-center items-center h-40"><div className="loader"></div></div>
            ) : (
                <div id="providers-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {providers.map(provider => (
                        <ProviderCard key={provider.id} provider={provider} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProvidersGrid;
