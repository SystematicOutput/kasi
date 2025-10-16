import React, { useState } from 'react';

interface HeroProps {
    onSearch: (term: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <section className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 md:p-16 shadow-lg mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">Find Your Perfect Student Room</h1>
            <p className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">Affordable rooms for students, provided by local township households. Safe, convenient, and close to campus.</p>
            <div className="max-w-xl mx-auto mt-8 px-4">
                <form onSubmit={handleSearch} className="relative">
                    <input 
                        id="search-input"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by location, campus, or price..."
                        className="w-full px-5 py-3 text-lg border-2 text-gray-800 border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    <button type="submit" className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
                        Search
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Hero;