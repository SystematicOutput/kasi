import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
    onSignInClick: () => void;
    onSignUpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSignInClick, onSignUpClick }) => {
    const { userProfile, loading, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/'); // Navigate to home view after sign out
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-slate-800">KasiStays</Link>
                    </div>
                    <div id="auth-container" className="flex items-center space-x-2 md:space-x-4">
                        {loading ? (
                            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : userProfile ? (
                            <>
                                <Link to="/dashboard" className="font-semibold text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100">{userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} Dashboard</Link>
                                <Link to="/messages" className="p-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                                    <i data-lucide="message-circle" className="w-5 h-5"></i>
                                </Link>
                                <button onClick={handleSignOut} className="bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-800">Sign Out</button>
                            </>
                        ) : (
                            <>
                                <button onClick={onSignInClick} className="text-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100">Sign In</button>
                                <button onClick={onSignUpClick} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Sign Up</button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;