import { account, databases, ID } from './config';
import { appwriteConfig } from './env';
import { RegisterData, LoginData, User } from '@/types';

export const authService = {
    // Register new user
    async register(data: RegisterData) {
        try {
            // Create Appwrite account
            const response = await account.create(
                ID.unique(),
                data.email,
                data.password,
                data.name
            );

            // Create user document in database
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.users,
                response.$id,
                {
                    email: data.email,
                    phone: data.phone,
                    name: data.name,
                    role: data.role,
                    isVerified: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            );

            // Create session
            await account.createEmailPasswordSession(data.email, data.password);

            return { success: true, userId: response.$id };
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Registration failed');
        }
    },

    // Login user
    async login(data: LoginData) {
        try {
            const session = await account.createEmailPasswordSession(
                data.email,
                data.password
            );
            return { success: true, session };
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed');
        }
    },

    // Logout user
    async logout() {
        try {
            await account.deleteSession('current');
            return { success: true };
        } catch (error: any) {
            console.error('Logout error:', error);
            throw new Error(error.message || 'Logout failed');
        }
    },

    // Get current user account
    async getCurrentUser() {
        try {
            const accountData = await account.get();
            return accountData;
        } catch (error) {
            return null;
        }
    },

    // Get user document from database
    async getUserDocument(userId: string): Promise<User | null> {
        try {
            const document = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.users,
                userId
            );
            return document as unknown as User;
        } catch (error) {
            console.error('Get user document error:', error);
            return null;
        }
    },

    // Get current session
    async getSession() {
        try {
            const session = await account.getSession('current');
            return session;
        } catch (error) {
            return null;
        }
    },

    // Send email verification
    async sendVerificationEmail() {
        try {
            const url = `${appwriteConfig.appUrl}/verify-email`;
            await account.createVerification(url);
            return { success: true };
        } catch (error: any) {
            console.error('Send verification error:', error);
            throw new Error(error.message || 'Failed to send verification email');
        }
    },

    // Confirm email verification
    async confirmVerification(userId: string, secret: string) {
        try {
            await account.updateVerification(userId, secret);
            return { success: true };
        } catch (error: any) {
            console.error('Confirm verification error:', error);
            throw new Error(error.message || 'Verification failed');
        }
    },

    // Update user document
    async updateUserDocument(userId: string, data: Partial<User>) {
        try {
            const document = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.users,
                userId,
                {
                    ...data,
                    updatedAt: new Date().toISOString(),
                }
            );
            return document;
        } catch (error: any) {
            console.error('Update user document error:', error);
            throw new Error(error.message || 'Failed to update user');
        }
    },
};
