'use client';

import { useEffect, useState } from 'react';
import { LocationMap } from './location-map';
import { findNearbyUsers, calculateDistance } from '@/lib/services/location';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface NearbyUsersMapProps {
    currentUser: User;
    radius?: number; // in kilometers
    roleFilter?: 'donor' | 'blood_bank' | 'patient';
}

export function NearbyUsersMap({
    currentUser,
    radius = 10,
    roleFilter
}: NearbyUsersMapProps) {
    const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNearbyUsers = async () => {
            if (!currentUser.latitude || !currentUser.longitude) {
                setError('Your location is not set. Please update your profile.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const users = await findNearbyUsers(
                    currentUser.latitude,
                    currentUser.longitude,
                    radius,
                    roleFilter
                );

                // Filter out current user
                const filteredUsers = users.filter(u => u.$id !== currentUser.$id);
                setNearbyUsers(filteredUsers);
                setError(null);
            } catch (err) {
                console.error('Error fetching nearby users:', err);
                setError('Failed to load nearby users');
            } finally {
                setLoading(false);
            }
        };

        fetchNearbyUsers();
    }, [currentUser, radius, roleFilter]);

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!currentUser.latitude || !currentUser.longitude) {
        return null;
    }

    // Prepare markers for the map
    const markers = nearbyUsers
        .filter(user => user.latitude && user.longitude)
        .map(user => {
            const distance = calculateDistance(
                currentUser.latitude!,
                currentUser.longitude!,
                user.latitude!,
                user.longitude!
            );

            let icon: 'red' | 'blue' | 'green' = 'red';
            if (user.role === 'blood_bank') icon = 'blue';
            else if (user.role === 'patient') icon = 'green';

            return {
                lat: user.latitude!,
                lng: user.longitude!,
                icon,
                popup: `
                    <div style="min-width: 200px;">
                        <strong>${user.name}</strong><br/>
                        <span style="text-transform: capitalize;">${user.role}</span><br/>
                        ${user.city ? `${user.city}<br/>` : ''}
                        <strong>${distance.toFixed(1)} km away</strong>
                    </div>
                `
            };
        });

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>
                            Nearby {roleFilter ? roleFilter.replace('_', ' ').toUpperCase() : 'Users'}
                        </span>
                        <Badge variant="outline">
                            {nearbyUsers.length} within {radius}km
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <LocationMap
                        latitude={currentUser.latitude}
                        longitude={currentUser.longitude}
                        zoom={12}
                        height="500px"
                        markers={markers}
                    />
                </CardContent>
            </Card>

            {/* Legend */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Donors</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span>Blood Banks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Patients</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* User list */}
            {nearbyUsers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>List View</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {nearbyUsers.map(user => {
                                const distance = user.latitude && user.longitude
                                    ? calculateDistance(
                                        currentUser.latitude!,
                                        currentUser.longitude!,
                                        user.latitude,
                                        user.longitude
                                    )
                                    : null;

                                return (
                                    <div
                                        key={user.$id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {user.role.replace('_', ' ')}
                                                {user.city && ` • ${user.city}`}
                                            </p>
                                        </div>
                                        {distance !== null && (
                                            <Badge variant="secondary">
                                                {distance.toFixed(1)} km
                                            </Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
