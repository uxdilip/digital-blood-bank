import { databases, storage, ID } from '@/lib/appwrite/config';
import { appwriteConfig } from '@/lib/appwrite/env';
import { User } from '@/types';

/**
 * Update user profile information
 */
export async function updateUserProfile(
    userId: string,
    data: Partial<User>
): Promise<any> {
    try {
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.users,
            userId,
            updateData
        );

        return response;
    } catch (error: any) {
        console.error('Update profile error:', error);
        throw new Error(error.message || 'Failed to update profile');
    }
}

/**
 * Upload profile photo to Appwrite storage
 * Returns the file ID
 */
export async function uploadProfilePhoto(file: File): Promise<string> {
    try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('File size too large. Maximum size is 5MB.');
        }

        // Upload to Appwrite storage
        const response = await storage.createFile(
            appwriteConfig.storageBucketId,
            ID.unique(),
            file
        );

        return response.$id;
    } catch (error: any) {
        console.error('Upload photo error:', error);
        throw new Error(error.message || 'Failed to upload photo');
    }
}

/**
 * Delete profile photo from storage
 */
export async function deleteProfilePhoto(fileId: string): Promise<void> {
    try {
        await storage.deleteFile(appwriteConfig.storageBucketId, fileId);
    } catch (error: any) {
        console.error('Delete photo error:', error);
        throw new Error(error.message || 'Failed to delete photo');
    }
}

/**
 * Get profile photo URL
 */
export function getProfilePhotoUrl(fileId: string): string {
    return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.storageBucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
}

/**
 * Get donor profile by user ID
 */
export async function getDonorProfile(userId: string): Promise<any | null> {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.donors,
            [
                // Query by userId field, not document ID
                `userId=${userId}`
            ]
        );

        if (response.documents.length > 0) {
            return response.documents[0];
        }

        return null;
    } catch (error) {
        console.error('Get donor profile error:', error);
        return null;
    }
}

/**
 * Get blood bank profile by user ID
 */
export async function getBloodBankProfile(userId: string): Promise<any | null> {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.bloodBanks,
            [
                `userId=${userId}`
            ]
        );

        if (response.documents.length > 0) {
            return response.documents[0];
        }

        return null;
    } catch (error) {
        console.error('Get blood bank profile error:', error);
        return null;
    }
}

/**
 * Update donor-specific profile
 */
export async function updateDonorProfile(
    donorId: string,
    data: any
): Promise<any> {
    try {
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.donors,
            donorId,
            updateData
        );

        return response;
    } catch (error: any) {
        console.error('Update donor profile error:', error);
        throw new Error(error.message || 'Failed to update donor profile');
    }
}

/**
 * Update blood bank-specific profile
 */
export async function updateBloodBankProfile(
    bloodBankId: string,
    data: any
): Promise<any> {
    try {
        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };

        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.bloodBanks,
            bloodBankId,
            updateData
        );

        return response;
    } catch (error: any) {
        console.error('Update blood bank profile error:', error);
        throw new Error(error.message || 'Failed to update blood bank profile');
    }
}

/**
 * Create donor profile if it doesn't exist
 */
export async function createDonorProfile(userId: string, data: any): Promise<any> {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.donors,
            ID.unique(),
            {
                userId,
                ...data,
                isAvailable: true,
                isEligible: true,
                donationCount: 0,
                notificationsEnabled: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );

        return response;
    } catch (error: any) {
        console.error('Create donor profile error:', error);
        throw new Error(error.message || 'Failed to create donor profile');
    }
}

/**
 * Create blood bank profile if it doesn't exist
 */
export async function createBloodBankProfile(userId: string, data: any): Promise<any> {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.bloodBanks,
            ID.unique(),
            {
                userId,
                ...data,
                isVerified: false,
                notificationsEnabled: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );

        return response;
    } catch (error: any) {
        console.error('Create blood bank profile error:', error);
        throw new Error(error.message || 'Failed to create blood bank profile');
    }
}
