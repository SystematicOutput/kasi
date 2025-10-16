import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import { Lucide } from './components/Lucide';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LandlordRegistrationPage from './pages/LandlordRegistrationPage';
import ProtectedRoute from './components/ProtectedRoute';
import MessagesPage from './pages/MessagesPage';
import AddListingPage from './pages/AddListingPage';
import { UserRole } from './types';

const AppContent: React.FC = () => {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<'signIn' | 'signUp'>('signIn');
    
    const openModal = (view: 'signIn' | 'signUp') => {
        setAuthModalView(view);
        setAuthModalOpen(true);
    };

    const closeModal = () => {
        setAuthModalOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header 
                onSignInClick={() => openModal('signIn')} 
                onSignUpClick={() => openModal('signUp')}
            />
            <main className="flex-grow">
                 <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register/landlord" element={<LandlordRegistrationPage />} />
                    <Route 
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/dashboard/add-listing"
                        element={
                            <ProtectedRoute allowedRoles={[UserRole.Landlord]}>
                                <AddListingPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/messages/:conversationId?"
                        element={
                            <ProtectedRoute>
                                <MessagesPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
            <footer className="bg-slate-800 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
                    <p>&copy; {new Date().getFullYear()} KasiStays. All rights reserved.</p>
                </div>
            </footer>
            {isAuthModalOpen && (
                <AuthModal
                    initialView={authModalView}
                    onClose={closeModal}
                />
            )}
            <Lucide />
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;