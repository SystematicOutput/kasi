import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    onSignInClick: () => void;
    onSignUpClick: () => void;
    onDashboardClick: () => void;
    onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignInClick, onSignUpClick, onDashboardClick, onHomeClick }) => {
    const { userProfile, loading, signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
            onHomeClick(); // Navigate to home view after sign out
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <button onClick={onHomeClick} className="text-2xl font-bold text-blue-600">
                    KasiStays
                </button>
                <nav>
                    {loading ? (
                        <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                    ) : userProfile ? (
                        <div className="flex items-center space-x-4">
                            <button onClick={onDashboardClick} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                                Dashboard
                            </button>
                            <button onClick={handleSignOut} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors">
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <button onClick={onSignInClick} className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                                Sign In
                            </button>
                            <button onClick={onSignUpClick} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                Sign Up
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
