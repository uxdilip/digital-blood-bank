'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { NearbyUsersMap } from '@/components/map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Loader2 } from 'lucide-react';

export default function NearbyPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [radius, setRadius] = useState<number>(10);
    const [roleFilter, setRoleFilter] = useState<'donor' | 'blood_bank' | 'patient' | 'all'>('all');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (!user.latitude || !user.longitude) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-6 w-6" />
                            Location Not Set
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            To view nearby users, you need to set your location in your profile.
                        </p>
                        <Button onClick={() => router.push('/dashboard/profile/edit')}>
                            Update Profile
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Nearby Users</h1>
                <p className="text-muted-foreground">
                    Find blood donors, blood banks, and patients near your location
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="radius">Search Radius (km)</Label>
                            <Select
                                value={radius.toString()}
                                onValueChange={(value) => setRadius(Number(value))}
                            >
                                <SelectTrigger id="radius">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 km</SelectItem>
                                    <SelectItem value="10">10 km</SelectItem>
                                    <SelectItem value="15">15 km</SelectItem>
                                    <SelectItem value="20">20 km</SelectItem>
                                    <SelectItem value="30">30 km</SelectItem>
                                    <SelectItem value="50">50 km</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">User Type</Label>
                            <Select
                                value={roleFilter}
                                onValueChange={(value) => setRoleFilter(value as any)}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="donor">Donors Only</SelectItem>
                                    <SelectItem value="blood_bank">Blood Banks Only</SelectItem>
                                    <SelectItem value="patient">Patients Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Map */}
            <NearbyUsersMap
                currentUser={user}
                radius={radius}
                roleFilter={roleFilter === 'all' ? undefined : roleFilter}
            />
        </div>
    );
}
