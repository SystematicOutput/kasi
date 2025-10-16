import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { startConversation, createBooking } from '../services/api';

const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [isMessaging, setIsMessaging] = React.useState(false);
    const [isBooking, setIsBooking] = React.useState(false);

    const handleMessageLandlord = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userProfile) return;

        setIsMessaging(true);
        try {
            const conversation = await startConversation(listing.landlordId, listing.id);
            navigate(`/messages/${conversation.id}`);
        } catch (error) {
            console.error("Failed to start conversation", error);
            // Optionally show an error to the user
        } finally {
            setIsMessaging(false);
        }
    };
    
    const handleBookNow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userProfile) return;
        
        setIsBooking(true);
        try {
            await createBooking(listing.id);
            alert('Booking request sent successfully! You can track its status on your dashboard.');
        } catch (error: any) {
            console.error("Failed to create booking", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
            <div className="relative">
                <img src={listing.imageUrl} alt={listing.title} className="w-full h-56 object-cover"/>
                 {userProfile && userProfile.uid !== listing.landlordId && (
                    <button 
                        onClick={handleMessageLandlord}
                        disabled={isMessaging}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 transition-colors disabled:opacity-50"
                        title="Message Landlord"
                    >
                        {isMessaging ? <div className="loader !w-5 !h-5 !border-2"></div> : <i data-lucide="message-circle" className="w-5 h-5"></i>}
                    </button>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-xl text-slate-800">{listing.title}</h3>
                <p className="text-slate-500">{listing.location}</p>
                <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                       <p className="text-lg font-semibold text-blue-600">R{listing.price}/month</p>
                       {listing.isVerified && (
                           <span className="flex items-center text-green-600 text-sm font-semibold">
                               <i data-lucide="shield-check" className="h-4 w-4 mr-1"></i>
                               Verified
                           </span>
                       )}
                    </div>
                    {userProfile?.role === UserRole.Student && (
                        <button
                            onClick={handleBookNow}
                            disabled={isBooking}
                            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                        >
                            {isBooking ? <div className="loader !w-5 !h-5 !border-2"></div> : 'Request to Book'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingCard;
