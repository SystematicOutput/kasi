import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, MaintenanceRequest, MaintenanceRequestStatus } from '../types';
import { getMaintenanceRequestsForUser, updateMaintenanceRequest } from '../services/firebase';

interface DashboardProps {
    userProfile: UserProfile;
}

const DashboardCard: React.FC<{ title: string; children: React.ReactNode, icon?: string }> = ({ title, children, icon }) => (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
        <div className="flex items-center mb-4">
            {icon && <i data-lucide={icon} className="w-6 h-6 mr-3 text-blue-500"></i>}
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const getStatusColor = (status: MaintenanceRequestStatus) => {
    switch (status) {
        case MaintenanceRequestStatus.Open: return 'bg-red-100 text-red-800';
        case MaintenanceRequestStatus.InProgress: return 'bg-yellow-100 text-yellow-800';
        case MaintenanceRequestStatus.Resolved: return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// FIX: Destructure userProfile from props
const MaintenanceSection: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        const userRequests = await getMaintenanceRequestsForUser(userProfile.uid, userProfile.role);
        setRequests(userRequests);
        setLoading(false);
    }

    useEffect(() => {
        fetchRequests();
    }, [userProfile]);
    
    const handleStatusChange = async (requestId: string, newStatus: MaintenanceRequestStatus) => {
        try {
            await updateMaintenanceRequest(requestId, newStatus);
            fetchRequests(); // Re-fetch to update the list
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    }

    return (
        <DashboardCard title="Maintenance Requests" icon="wrench">
            {userProfile.role === UserRole.Student && (
                 <button className="mb-4 bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-lg flex items-center hover:bg-blue-200 transition-colors text-sm">
                    <i data-lucide="plus" className="w-4 h-4 mr-2"></i>
                    Report an Issue
                </button>
            )}
            {loading ? <p>Loading requests...</p> : requests.length === 0 ? <p className="text-gray-600">No maintenance requests found.</p> : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="p-3 bg-gray-50 rounded-lg border">
                            <p className="font-semibold text-gray-800">{req.issue}</p>
                            <div className="flex justify-between items-center mt-2">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(req.status)}`}>
                                    {req.status}
                                </span>
                                {userProfile.role === UserRole.Landlord ? (
                                    <div className="flex space-x-1">
                                        <button onClick={() => handleStatusChange(req.id, MaintenanceRequestStatus.InProgress)} title="In Progress" className="p-1 hover:bg-yellow-200 rounded-full disabled:opacity-50" disabled={req.status === MaintenanceRequestStatus.InProgress}><i data-lucide="loader" className="w-4 h-4 text-yellow-600"></i></button>
                                        <button onClick={() => handleStatusChange(req.id, MaintenanceRequestStatus.Resolved)} title="Mark as Resolved" className="p-1 hover:bg-green-200 rounded-full disabled:opacity-50" disabled={req.status === MaintenanceRequestStatus.Resolved}><i data-lucide="check-circle" className="w-4 h-4 text-green-600"></i></button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardCard>
    )
}

const StudentDashboard: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="My Bookings" icon="calendar-check">
            <p className="text-gray-600">You have no active bookings. Start searching for a room!</p>
        </DashboardCard>
        <MaintenanceSection userProfile={userProfile} />
    </div>
);

const LandlordDashboard: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="My Properties" icon="home">
            <p className="text-gray-600">You have 2 active listings.</p>
             <button className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-blue-700 transition-colors text-sm">
                <i data-lucide="plus" className="w-4 h-4 mr-2"></i>
                Add New Property
            </button>
        </DashboardCard>
        <DashboardCard title="Messages" icon="message-square">
            <p className="text-gray-600">You have no unread messages.</p>
        </DashboardCard>
        <div className="md:col-span-2 lg:col-span-1">
           <MaintenanceSection userProfile={userProfile} />
        </div>
    </div>
);

const ProviderDashboard: React.FC = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="My Profile" icon="user-cog">
            <p className="text-gray-600">Manage your service details and contact information.</p>
            <button className="mt-4 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center hover:bg-gray-300 transition-colors">
                <i data-lucide="edit" className="w-4 h-4 mr-2"></i>
                Edit Profile
            </button>
        </DashboardCard>
         <DashboardCard title="Service Requests" icon="bell">
            <p className="text-gray-600">You have no new service requests.</p>
        </DashboardCard>
    </div>
);

const AdminDashboard: React.FC = () => (
     <DashboardCard title="System Oversight" icon="shield">
        <p className="text-gray-600">Admin panel placeholder. Manage users, listings, and system settings here.</p>
    </DashboardCard>
);


const Dashboard: React.FC<DashboardProps> = ({ userProfile }) => {
    
    const renderDashboardContent = () => {
        switch (userProfile.role) {
            case UserRole.Student:
                return <StudentDashboard userProfile={userProfile} />;
            case UserRole.Landlord:
                return <LandlordDashboard userProfile={userProfile} />;
            case UserRole.ServiceProvider:
                return <ProviderDashboard />;
            case UserRole.Admin:
                return <AdminDashboard />;
            default:
                return <p>Invalid user role.</p>;
        }
    };
    
    const verificationStatus = () => {
        if (userProfile.role !== UserRole.Landlord) return null;
        return userProfile.isVerified ? (
            <span className="ml-3 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full flex items-center">
                <i data-lucide="check-circle" className="w-4 h-4 mr-1"></i> Verified
            </span>
        ) : (
            <span className="ml-3 text-xs font-medium text-yellow-800 bg-yellow-100 px-2.5 py-1 rounded-full">
                Not Verified
            </span>
        );
    }

    return (
        <section id="dashboard">
             <div className="flex items-center mb-2">
                <h2 className="text-3xl font-bold">Welcome, {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}!</h2>
                {verificationStatus()}
            </div>
            <p className="text-gray-600 mb-8">This is your personal dashboard. Manage your activities here.</p>
            {renderDashboardContent()}
        </section>
    );
};

export default Dashboard;