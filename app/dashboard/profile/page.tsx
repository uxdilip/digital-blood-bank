'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.push('/dashboard/profile/view');
    }, [router]);

    return null;
}
