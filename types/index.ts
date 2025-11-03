// User Roles
export type UserRole = 'patient' | 'donor' | 'blood_bank' | 'admin';

// Blood Groups
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// User Base Interface
export interface User {
    $id: string;
    email: string;
    phone: string;
    name: string;
    role: UserRole;
    isVerified: boolean;
    location?: {
        lat: number;
        lng: number;
        address: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Donor Interface
export interface Donor {
    $id: string;
    userId: string;
    bloodGroup: BloodGroup;
    lastDonationDate?: string;
    isEligible: boolean;
    donationCount: number;
    isAvailable: boolean;
    notificationsEnabled: boolean;
    documents?: string[]; // File IDs
    createdAt: string;
    updatedAt: string;
}

// Blood Bank Interface
export interface BloodBank {
    $id: string;
    userId: string;
    name: string;
    licenseNumber: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    contactEmail: string;
    contactPhone: string;
    operatingHours: {
        open: string;
        close: string;
        days: string[];
    };
    isVerified: boolean;
    documents?: string[]; // File IDs
    createdAt: string;
    updatedAt: string;
}

// Inventory Interface
export interface Inventory {
    $id: string;
    bloodBankId: string;
    bloodGroup: BloodGroup;
    unitsAvailable: number;
    lastUpdated: string;
}

// SOS Request Interface
export interface SOSRequest {
    $id: string;
    requesterId: string;
    bloodGroup: BloodGroup;
    urgency: 'critical' | 'urgent' | 'normal';
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    radiusKm: number;
    status: 'active' | 'fulfilled' | 'cancelled';
    description?: string;
    contactPhone: string;
    respondedDonors?: string[]; // Donor IDs
    createdAt: string;
    expiresAt: string;
}

// Appointment Interface
export interface Appointment {
    $id: string;
    donorId: string;
    bloodBankId: string;
    scheduledDate: string;
    timeSlot: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Auth Types
export interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone: string;
    role: UserRole;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface Session {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
}
