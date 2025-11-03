'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, MapPin } from 'lucide-react';
import { getNearbySOSRequests, SOSRequest } from '@/lib/services/sos';
import { getDonorProfile } from '@/lib/services/profile';
import { hasDonorResponded } from '@/lib/services/sos-response';
import { SOSCard } from '@/components/sos';
import Link from 'next/link';

export default function DonorSOSPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [sosRequests, setSOSRequests] = useState<Array<SOSRequest & { distance: number; hasResponded: boolean }>>([]);
    const [radius, setRadius] = useState('25');
    const [donorBloodGroup, setDonorBloodGroup] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (!authLoading && user?.role !== 'donor') {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadDonorProfile();
        }
    }, [user]);

    useEffect(() => {
        if (user && donorBloodGroup && user.latitude && user.longitude) {
            loadNearbyRequests();
        }
    }, [user, donorBloodGroup, radius]);

    const loadDonorProfile = async () => {
        if (!user) return;

        try {
            const profile = await getDonorProfile(user.$id);
            if (profile && profile.bloodGroup) {
                setDonorBloodGroup(profile.bloodGroup);
            }
        } catch (error) {
            console.error('Load donor profile error:', error);
        }
    };

    const loadNearbyRequests = async () => {
        if (!user || !donorBloodGroup || !user.latitude || !user.longitude) return;

        setLoading(true);
        try {
            const requests = await getNearbySOSRequests(
                user.latitude,
                user.longitude,
                donorBloodGroup,
                parseInt(radius)
            );

            // Check if donor has responded to each request
            const requestsWithStatus = await Promise.all(
                requests.map(async (req) => {
                    const hasResponded = await hasDonorResponded(req.$id, user.$id);
                    return { ...req, hasResponded };
                })
            );

            setSOSRequests(requestsWithStatus);
        } catch (error) {
            console.error('Load nearby requests error:', error);
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

    if (!user || user.role !== 'donor') {
        return null;
    }

    // Check if profile is incomplete
    if (!user.latitude || !user.longitude) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Nearby Emergency Requests</h1>
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>Location Required:</strong> Please update your profile with your location to see nearby emergency requests.
                    </AlertDescription>
                </Alert>
                <Link href="/dashboard/profile/edit" className="mt-4 inline-block">
                    <Button>Update Profile</Button>
                </Link>
            </div>
        );
    }

    if (!donorBloodGroup) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Nearby Emergency Requests</h1>
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>Blood Group Required:</strong> Please update your donor profile with your blood group.
                    </AlertDescription>
                </Alert>
                <Link href="/dashboard/profile/edit" className="mt-4 inline-block">
                    <Button>Update Profile</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-red-600">Emergency Blood Requests</h1>
                <p className="text-muted-foreground mt-1">
                    Help save lives by responding to nearby emergencies
                </p>
            </div>

            {/* Filter Controls */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Search Radius:</span>
                        </div>
                        <Select value={radius} onValueChange={setRadius}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 km</SelectItem>
                                <SelectItem value="25">25 km</SelectItem>
                                <SelectItem value="50">50 km</SelectItem>
                                <SelectItem value="100">100 km</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="ml-auto">
                            <span className="text-sm text-muted-foreground">
                                Your Blood Group: <span className="font-bold text-red-600">{donorBloodGroup}</span>
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SOS Requests */}
            {loading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </CardContent>
                </Card>
            ) : sosRequests.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Emergency Requests Nearby</h3>
                        <p className="text-muted-foreground text-center">
                            There are no active emergency blood requests in your area at the moment.
                            <br />
                            Check back later or increase your search radius.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">
                            Found <span className="font-bold text-foreground">{sosRequests.length}</span> emergency {sosRequests.length === 1 ? 'request' : 'requests'} near you
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sosRequests.map((sos) => (
                            <SOSCard
                                key={sos.$id}
                                sos={sos}
                                showDistance={true}
                                showActions={true}
                                viewDetailsLink={`/dashboard/donor/sos/${sos.$id}`}
                                hasResponded={sos.hasResponded}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
