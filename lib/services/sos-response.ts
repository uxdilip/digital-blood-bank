import { databases, ID, Query } from '@/lib/appwrite/config';
import { appwriteConfig } from '@/lib/appwrite/env';
import { incrementResponseCount } from './sos';

export type ResponseStatus = 'Interested' | 'Confirmed' | 'Declined' | 'Completed';

export interface SOSResponse {
    $id: string;
    sosId: string;
    donorId: string;
    status: ResponseStatus;
    message?: string;
    respondedAt: string;
    confirmedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Donor responds to an SOS request
 */
export async function respondToSOS(data: {
    sosId: string;
    donorId: string;
    message?: string;
}): Promise<SOSResponse> {
    try {
        // Check if donor already responded
        const existingResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosResponses,
            [
                Query.equal('sosId', data.sosId),
                Query.equal('donorId', data.donorId)
            ]
        );

        if (existingResponse.documents.length > 0) {
            throw new Error('You have already responded to this SOS request');
        }

        const now = new Date().toISOString();

        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosResponses,
            ID.unique(),
            {
                sosId: data.sosId,
                donorId: data.donorId,
                status: 'Interested',
                message: data.message || '',
                respondedAt: now,
                createdAt: now,
                updatedAt: now
            }
        );

        // Increment response count on SOS request
        await incrementResponseCount(data.sosId);

        return response as unknown as SOSResponse;
    } catch (error: any) {
        console.error('Respond to SOS error:', error);
        throw new Error(error.message || 'Failed to respond to SOS request');
    }
}

/**
 * Get all responses for an SOS request
 */
export async function getSOSResponses(sosId: string): Promise<SOSResponse[]> {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosResponses,
            [
                Query.equal('sosId', sosId),
                Query.orderDesc('respondedAt')
            ]
        );

        return response.documents as unknown as SOSResponse[];
    } catch (error) {
        console.error('Get SOS responses error:', error);
        return [];
    }
}

/**
 * Get all responses made by a donor
 */
export async function getDonorResponses(donorId: string): Promise<SOSResponse[]> {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosResponses,
            [
                Query.equal('donorId', donorId),
                Query.orderDesc('respondedAt')
            ]
        );

        return response.documents as unknown as SOSResponse[];
    } catch (error) {
        console.error('Get donor responses error:', error);
        return [];
    }
}

/**
 * Update response status
 */
export async function updateResponseStatus(
    responseId: string,
    status: ResponseStatus
): Promise<void> {
    try {
        const updateData: any = {
            status,
            updatedAt: new Date().toISOString()
        };

        if (status === 'Confirmed') {
            updateData.confirmedAt = new Date().toISOString();
        } else if (status === 'Completed') {
            updateData.completedAt = new Date().toISOString();
        }

        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosResponses,
            responseId,
            updateData
        );
    } catch (error) {
        console.error('Update response status error:', error);
        throw new Error('Failed to update response status');
    }
}

/**
 * Check if donor has already responded to an SOS
 */
export async function hasDonorResponded(sosId: string, donorId: string): Promise<boolean> {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosResponses,
            [
                Query.equal('sosId', sosId),
                Query.equal('donorId', donorId)
            ]
        );

        return response.documents.length > 0;
    } catch (error) {
        console.error('Check donor response error:', error);
        return false;
    }
}

/**
 * Get donor's response to a specific SOS
 */
export async function getDonorResponseForSOS(sosId: string, donorId: string): Promise<SOSResponse | null> {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosResponses,
            [
                Query.equal('sosId', sosId),
                Query.equal('donorId', donorId)
            ]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as SOSResponse;
        }

        return null;
    } catch (error) {
        console.error('Get donor response for SOS error:', error);
        return null;
    }
}

/**
 * Delete a response (if donor wants to retract)
 */
export async function deleteResponse(responseId: string, donorId: string): Promise<void> {
    try {
        // Verify the response belongs to the donor
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosResponses,
            responseId
        );

        if ((response as any).donorId !== donorId) {
            throw new Error('Unauthorized: You can only delete your own responses');
        }

        if ((response as any).status === 'Confirmed' || (response as any).status === 'Completed') {
            throw new Error('Cannot delete confirmed or completed responses');
        }

        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosResponses,
            responseId
        );
    } catch (error: any) {
        console.error('Delete response error:', error);
        throw new Error(error.message || 'Failed to delete response');
    }
}

/**
 * Get response count for an SOS request
 */
export async function getResponseCount(sosId: string): Promise<number> {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.collections.sosResponses,
            [Query.equal('sosId', sosId)]
        );

        return response.documents.length;
    } catch (error) {
        console.error('Get response count error:', error);
        return 0;
    }
}
