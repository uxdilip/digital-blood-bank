import { databases } from '@/lib/appwrite/config';
import { appwriteConfig } from '@/lib/appwrite/env';

// Minimum days between donations (WHO guideline: 56 days / 8 weeks)
export const DONATION_INTERVAL_DAYS = 56;

// Donor eligibility criteria
export const ELIGIBILITY_CRITERIA = {
    minAge: 18,
    maxAge: 65,
    minWeight: 50, // kg
    minHemoglobin: 12.5 // g/dL
};

/**
 * Check if donor is eligible to donate based on last donation date
 * @param lastDonationDate - ISO string or Date object
 * @returns Object with eligibility status and next eligible date
 */
export function checkDonorEligibility(lastDonationDate: string | Date | null): {
    isEligible: boolean;
    nextEligibleDate: Date | null;
    daysRemaining: number;
} {
    if (!lastDonationDate) {
        // Never donated before - eligible
        return {
            isEligible: true,
            nextEligibleDate: null,
            daysRemaining: 0
        };
    }

    const lastDonation = new Date(lastDonationDate);
    const today = new Date();

    // Calculate days since last donation
    const daysSinceLastDonation = Math.floor(
        (today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24)
    );

    const isEligible = daysSinceLastDonation >= DONATION_INTERVAL_DAYS;
    const daysRemaining = isEligible ? 0 : DONATION_INTERVAL_DAYS - daysSinceLastDonation;

    // Calculate next eligible date
    const nextEligibleDate = new Date(lastDonation);
    nextEligibleDate.setDate(nextEligibleDate.getDate() + DONATION_INTERVAL_DAYS);

    return {
        isEligible,
        nextEligibleDate: isEligible ? null : nextEligibleDate,
        daysRemaining
    };
}

/**
 * Check medical eligibility based on age and weight
 */
export function checkMedicalEligibility(age: number, weight: number): {
    isEligible: boolean;
    reasons: string[];
} {
    const reasons: string[] = [];

    if (age < ELIGIBILITY_CRITERIA.minAge) {
        reasons.push(`Minimum age is ${ELIGIBILITY_CRITERIA.minAge} years`);
    }

    if (age > ELIGIBILITY_CRITERIA.maxAge) {
        reasons.push(`Maximum age is ${ELIGIBILITY_CRITERIA.maxAge} years`);
    }

    if (weight < ELIGIBILITY_CRITERIA.minWeight) {
        reasons.push(`Minimum weight is ${ELIGIBILITY_CRITERIA.minWeight} kg`);
    }

    return {
        isEligible: reasons.length === 0,
        reasons
    };
}

/**
 * Update donor availability status
 */
export async function updateDonorAvailability(
    donorId: string,
    isAvailable: boolean
): Promise<any> {
    try {
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.donors,
            donorId,
            {
                isAvailable,
                updatedAt: new Date().toISOString()
            }
        );

        return response;
    } catch (error: any) {
        console.error('Update availability error:', error);
        throw new Error(error.message || 'Failed to update availability');
    }
}

/**
 * Record a new donation
 * Updates donation count and last donation date
 */
export async function recordDonation(donorId: string): Promise<any> {
    try {
        // Get current donor data
        const donor = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.donors,
            donorId
        );

        const currentCount = donor.donationCount || 0;

        // Update donor record
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.donors,
            donorId,
            {
                lastDonationDate: new Date().toISOString(),
                donationCount: currentCount + 1,
                isEligible: false, // Not eligible immediately after donation
                updatedAt: new Date().toISOString()
            }
        );

        return response;
    } catch (error: any) {
        console.error('Record donation error:', error);
        throw new Error(error.message || 'Failed to record donation');
    }
}

/**
 * Get donor's donation history summary
 */
export async function getDonationHistory(donorId: string): Promise<{
    totalDonations: number;
    lastDonationDate: Date | null;
    eligibility: ReturnType<typeof checkDonorEligibility>;
}> {
    try {
        const donor = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.donors,
            donorId
        );

        const eligibility = checkDonorEligibility(donor.lastDonationDate);

        return {
            totalDonations: donor.donationCount || 0,
            lastDonationDate: donor.lastDonationDate ? new Date(donor.lastDonationDate) : null,
            eligibility
        };
    } catch (error: any) {
        console.error('Get donation history error:', error);
        throw new Error(error.message || 'Failed to get donation history');
    }
}

/**
 * Calculate donor stats for display
 */
export function calculateDonorStats(donationCount: number) {
    // Each donation can save up to 3 lives
    const livesSaved = donationCount * 3;

    // Calculate donor level based on donations
    let level = 'New Donor';
    let nextMilestone = 5;

    if (donationCount >= 50) {
        level = 'Hero Donor';
        nextMilestone = 100;
    } else if (donationCount >= 25) {
        level = 'Champion Donor';
        nextMilestone = 50;
    } else if (donationCount >= 10) {
        level = 'Regular Donor';
        nextMilestone = 25;
    } else if (donationCount >= 5) {
        level = 'Active Donor';
        nextMilestone = 10;
    }

    return {
        livesSaved,
        level,
        nextMilestone,
        donationsUntilNext: nextMilestone - donationCount
    };
}

/**
 * Format next eligible date for display
 */
export function formatEligibilityDate(nextEligibleDate: Date | null): string {
    if (!nextEligibleDate) {
        return 'Eligible now';
    }

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    return nextEligibleDate.toLocaleDateString('en-US', options);
}

/**
 * Get compatible blood groups for a given blood group
 * Returns which blood groups can donate to the given blood group
 */
export function getCompatibleDonors(recipientBloodGroup: string): string[] {
    const compatibility: Record<string, string[]> = {
        'O-': ['O-'],
        'O+': ['O-', 'O+'],
        'A-': ['O-', 'A-'],
        'A+': ['O-', 'O+', 'A-', 'A+'],
        'B-': ['O-', 'B-'],
        'B+': ['O-', 'O+', 'B-', 'B+'],
        'AB-': ['O-', 'A-', 'B-', 'AB-'],
        'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
    };

    return compatibility[recipientBloodGroup] || [];
}

/**
 * Get which blood groups can receive from a donor
 */
export function getCompatibleRecipients(donorBloodGroup: string): string[] {
    const compatibility: Record<string, string[]> = {
        'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
        'O+': ['O+', 'A+', 'B+', 'AB+'],
        'A-': ['A-', 'A+', 'AB-', 'AB+'],
        'A+': ['A+', 'AB+'],
        'B-': ['B-', 'B+', 'AB-', 'AB+'],
        'B+': ['B+', 'AB+'],
        'AB-': ['AB-', 'AB+'],
        'AB+': ['AB+']
    };

    return compatibility[donorBloodGroup] || [];
}
