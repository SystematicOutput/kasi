// --- API Service ---
// This file contains functions to communicate with the backend Express server.

import { UserProfile, UserRole, Listing, ServiceProvider, MaintenanceRequest, MaintenanceRequestStatus, Conversation, Message, Booking } from '../types';

// Helper function to handle fetch responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An unknown error occurred.');
    }
    // Handle cases with no JSON response body (e.g., sign out)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return {};
};


// --- Auth API ---
export const signUp = (email: string, password: string, role: UserRole): Promise<UserProfile> => {
    return fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
    }).then(handleResponse);
};

export const signIn = (email: string, password: string): Promise<UserProfile> => {
    return fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    }).then(handleResponse);
};

export const signOut = (): Promise<void> => {
    return fetch('/api/auth/signout', { method: 'POST' }).then(handleResponse);
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
    try {
        const response = await fetch('/api/auth/me');
        if (response.status === 401) return null;
        return handleResponse(response);
    } catch (error) {
        console.error("Could not fetch current user:", error);
        return null;
    }
};

// --- Data Fetching API ---
export const getListings = (searchTerm?: string): Promise<Listing[]> => {
    const url = searchTerm ? `/api/listings?q=${encodeURIComponent(searchTerm)}` : '/api/listings';
    return fetch(url).then(handleResponse);
};

export interface NewListingPayload {
    title: string;
    price: number;
    location: string;
    description: string;
    imageUrl?: string;
    gpsLat: number;
    gpsLng: number;
}

export const createListing = (listingData: NewListingPayload): Promise<Listing> => {
    return fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
    }).then(handleResponse);
};


export const getRecentListings = (): Promise<Listing[]> => {
    return fetch('/api/listings/recent').then(handleResponse);
};

export const getServiceProviders = (searchTerm?: string): Promise<ServiceProvider[]> => {
    const url = searchTerm ? `/api/providers?q=${encodeURIComponent(searchTerm)}` : '/api/providers';
    return fetch(url).then(handleResponse);
};

// --- Maintenance Requests API ---
export const getMaintenanceRequestsForUser = (): Promise<MaintenanceRequest[]> => {
    return fetch('/api/maintenance-requests').then(handleResponse);
};

export const createMaintenanceRequest = (listingId: string, issue: string): Promise<{ id: number, message: string }> => {
     return fetch('/api/maintenance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, issue }),
    }).then(handleResponse);
}

export const updateMaintenanceRequest = (requestId: string, status: MaintenanceRequestStatus): Promise<void> => {
    return fetch(`/api/maintenance-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    }).then(handleResponse);
};

// --- Messaging API ---
export const startConversation = (recipientId: string, listingId?: string): Promise<{ id: string }> => {
    return fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, listingId }),
    }).then(handleResponse);
};

export const getConversations = (): Promise<Conversation[]> => {
    return fetch('/api/conversations').then(handleResponse);
};

export const getMessagesForConversation = (conversationId: string): Promise<Message[]> => {
    return fetch(`/api/conversations/${conversationId}/messages`).then(handleResponse);
};

export const sendMessageInConversation = (conversationId: string, content: string): Promise<Message> => {
    return fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    }).then(handleResponse);
};

// --- Bookings API ---
export const getBookings = (): Promise<Booking[]> => {
    return fetch('/api/bookings').then(handleResponse);
};

export const createBooking = (listingId: string): Promise<{ id: number, message: string }> => {
    return fetch(`/api/listings/${listingId}/book`, {
        method: 'POST',
    }).then(handleResponse);
};

export const updateBookingStatus = (bookingId: string, status: 'confirmed' | 'declined'): Promise<{ message: string }> => {
    return fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    }).then(handleResponse);
};

// --- Admin API ---
export const getAdminAllUsers = (): Promise<UserProfile[]> => {
    return fetch('/api/admin/users').then(handleResponse);
};

export const updateUserVerification = (userId: string, isVerified: boolean): Promise<{ message: string }> => {
    return fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified }),
    }).then(handleResponse);
};

export const getAdminAllListings = (): Promise<Listing[]> => {
    return fetch('/api/admin/listings').then(handleResponse);
};

export const updateListingStatus = (listingId: string, isActive: boolean): Promise<{ message: string }> => {
    return fetch(`/api/admin/listings/${listingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
    }).then(handleResponse);
};
