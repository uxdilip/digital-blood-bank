'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, AlertCircle } from 'lucide-react';
import { getPatientRequests, SOSRequest, SOSStatus } from '@/lib/services/sos';
import { SOSCard } from '@/components/sos';
import Link from 'next/link';

export default function MyRequestsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<SOSRequest[]>([]);
    const [activeTab, setActiveTab] = useState<SOSStatus | 'all'>('active');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (!authLoading && user?.role !== 'patient') {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadRequests();
        }
    }, [user]);

    const loadRequests = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const data = await getPatientRequests(user.$id);
            setRequests(data);
        } catch (error) {
            console.error('Load requests error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || user.role !== 'patient') {
        return null;
    }

    const filterByStatus = (status: SOSStatus | 'all') => {
        if (status === 'all') return requests;
        return requests.filter(req => req.status === status);
    };

    const getStatusColor = (status: SOSStatus) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-300';
            case 'fulfilled': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
        }
    };

    const statusCounts = {
        all: requests.length,
        active: requests.filter(r => r.status === 'active').length,
        fulfilled: requests.filter(r => r.status === 'fulfilled').length,
        cancelled: requests.filter(r => r.status === 'cancelled').length,
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">My SOS Requests</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your emergency blood requests
                    </p>
                </div>
                <Link href="/dashboard/patient/sos/create">
                    <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New SOS
                    </Button>
                </Link>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </CardContent>
                </Card>
            ) : requests.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No SOS Requests Yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Create your first emergency blood request to get started
                        </p>
                        <Link href="/dashboard/patient/sos/create">
                            <Button className="bg-red-600 hover:bg-red-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Emergency SOS
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">
                            All ({statusCounts.all})
                        </TabsTrigger>
                        <TabsTrigger value="active">
                            Active ({statusCounts.active})
                        </TabsTrigger>
                        <TabsTrigger value="fulfilled">
                            Fulfilled ({statusCounts.fulfilled})
                        </TabsTrigger>
                        <TabsTrigger value="cancelled">
                            Cancelled ({statusCounts.cancelled})
                        </TabsTrigger>
                    </TabsList>

                    {(['all', 'active', 'fulfilled', 'cancelled'] as const).map(status => (
                        <TabsContent key={status} value={status} className="space-y-4">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filterByStatus(status).map(sos => (
                                    <div key={sos.$id} className="relative">
                                        <Badge
                                            variant="outline"
                                            className={`absolute top-2 right-2 z-10 ${getStatusColor(sos.status)}`}
                                        >
                                            {sos.status}
                                        </Badge>
                                        <SOSCard
                                            sos={sos}
                                            showDistance={false}
                                            showActions={true}
                                            viewDetailsLink={`/dashboard/patient/sos/${sos.$id}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            {filterByStatus(status).length === 0 && (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        No {status === 'all' ? '' : status} requests
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </div>
    );
}
