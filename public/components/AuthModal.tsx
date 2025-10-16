import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Link } from 'react-router-dom';

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
            await signUp(email, password, role);
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
            await signIn(email, password);
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md modal" onClick={stopPropagation}>
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-xl font-semibold text-slate-800">
                        {view === 'signUp' ? 'Create Your Account' : 'Welcome Back!'}
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <i data-lucide="x" className="h-6 w-6"></i>
                    </button>
                </div>
                
                <form onSubmit={view === 'signUp' ? handleSignUp : handleSignIn} className="p-6 space-y-4">
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
                    
                    <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    
                    {view === 'signUp' && (
                        <select name="role" value={role} onChange={e => setRole(e.target.value as UserRole)} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value={UserRole.Student}>I'm a Student</option>
                            <option value={UserRole.ServiceProvider}>I'm a Service Provider</option>
                        </select>
                    )}

                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex justify-center items-center">
                            {loading ? <div className="loader !w-6 !h-6 !border-2"></div> : (view === 'signUp' ? 'Create Account' : 'Sign In')}
                        </button>
                    </div>
                </form>
                 <div className="text-center text-sm text-gray-600 pb-6 px-6">
                    <p>
                        {view === 'signUp' ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={() => setView(view === 'signUp' ? 'signIn' : 'signUp')} className="text-blue-600 hover:underline font-medium ml-1">
                            {view === 'signUp' ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                    <p className="mt-4">
                        Are you a landlord? 
                        <Link to="/register/landlord" onClick={onClose} className="text-blue-600 hover:underline font-medium ml-1">
                             Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;