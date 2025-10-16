import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
    initialView: 'signIn' | 'signUp';
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ initialView, onClose }) => {
    const [view, setView] = useState(initialView);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Student);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, signIn } = useAuth();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signUp(email, role);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Password is not used by the mock API, but we pass email
            await signIn(email);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md transform transition-transform duration-300 scale-95" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{view === 'signUp' ? 'Create an Account' : 'Sign In'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                
                <form onSubmit={view === 'signUp' ? handleSignUp : handleSignIn}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email Address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    {view === 'signUp' && (
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="role">I am a...</label>
                            <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value={UserRole.Student}>Student</option>
                                <option value={UserRole.Landlord}>Landlord</option>
                                <option value={UserRole.ServiceProvider}>Service Provider</option>
                            </select>
                        </div>
                    )}
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-300 flex justify-center items-center">
                        {loading ? <div className="loader !w-6 !h-6 !border-2"></div> : (view === 'signUp' ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    {view === 'signUp' ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={() => setView(view === 'signUp' ? 'signIn' : 'signUp')} className="text-blue-600 hover:underline font-medium ml-1">
                        {view === 'signUp' ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
