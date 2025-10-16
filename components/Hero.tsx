
import React from 'react';

const Hero: React.FC = () => {
    return (
        <section className="text-center py-16 md:py-24 bg-white rounded-lg shadow-lg mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Find Your KasiStay</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">The best platform for student and township accommodation. Safe, affordable, and close to you.</p>
            <div className="max-w-xl mx-auto px-4">
                <div className="relative">
                    <input 
                        id="search-input"
                        type="text"
                        placeholder="Search by location, campus, or price..."
                        className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                    <button className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
                        Search
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
