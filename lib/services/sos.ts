import { databases, ID, Query } from '@/lib/appwrite/config';
import { appwriteConfig } from '@/lib/appwrite/env';
import { calculateDistance } from './location';

// Blood group compatibility matrix
const BLOOD_COMPATIBILITY: { [key: string]: string[] } = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
};

export type UrgencyLevel = 'critical' | 'urgent' | 'normal';
export type SOSStatus = 'active' | 'fulfilled' | 'cancelled';

export interface SOSRequest {
    $id: string;
    patientId: string;
    bloodGroup: string;
    unitsNeeded: number;
    urgency: UrgencyLevel;
    hospitalName: string;
    hospitalAddress: string;
    latitude: number;
    longitude: number;
    contactPerson: string;
    contactPhone: string;
    medicalNotes?: string;
    status: SOSStatus;
    responseCount: number;
    expiresAt: string;
    fulfilledAt?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Create a new SOS request
 * Includes spam prevention (max 3 active requests per patient)
 */
export async function createSOSRequest(data: {
    patientId: string;
    bloodGroup: string;
    unitsNeeded: number;
    urgency: UrgencyLevel;
    hospitalName: string;
    hospitalAddress: string;
    latitude: number;
    longitude: number;
    contactPerson: string;
    contactPhone: string;
    medicalNotes?: string;
}): Promise<SOSRequest> {
    try {
        // Check for spam (max 3 active requests)
        const activeRequests = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosRequests,
            [
                Query.equal('patientId', data.patientId),
                Query.equal('status', 'active')
            ]
        );

        if (activeRequests.documents.length >= 3) {
            throw new Error('Maximum 3 active SOS requests allowed. Please cancel or fulfill existing requests.');
        }

        // Set expiry to 24 hours from now
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosRequests,
            ID.unique(),
            {
                requesterId: data.patientId, // Required by schema
                patientId: data.patientId,
                bloodGroup: data.bloodGroup,
                unitsNeeded: data.unitsNeeded,
                urgency: data.urgency.toLowerCase(), // Convert to lowercase (critical, urgent, normal)
                hospitalName: data.hospitalName,
                hospitalAddress: data.hospitalAddress,
                latitude: data.latitude,
                longitude: data.longitude,
                contactPerson: data.contactPerson,
                contactPhone: data.contactPhone,
                medicalNotes: data.medicalNotes || '',
                location: `${data.hospitalName}, ${data.hospitalAddress}`, // Required by schema
                description: data.medicalNotes || '', // Required by schema
                radiusKm: 25, // Default radius
                respondedDonors: [], // Empty array initially
                status: 'active', // Lowercase: active, fulfilled, cancelled
                responseCount: 0,
                expiresAt: expiresAt.toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );

        return response as unknown as SOSRequest;
    } catch (error: any) {
        console.error('Create SOS request error:', error);
        throw new Error(error.message || 'Failed to create SOS request');
    }
}

/**
 * Get a single SOS request by ID
 */
export async function getSOSRequest(sosId: string): Promise<SOSRequest | null> {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosRequests,
            sosId
        );

        return response as unknown as SOSRequest;
    } catch (error) {
        console.error('Get SOS request error:', error);
        return null;
    }
}

/**
 * Get all SOS requests for a patient
 */
export async function getPatientRequests(patientId: string): Promise<SOSRequest[]> {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosRequests,
            [
                Query.equal('patientId', patientId),
                Query.orderDesc('createdAt')
            ]
        );

        return response.documents as unknown as SOSRequest[];
    } catch (error) {
        console.error('Get patient requests error:', error);
        return [];
    }
}

/**
 * Get nearby SOS requests for a donor
 * Filters by blood compatibility and proximity
 */
export async function getNearbySOSRequests(
    donorLatitude: number,
    donorLongitude: number,
    donorBloodGroup: string,
    radiusKm: number = 25
): Promise<Array<SOSRequest & { distance: number }>> {
    try {
        // Get compatible blood groups for this donor
        const compatibleFor = Object.keys(BLOOD_COMPATIBILITY).filter(
            recipient => BLOOD_COMPATIBILITY[recipient].includes(donorBloodGroup)
        );

        if (compatibleFor.length === 0) {
            return [];
        }

        // Get active SOS requests
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosRequests,
            [
                Query.equal('status', 'active'),
                Query.orderDesc('createdAt'),
                Query.limit(100) // Limit to prevent large queries
            ]
        );

        // Filter by blood compatibility and calculate distances
        const nearbyRequests = response.documents
            .filter((req: any) => compatibleFor.includes(req.bloodGroup))
            .map((req: any) => {
                const distance = calculateDistance(
                    donorLatitude,
                    donorLongitude,
                    req.latitude,
                    req.longitude
                );

                return {
                    ...req,
                    distance
                } as SOSRequest & { distance: number };
            })
            .filter(req => req.distance <= radiusKm)
            .sort((a, b) => {
                // Sort by urgency first, then distance
                const urgencyOrder: Record<string, number> = {
                    critical: 0,
                    urgent: 1,
                    normal: 2
                };
                const aUrgency = urgencyOrder[a.urgency.toLowerCase()] ?? 2;
                const bUrgency = urgencyOrder[b.urgency.toLowerCase()] ?? 2;
                const urgencyDiff = aUrgency - bUrgency;
                if (urgencyDiff !== 0) return urgencyDiff;
                return a.distance - b.distance;
            });

        return nearbyRequests;
    } catch (error) {
        console.error('Get nearby SOS requests error:', error);
        return [];
    }
}

/**
 * Update SOS request status
 */
export async function updateSOSStatus(
    sosId: string,
    status: SOSStatus,
    fulfilledAt?: string
): Promise<void> {
    try {
        const updateData: any = {
            status,
            updatedAt: new Date().toISOString()
        };

        if (fulfilledAt) {
            updateData.fulfilledAt = fulfilledAt;
        }

        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosRequests,
            sosId,
            updateData
        );
    } catch (error) {
        console.error('Update SOS status error:', error);
        throw new Error('Failed to update SOS status');
    }
}

/**
 * Increment response count for an SOS request
 */
export async function incrementResponseCount(sosId: string): Promise<void> {
    try {
        const sos = await getSOSRequest(sosId);
        if (!sos) return;

        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosRequests,
            sosId,
            {
                responseCount: sos.responseCount + 1,
                updatedAt: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error('Increment response count error:', error);
    }
}

/**
 * Check if donor can donate to recipient (blood compatibility)
 */
export function isBloodCompatible(donorBloodGroup: string, recipientBloodGroup: string): boolean {
    const compatibleDonors = BLOOD_COMPATIBILITY[recipientBloodGroup];
    return compatibleDonors ? compatibleDonors.includes(donorBloodGroup) : false;
}

/**
 * Get all active SOS requests (for admin/monitoring)
 */
export async function getAllActiveSOSRequests(): Promise<SOSRequest[]> {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosRequests,
            [
                Query.equal('status', 'active'),
                Query.orderDesc('createdAt')
            ]
        );

        return response.documents as unknown as SOSRequest[];
    } catch (error) {
        console.error('Get all active SOS requests error:', error);
        return [];
    }
}

/**
 * Auto-expire old SOS requests (called periodically)
 * Returns number of expired requests
 */
export async function expireOldRequests(): Promise<number> {
    try {
        const now = new Date().toISOString();

        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosRequests,
            [
                Query.equal('status', 'active'),
                Query.lessThan('expiresAt', now)
            ]
        );

        let expiredCount = 0;
        for (const doc of response.documents) {
            await updateSOSStatus(doc.$id, 'cancelled'); // Auto-expire as cancelled
            expiredCount++;
        }

        return expiredCount;
    } catch (error) {
        console.error('Expire old requests error:', error);
        return 0;
    }
}

/**
 * Delete an SOS request (only if no responses)
 */
export async function deleteSOSRequest(sosId: string): Promise<void> {
    try {
        const sos = await getSOSRequest(sosId);
        if (!sos) {
            throw new Error('SOS request not found');
        }

        if (sos.responseCount > 0) {
            throw new Error('Cannot delete SOS request with responses. Please cancel instead.');
        }

        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosRequests,
            sosId
        );
    } catch (error: any) {
        console.error('Delete SOS request error:', error);
        throw new Error(error.message || 'Failed to delete SOS request');
    }
}
