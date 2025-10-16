import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, UserRole, MaintenanceRequest, MaintenanceRequestStatus, Listing, Booking, BookingStatus } from '../types';
import { 
    getMaintenanceRequestsForUser, 
    updateMaintenanceRequest,
    getAdminAllUsers,
    updateUserVerification,
    getAdminAllListings,
    updateListingStatus,
    createMaintenanceRequest,
    getBookings,
    updateBookingStatus
} from '../services/api';

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

const MaintenanceModal: React.FC<{ onClose: () => void; fetchRequests: () => void; }> = ({ onClose, fetchRequests }) => {
    const [issue, setIssue] = useState('');
    const [listingId, setListingId] = useState('1'); // Mocked: In a real app, this would come from user's bookings
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!issue.trim()) {
            setError('Please describe the issue.');
            return;
        }
        setSubmitting(true);
        try {
            await createMaintenanceRequest(listingId, issue);
            fetchRequests();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit request.');
        } finally {
            setSubmitting(false);
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Report an Issue</h3>
                {error && <p className="bg-red-100 text-red-700 p-2 rounded-md mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="issue" className="block text-gray-700 font-medium mb-2">Describe the issue</label>
                        <textarea 
                            id="issue" 
                            rows={4} 
                            value={issue}
                            onChange={e => setIssue(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            placeholder="e.g., The kitchen sink is leaking."
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MaintenanceSection: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
    const [requests, setRequests] = React.useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRequests = React.useCallback(async () => {
        setLoading(true);
        try {
            const userRequests = await getMaintenanceRequestsForUser();
            setRequests(userRequests);
        } catch (error) {
            console.error("Failed to fetch maintenance requests:", error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (userProfile.role === UserRole.Student || userProfile.role === UserRole.Landlord) {
            fetchRequests();
        }
    }, [userProfile, fetchRequests]);
    
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
             {isModalOpen && <MaintenanceModal onClose={() => setIsModalOpen(false)} fetchRequests={fetchRequests} />}
            {userProfile.role === UserRole.Student && (
                 <button onClick={() => setIsModalOpen(true)} className="mb-4 bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-lg flex items-center hover:bg-blue-200 transition-colors text-sm">
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

// --- Booking Components ---

const getBookingStatusColor = (status: BookingStatus) => {
    switch (status) {
        case BookingStatus.Pending: return 'bg-yellow-100 text-yellow-800';
        case BookingStatus.Confirmed: return 'bg-green-100 text-green-800';
        case BookingStatus.Declined: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const StudentBookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await getBookings();
                setBookings(data);
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchBookings();
    }, []);

    if (loading) return <p>Loading bookings...</p>;
    if (bookings.length === 0) return <p className="text-gray-600">You have no booking requests. Find a room to get started!</p>;

    return (
        <div className="space-y-4">
            {bookings.map(booking => (
                <div key={booking.id} className="p-3 bg-gray-50 rounded-lg border">
                    <p className="font-semibold text-gray-800">{booking.listingTitle}</p>
                    <div className="flex justify-between items-center mt-2">
                         <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${getBookingStatusColor(booking.status)}`}>
                            {booking.status}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const LandlordBookingRequests: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getBookings();
            setBookings(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);
    
    const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'declined') => {
        try {
            await updateBookingStatus(bookingId, status);
            fetchBookings(); // Refresh list
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        }
    };

    const pendingBookings = bookings.filter(b => b.status === BookingStatus.Pending);

    if (loading) return <p>Loading requests...</p>;
    if (pendingBookings.length === 0) return <p className="text-gray-600">No new booking requests.</p>;

    return (
         <div className="space-y-4">
            {pendingBookings.map(booking => (
                <div key={booking.id} className="p-3 bg-gray-50 rounded-lg border">
                    <p className="font-semibold text-gray-800">Request for: {booking.listingTitle}</p>
                    <p className="text-sm text-gray-600">From: {booking.studentEmail}</p>
                    <div className="flex justify-end items-center mt-2 space-x-2">
                        <button 
                            onClick={() => handleStatusUpdate(booking.id, 'declined')}
                            className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                        >
                            Decline
                        </button>
                        <button 
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};


// --- Role Dashboards ---

const StudentDashboard: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="My Bookings" icon="calendar-check">
            <StudentBookings />
        </DashboardCard>
        <MaintenanceSection userProfile={userProfile} />
    </div>
);

const LandlordDashboard: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
    const navigate = useNavigate();
    return (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="My Properties" icon="home">
            <p className="text-gray-600">Manage your property listings here.</p>
             <button onClick={() => navigate('/dashboard/add-listing')} className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-blue-700 transition-colors text-sm">
                <i data-lucide="plus" className="w-4 h-4 mr-2"></i>
                Add New Property
            </button>
        </DashboardCard>
        <DashboardCard title="Booking Requests" icon="user-check">
            <LandlordBookingRequests />
        </DashboardCard>
        <DashboardCard title="Messages" icon="message-square">
            <p className="text-gray-600">Check your inbox to see all conversations.</p>
             <button onClick={() => navigate('/messages')} className="mt-4 bg-blue-100 text-blue-800 font-bold py-2 px-4 rounded-lg flex items-center hover:bg-blue-200 transition-colors text-sm">
                <i data-lucide="inbox" className="w-4 h-4 mr-2"></i>
                Go to Inbox
            </button>
        </DashboardCard>
        <MaintenanceSection userProfile={userProfile} />
    </div>
    )
};

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

// --- Admin Dashboard Components ---

const UserManagementTable: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminAllUsers();
            setUsers(data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleVerificationToggle = async (user: UserProfile) => {
        try {
            await updateUserVerification(user.uid, !user.isVerified);
            setUsers(users.map(u => u.uid === user.uid ? { ...u, isVerified: !u.isVerified } : u));
        } catch (error) {
            console.error("Failed to update verification", error);
        }
    };

    if (loading) return <div className="loader"></div>;

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                        <tr key={user.uid}>
                            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {user.isVerified ? 
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Verified</span> :
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Not Verified</span>
                                }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {user.role === 'landlord' && (
                                    <button onClick={() => handleVerificationToggle(user)} className={`text-sm font-medium ${user.isVerified ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}>
                                        {user.isVerified ? 'Unverify' : 'Verify'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ListingManagementTable: React.FC = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminAllListings();
            setListings(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchListings(); }, [fetchListings]);

    const handleStatusToggle = async (listing: Listing) => {
        try {
            await updateListingStatus(listing.id, !listing.isActive);
            setListings(listings.map(l => l.id === listing.id ? { ...l, isActive: !l.isActive } : l));
        } catch (error) {
            console.error("Failed to update listing status", error);
        }
    };
    
    if (loading) return <div className="loader"></div>;

    return (
         <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {listings.map(listing => (
                        <tr key={listing.id}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{listing.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{listing.location}</td>
                            <td className="px-6 py-4 whitespace-nowrap">R{listing.price}/month</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {listing.isActive ? 
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span> :
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>
                                }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button onClick={() => handleStatusToggle(listing)} className={`text-sm font-medium ${listing.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}>
                                    {listing.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const [view, setView] = useState<'users' | 'listings'>('users');
    
    return (
        <div>
            <div className="flex border-b mb-6">
                <button onClick={() => setView('users')} className={`px-4 py-2 font-semibold ${view === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>User Management</button>
                <button onClick={() => setView('listings')} className={`px-4 py-2 font-semibold ${view === 'listings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Listing Management</button>
            </div>
            {view === 'users' ? <UserManagementTable /> : <ListingManagementTable />}
        </div>
    );
};


const DashboardPage: React.FC = () => {
    const { userProfile } = useAuth();
    
    if (!userProfile) {
        return <div className="flex justify-center items-center h-64"><div className="loader"></div></div>;
    }
    
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
        <section id="dashboard" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
             <div className="flex items-center mb-2">
                <h2 className="text-4xl font-bold">Dashboard</h2>
                {verificationStatus()}
            </div>
            <p className="text-slate-600 mb-8">Welcome back, {userProfile.email}.</p>
            {renderDashboardContent()}
        </section>
    );
};

export default DashboardPage;
