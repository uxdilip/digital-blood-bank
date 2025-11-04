'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, MapPin, Phone, User, Calendar, Droplet, Users, CheckCircle, XCircle } from 'lucide-react';
import { getSOSRequest, updateSOSStatus, SOSRequest } from '@/lib/services/sos';
import { getSOSResponses, SOSResponse } from '@/lib/services/sos-response';
import { databases } from '@/lib/appwrite/config';
import { appwriteConfig } from '@/lib/appwrite/env';
import { UrgencyBadge } from '@/components/sos';
import { LocationMap } from '@/components/map';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function PatientSOSDetailsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const sosId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [sos, setSOS] = useState<SOSRequest | null>(null);
    const [responses, setResponses] = useState<Array<SOSResponse & { donorInfo?: any }>>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (!authLoading && user?.role !== 'patient') {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && sosId) {
            loadSOSDetails();
        }
    }, [user, sosId]);

    const loadSOSDetails = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const sosData = await getSOSRequest(sosId);
            if (sosData) {
                // Verify this SOS belongs to the current user
                if (sosData.patientId !== user.$id) {
                    toast.error('Unauthorized access');
                    router.push('/dashboard');
                    return;
                }

                setSOS(sosData);

                // Load responses
                const responsesData = await getSOSResponses(sosId);

                // Fetch donor info for each response
                const responsesWithDonorInfo = await Promise.all(
                    responsesData.map(async (response) => {
                        try {
                            const donorDoc = await databases.getDocument(
                                appwriteConfig.databaseId,
                                appwriteConfig.collections.users,
                                response.donorId
                            );
                            return { ...response, donorInfo: donorDoc };
                        } catch {
                            return response;
                        }
                    })
                );

                setResponses(responsesWithDonorInfo);
            }
        } catch (error) {
            console.error('Load SOS details error:', error);
            toast.error('Failed to load SOS details');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkFulfilled = async () => {
        if (!sos) return;

        setUpdating(true);
        try {
            await updateSOSStatus(sos.$id, 'fulfilled', new Date().toISOString());
            toast.success('SOS request marked as fulfilled');
            await loadSOSDetails();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = async () => {
        if (!sos) return;

        setUpdating(true);
        try {
            await updateSOSStatus(sos.$id, 'cancelled');
            toast.success('SOS request cancelled');
            await loadSOSDetails();
        } catch (error) {
            toast.error('Failed to cancel request');
        } finally {
            setUpdating(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || user.role !== 'patient' || !sos) {
        return null;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800 border-green-300';
            case 'Fulfilled': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Expired': return 'bg-gray-100 text-gray-800 border-gray-300';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300';
            default: return '';
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <Button variant="outline" onClick={() => router.push('/dashboard/patient/sos/my-requests')} className="mb-4">
                    ← Back to My Requests
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-red-600">SOS Request Details</h1>
                        <p className="text-muted-foreground mt-1">Created {formatDistanceToNow(new Date(sos.createdAt), { addSuffix: true })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <UrgencyBadge urgency={sos.urgency} />
                        <Badge variant="outline" className={getStatusColor(sos.status)}>
                            {sos.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Blood Requirement */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Droplet className="h-5 w-5 text-red-600" />
                            Blood Requirement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Blood Group</p>
                                <p className="text-3xl font-bold text-red-600">{sos.bloodGroup}</p>
                            </div>
                            <div className="h-12 w-px bg-border"></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Units Needed</p>
                                <p className="text-2xl font-bold">{sos.unitsNeeded}</p>
                            </div>
                            <div className="h-12 w-px bg-border"></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Responses</p>
                                <p className="text-2xl font-bold text-green-600">{sos.responseCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Hospital Location */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Hospital Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-semibold text-lg">{sos.hospitalName}</p>
                            <p className="text-sm text-muted-foreground">{sos.hospitalAddress}</p>
                        </div>
                        <LocationMap
                            latitude={sos.latitude}
                            longitude={sos.longitude}
                            zoom={15}
                            height="300px"
                        />
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="h-5 w-5" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Contact Person</p>
                                <p className="font-medium">{sos.contactPerson}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Phone Number</p>
                                <p className="font-medium">{sos.contactPhone}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Notes */}
                {sos.medicalNotes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Medical Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{sos.medicalNotes}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Donor Responses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Donor Responses ({responses.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {responses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p>No donor responses yet</p>
                                <p className="text-sm mt-1">Donors will be notified about your request</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {responses.map((response) => (
                                    <div key={response.$id} className="p-4 border rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{response.donorInfo?.name || 'Anonymous Donor'}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Responded {formatDistanceToNow(new Date(response.respondedAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                                {response.status}
                                            </Badge>
                                        </div>
                                        {response.donorInfo && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <a href={`tel:${response.donorInfo.phone}`} className="text-primary hover:underline">
                                                    {response.donorInfo.phone}
                                                </a>
                                            </div>
                                        )}
                                        {response.message && (
                                            <div className="mt-2 p-3 bg-muted rounded text-sm">
                                                <p className="font-medium mb-1">Message:</p>
                                                <p className="text-muted-foreground">{response.message}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                {sos.status === 'active' && (
                    <div className="flex gap-4">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="flex-1" disabled={updating}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Request
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel SOS Request?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will mark your request as cancelled. Donors will no longer be able to respond.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>No, Keep Active</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCancel}>Yes, Cancel Request</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="flex-1 bg-green-600 hover:bg-green-700" disabled={updating}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark as Fulfilled
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Mark as Fulfilled?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will mark your request as fulfilled. This action indicates you received the blood you needed.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleMarkFulfilled} className="bg-green-600 hover:bg-green-700">
                                        Yes, Mark Fulfilled
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>
        </div>
    );
}
