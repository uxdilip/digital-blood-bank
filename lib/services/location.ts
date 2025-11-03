import { databases, Query } from '@/lib/appwrite/config';
import { appwriteConfig } from '@/lib/appwrite/env';

/**
 * Geocode an address using our API route (proxies OpenStreetMap Nominatim)
 * Returns latitude and longitude coordinates
 */
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
        const response = await fetch(
            `/api/geocode?address=${encodeURIComponent(address)}`
        );

        if (!response.ok) {
            throw new Error('Geocoding failed');
        }

        const data = await response.json();

        if (data && data.latitude && data.longitude) {
            return {
                latitude: data.latitude,
                longitude: data.longitude
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Find nearby users within a specified radius
 * @param latitude - Center point latitude
 * @param longitude - Center point longitude
 * @param radiusKm - Search radius in kilometers
 * @param role - Optional: filter by user role (donor, patient, blood_bank)
 * @param bloodGroup - Optional: filter donors by blood group
 */
export async function findNearbyUsers(
    latitude: number,
    longitude: number,
    radiusKm: number = 25,
    role?: string,
    bloodGroup?: string
): Promise<Array<any>> {
    try {
        // Build queries
        const queries: any[] = [Query.isNotNull('latitude'), Query.isNotNull('longitude')];

        if (role) {
            queries.push(Query.equal('role', role));
        }

        // Fetch users from database
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.users,
            queries
        );

        // Calculate distances and filter by radius
        const usersWithDistance = response.documents
            .map((user: any) => {
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    user.latitude,
                    user.longitude
                );

                return {
                    ...user,
                    distance
                };
            })
            .filter((user: any) => user.distance <= radiusKm);

        // If bloodGroup filter is specified and role is donor, fetch donor details
        if (bloodGroup && role === 'donor') {
            const donorIds = usersWithDistance.map(u => u.$id);

            if (donorIds.length > 0) {
                const donorsResponse = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.donors,
                    [
                        Query.equal('userId', donorIds),
                        Query.equal('bloodGroup', bloodGroup),
                        Query.equal('isAvailable', true)
                    ]
                );

                // Filter users to only include those with matching donor records
                const matchingDonorUserIds = donorsResponse.documents.map((d: any) => d.userId);
                return usersWithDistance
                    .filter((user: any) => matchingDonorUserIds.includes(user.$id))
                    .sort((a: any, b: any) => a.distance - b.distance);
            }

            return [];
        }

        // Sort by distance (nearest first)
        return usersWithDistance.sort((a: any, b: any) => a.distance - b.distance);
    } catch (error) {
        console.error('Error finding nearby users:', error);
        return [];
    }
}

/**
 * Find nearby donors with specific blood group
 * @param latitude - Center point latitude
 * @param longitude - Center point longitude
 * @param bloodGroup - Blood group to search for
 * @param radiusKm - Search radius in kilometers
 * @param availableOnly - Only return available donors
 */
export async function findNearbyDonors(
    latitude: number,
    longitude: number,
    bloodGroup: string,
    radiusKm: number = 25,
    availableOnly: boolean = true
): Promise<Array<any>> {
    try {
        // First, get all donors with the specified blood group
        const queries: any[] = [
            Query.equal('bloodGroup', bloodGroup)
        ];

        if (availableOnly) {
            queries.push(Query.equal('isAvailable', true));
        }

        const donorsResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.donors,
            queries
        );

        const donorUserIds = donorsResponse.documents.map((d: any) => d.userId);

        if (donorUserIds.length === 0) {
            return [];
        }

        // Get user details for these donors
        const usersResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.users,
            [
                Query.equal('$id', donorUserIds),
                Query.isNotNull('latitude'),
                Query.isNotNull('longitude')
            ]
        );

        // Calculate distances and filter by radius
        const donorsWithDistance = usersResponse.documents
            .map((user: any) => {
                const donor = donorsResponse.documents.find((d: any) => d.userId === user.$id);
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    user.latitude,
                    user.longitude
                );

                return {
                    ...user,
                    donor,
                    distance
                };
            })
            .filter((user: any) => user.distance <= radiusKm)
            .sort((a: any, b: any) => a.distance - b.distance);

        return donorsWithDistance;
    } catch (error) {
        console.error('Error finding nearby donors:', error);
        return [];
    }
}

/**
 * Find nearby blood banks
 * @param latitude - Center point latitude
 * @param longitude - Center point longitude
 * @param radiusKm - Search radius in kilometers
 * @param verifiedOnly - Only return verified blood banks
 */
export async function findNearbyBloodBanks(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    verifiedOnly: boolean = false
): Promise<Array<any>> {
    try {
        // Get all blood bank users
        const usersResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.users,
            [
                Query.equal('role', 'blood_bank'),
                Query.isNotNull('latitude'),
                Query.isNotNull('longitude')
            ]
        );

        const bloodBankUserIds = usersResponse.documents.map((u: any) => u.$id);

        if (bloodBankUserIds.length === 0) {
            return [];
        }

        // Get blood bank details
        const queries: any[] = [Query.equal('userId', bloodBankUserIds)];

        if (verifiedOnly) {
            queries.push(Query.equal('isVerified', true));
        }

        const bloodBanksResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.bloodBanks,
            queries
        );

        // Calculate distances and filter by radius
        const bloodBanksWithDistance = usersResponse.documents
            .map((user: any) => {
                const bloodBank = bloodBanksResponse.documents.find((bb: any) => bb.userId === user.$id);

                if (!bloodBank) return null;

                const distance = calculateDistance(
                    latitude,
                    longitude,
                    user.latitude,
                    user.longitude
                );

                return {
                    ...user,
                    bloodBank,
                    distance
                };
            })
            .filter((item: any) => item && item.distance <= radiusKm)
            .sort((a: any, b: any) => a.distance - b.distance);

        return bloodBanksWithDistance;
    } catch (error) {
        console.error('Error finding nearby blood banks:', error);
        return [];
    }
}

/**
 * Get reverse geocoding (address from coordinates) using our API route
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<{
    street: string;
    city: string;
    state: string;
    pincode: string;
    displayName: string;
} | null> {
    try {
        const response = await fetch(
            `/api/reverse-geocode?lat=${latitude}&lon=${longitude}`
        );

        if (!response.ok) {
            throw new Error('Reverse geocoding failed');
        }

        const data = await response.json();

        if (data) {
            return {
                street: data.street || '',
                city: data.city || '',
                state: data.state || '',
                pincode: data.pincode || '',
                displayName: data.displayName || ''
            };
        }

        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}
