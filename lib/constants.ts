import { BloodGroup, UserRole } from '@/types';

export const BLOOD_GROUPS: BloodGroup[] = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
    {
        value: 'patient',
        label: 'Patient / Requester',
        description: 'Find blood donors and search blood bank inventory'
    },
    {
        value: 'donor',
        label: 'Blood Donor',
        description: 'Respond to SOS requests and schedule donations'
    },
    {
        value: 'blood_bank',
        label: 'Blood Bank / Hospital',
        description: 'Manage inventory and accept donation appointments'
    }
];

export const URGENCY_LEVELS = [
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-orange-600' },
    { value: 'normal', label: 'Normal', color: 'text-blue-600' }
];

export const APPOINTMENT_STATUS = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled'
};

export const SOS_STATUS = {
    active: 'Active',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled'
};

// Donor eligibility: 56 days (8 weeks) between donations
export const DONATION_INTERVAL_DAYS = 56;

// Default SOS search radius options (in km)
export const SOS_RADIUS_OPTIONS = [5, 10, 25, 50, 100];

// Default SOS expiration time (in hours)
export const DEFAULT_SOS_EXPIRATION_HOURS = 24;
