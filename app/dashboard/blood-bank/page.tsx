'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Calendar, MapPin, CheckCircle } from 'lucide-react';

export default function BloodBankDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Blood Bank Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage inventory and appointments</p>
            </div>

            {/* Verification Status */}
            {!user?.isVerified && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="text-yellow-900">Verification Pending</CardTitle>
                        <CardDescription className="text-yellow-700">
                            Your blood bank is under review. You'll receive a notification once verified.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Units</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-500 mt-1">All blood types</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Blood Types</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-500 mt-1">Available types</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-500 mt-1">This week</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Donations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-gray-500 mt-1">This month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Manage Inventory
                        </CardTitle>
                        <CardDescription>
                            Update blood stock levels
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full">
                            Update Inventory
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            View Appointments
                        </CardTitle>
                        <CardDescription>
                            Manage donation appointments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full">
                            View Schedule
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Current Inventory */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Inventory</CardTitle>
                    <CardDescription>Blood units by type</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No inventory data</p>
                        <p className="text-sm mt-1">Add your first blood stock entry</p>
                    </div>
                </CardContent>
            </Card>

            {/* Setup Reminder */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                        <CheckCircle className="h-5 w-5" />
                        Complete Your Setup
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                        Add your blood bank details and operating hours
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline">
                        Complete Profile
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
