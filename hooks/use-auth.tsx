'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/lib/appwrite/auth';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const accountData = await authService.getCurrentUser();
            if (accountData) {
                const userDoc = await authService.getUserDocument(accountData.$id);
                setUser(userDoc);
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function login(email: string, password: string) {
        try {
            await authService.login({ email, password });
            await checkAuth();
        } catch (error: any) {
            throw error;
        }
    }

    async function register(data: any) {
        try {
            await authService.register(data);
            await checkAuth();
        } catch (error: any) {
            throw error;
        }
    }

    async function logout() {
        try {
            await authService.logout();
            setUser(null);
            router.push('/login');
        } catch (error: any) {
            throw error;
        }
    }

    async function refreshUser() {
        await checkAuth();
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
