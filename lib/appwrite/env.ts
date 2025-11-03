// Environment variables with type safety
export const appwriteConfig = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    collections: {
        users: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        donors: process.env.NEXT_PUBLIC_APPWRITE_DONORS_COLLECTION_ID!,
        bloodBanks: process.env.NEXT_PUBLIC_APPWRITE_BLOOD_BANKS_COLLECTION_ID!,
        inventory: process.env.NEXT_PUBLIC_APPWRITE_INVENTORY_COLLECTION_ID!,
        sosRequests: process.env.NEXT_PUBLIC_APPWRITE_SOS_REQUESTS_COLLECTION_ID!,
        sosResponses: process.env.NEXT_PUBLIC_APPWRITE_SOS_RESPONSES_COLLECTION_ID!,
        appointments: process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID!,
    },
    storageBucketId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
    appUrl: process.env.NEXT_PUBLIC_APP_URL!,
};
