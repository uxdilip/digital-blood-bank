'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // Redirect based on user role
            const roleRoutes = {
                patient: '/dashboard/patient',
                donor: '/dashboard/donor',
                blood_bank: '/dashboard/blood-bank',
                admin: '/dashboard/admin',
            };

            router.push(roleRoutes[user.role]);
        } else if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="space-y-4">
                <Skeleton className="h-12 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    );
}
