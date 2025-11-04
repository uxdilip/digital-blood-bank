'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Calendar, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getPatientRequests, SOSRequest } from '@/lib/services/sos';
import { UrgencyBadge, SOSCard } from '@/components/sos';

export default function PatientDashboard() {
    const { user } = useAuth();
    const [recentRequests, setRecentRequests] = useState<SOSRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadRecentRequests();
        }
    }, [user]);

    const loadRecentRequests = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const requests = await getPatientRequests(user.$id);
            // Get most recent 3 requests
            setRecentRequests(requests.slice(0, 3));
        } catch (error) {
            console.error('Load recent requests error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
                <p className="text-gray-600 mt-1">Find blood donors and search blood bank inventory</p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-red-600" />
                            Create SOS Request
                        </CardTitle>
                        <CardDescription>
                            Send urgent blood request to nearby donors
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/patient/sos/create">
                            <Button className="w-full bg-red-600 hover:bg-red-700">
                                Create Emergency SOS
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search Blood Banks
                        </CardTitle>
                        <CardDescription>
                            Find blood banks near you with available inventory
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            Search Inventory
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent SOS Requests</CardTitle>
                            <CardDescription>Your emergency blood requests</CardDescription>
                        </div>
                        <Link href="/dashboard/patient/sos/my-requests">
                            <Button variant="outline" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        </div>
                    ) : recentRequests.length > 0 ? (
                        <div className="space-y-4">
                            {recentRequests.map((sos) => (
                                <Link
                                    key={sos.$id}
                                    href={`/dashboard/patient/sos/my-requests`}
                                    className="block"
                                >
                                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="text-red-600 border-red-300">
                                                        {sos.bloodGroup}
                                                    </Badge>
                                                    <UrgencyBadge urgency={sos.urgency} />
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            sos.status === 'active'
                                                                ? 'bg-green-100 text-green-800 border-green-300'
                                                                : sos.status === 'fulfilled'
                                                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                                                    : 'bg-gray-100 text-gray-800 border-gray-300'
                                                        }
                                                    >
                                                        {sos.status}
                                                    </Badge>
                                                </div>
                                                <h3 className="font-semibold">{sos.hospitalName}</h3>
                                                <p className="text-sm text-gray-600 line-clamp-1">{sos.hospitalAddress}</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {sos.unitsNeeded} {sos.unitsNeeded === 1 ? 'unit' : 'units'} • {sos.responseCount} responses
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                            <p>No SOS requests yet</p>
                            <p className="text-sm mt-1">Create your first emergency request</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Profile Completion */}
            {!user?.location && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-900">
                            <MapPin className="h-5 w-5" />
                            Complete Your Profile
                        </CardTitle>
                        <CardDescription className="text-orange-700">
                            Add your location to find nearby blood banks and donors
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/profile/edit">
                            <Button variant="outline">
                                Update Location
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
