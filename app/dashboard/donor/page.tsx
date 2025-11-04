'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Droplet, Heart, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getNearbySOSRequests, SOSRequest } from '@/lib/services/sos';
import { getDonorProfile } from '@/lib/services/profile';
import { UrgencyBadge } from '@/components/sos';

export default function DonorDashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any | null>(null);
    const [nearbyRequests, setNearbyRequests] = useState<(SOSRequest & { distance?: number })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Load profile
            const profileData = await getDonorProfile(user.$id);
            console.log('Donor Profile Data:', profileData);
            console.log('User Data:', user);
            console.log('Blood Group from profile:', profileData?.bloodGroup);
            console.log('Latitude from user:', user?.latitude);
            console.log('Longitude from user:', user?.longitude);
            setProfile(profileData);

            // Load nearby SOS requests if profile has blood group and user has location
            if (profileData?.bloodGroup && user?.latitude && user?.longitude) {
                console.log('Loading nearby SOS requests...');
                const requests = await getNearbySOSRequests(
                    user.latitude,
                    user.longitude,
                    profileData.bloodGroup,
                    50 // 50km radius for dashboard
                );
                console.log('Nearby requests:', requests);
                // Show only first 3
                setNearbyRequests(requests.slice(0, 3));
            } else {
                console.log('Profile incomplete - missing:', {
                    hasBloodGroup: !!profileData?.bloodGroup,
                    hasLatitude: !!user?.latitude,
                    hasLongitude: !!user?.longitude
                });
            }
        } catch (error) {
            console.error('Load dashboard data error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
                <p className="text-gray-600 mt-1">Your contribution saves lives</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Blood Group</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            <Droplet className="inline h-6 w-6 mr-1" />
                            {profile?.bloodGroup || '-'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {profile?.bloodGroup ? 'Your blood type' : 'Set in profile'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Donations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-500 mt-1">Lifetime count</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Eligibility Status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Eligible
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">Ready to donate</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Next Donation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-gray-500 mt-1">No scheduled</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Active SOS Requests
                        </CardTitle>
                        <CardDescription>
                            Emergency blood requests near you
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                            </div>
                        ) : !profile?.bloodGroup || !user?.latitude ? (
                            <div className="text-center py-4 text-sm text-gray-600 mb-4">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="font-medium mb-2">Complete your profile to see requests</p>
                                <div className="text-xs space-y-1">
                                    {!profile?.bloodGroup && <p>❌ Blood group not set</p>}
                                    {!user?.latitude && <p>❌ Location not set</p>}
                                </div>
                            </div>
                        ) : nearbyRequests.length > 0 ? (
                            <div className="space-y-3 mb-4">
                                {nearbyRequests.map((sos) => (
                                    <Link
                                        key={sos.$id}
                                        href={`/dashboard/donor/sos`}
                                        className="block"
                                    >
                                        <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-red-600 border-red-300">
                                                        {sos.bloodGroup}
                                                    </Badge>
                                                    <UrgencyBadge urgency={sos.urgency} />
                                                </div>
                                                {sos.distance && (
                                                    <span className="text-sm text-gray-500">
                                                        {sos.distance.toFixed(1)}km
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium line-clamp-1">{sos.hospitalName}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-sm text-gray-600 mb-4">
                                <p>No emergency requests nearby</p>
                            </div>
                        )}
                        <Link href="/dashboard/donor/sos">
                            <Button className="w-full bg-red-600 hover:bg-red-700">
                                View All Emergency Requests
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Schedule Donation
                        </CardTitle>
                        <CardDescription>
                            Book an appointment with a blood bank
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" variant="outline">
                            Browse Blood Banks
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Appointments */}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled donations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No upcoming appointments</p>
                        <p className="text-sm mt-1">Schedule your next donation</p>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Reminder */}
            {(!profile?.bloodGroup || !user?.latitude) && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-900">
                            <Heart className="h-5 w-5" />
                            Complete Your Donor Profile
                        </CardTitle>
                        <CardDescription className="text-orange-700">
                            {!profile?.bloodGroup && !user?.latitude
                                ? 'Add blood group and location to start receiving SOS requests'
                                : !profile?.bloodGroup
                                    ? 'Add blood group to start receiving SOS requests'
                                    : 'Add location to start receiving SOS requests'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/profile/edit">
                            <Button variant="outline">
                                Update Profile
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
