export enum UserRole {
  Student = 'student',
  Landlord = 'landlord',
  ServiceProvider = 'provider',
  Admin = 'admin',
}

export interface UserProfile {
  uid: string;
  email: string | null;
  role: UserRole;
  isVerified?: boolean;
  profileImageUrl?: string;
  university?: string;
  fieldOfStudy?: string;
  memberSince?: string;
  createdAt?: string;
}

export interface Listing {
  id: string;
  landlordId: string;
  title: string;
  price: number;
  imageUrl: string;
  location: string;
  isVerified: boolean; // Landlord's verification status
  isActive?: boolean;
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
}

export interface ServiceProvider {
  id: string;
  name: string;
  service: string;
  imageUrl: string;
  contact: string;
}

export enum MaintenanceRequestStatus {
  Open = 'Open',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
}

export interface MaintenanceRequest {
  id: string;
  listingId: string;
  studentId?: string; // Optional as it might not be sent from backend
  landlordId?: string; // Optional as it might not be sent from backend
  issue: string;
  status: MaintenanceRequestStatus;
  createdAt: string;
}

export interface Conversation {
  id: string;
  listingId: number | null;
  listingTitle: string | null;
  participantId: string;
  participantEmail: string;
  participantImageUrl: string | null;
  lastMessage: string | null;
  lastMessageTimestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export enum BookingStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Declined = 'declined',
}

export interface Booking {
  id: string;
  listingId: string;
  studentId?: string;
  landlordId?: string;
  status: BookingStatus;
  createdAt: string;
  // Joined data for convenience
  listingTitle?: string;
  studentEmail?: string;
}
