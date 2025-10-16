import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { userProfile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader"></div>
            </div>
        );
    }

    if (!userProfile) {
        // Redirect them to the / page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they log in.
        return <Navigate to="/" state={{ from: location }} replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
        // Redirect to dashboard or a specific 'unauthorized' page if role doesn't match
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }


    return <>{children}</>;
};

export default ProtectedRoute;