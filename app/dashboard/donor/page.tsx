'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Droplet, Heart } from 'lucide-react';
import Link from 'next/link';

export default function DonorDashboard() {
    const { user } = useAuth();

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
                            -
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Set in profile</p>
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
                        <Link href="/dashboard/donor/sos">
                            <Button className="w-full bg-red-600 hover:bg-red-700">
                                View Emergency Requests
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
            <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-900">
                        <Heart className="h-5 w-5" />
                        Complete Your Donor Profile
                    </CardTitle>
                    <CardDescription className="text-orange-700">
                        Add blood group and location to start receiving SOS requests
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
        </div>
    );
}
