import React, { useState } from 'react';
import Hero from '../components/Hero';
import ListingsGrid from '../components/ListingsGrid';
import ProvidersGrid from '../components/ProvidersGrid';
import RecentlyAdded from '../components/RecentlyAdded';

const HomePage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Hero onSearch={setSearchTerm} />
            <RecentlyAdded />
            <ListingsGrid searchTerm={searchTerm} />
            <ProvidersGrid searchTerm={searchTerm} />
        </div>
    );
};

export default HomePage;