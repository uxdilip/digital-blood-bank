'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Phone, User, Calendar, Droplet, AlertCircle, CheckCircle } from 'lucide-react';
import { getSOSRequest, SOSRequest } from '@/lib/services/sos';
import { calculateDistance } from '@/lib/services/location';
import { respondToSOS, getDonorResponseForSOS, SOSResponse } from '@/lib/services/sos-response';
import { UrgencyBadge } from '@/components/sos';
import { LocationMap } from '@/components/map';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DonorSOSDetailsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const sosId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState(false);
    const [sos, setSOS] = useState<SOSRequest | null>(null);
    const [response, setResponse] = useState<SOSResponse | null>(null);
    const [message, setMessage] = useState('');
    const [distance, setDistance] = useState<number | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (!authLoading && user?.role !== 'donor') {
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
                setSOS(sosData);

                // Calculate distance if user has location
                if (user.latitude && user.longitude) {
                    const dist = calculateDistance(
                        user.latitude,
                        user.longitude,
                        sosData.latitude,
                        sosData.longitude
                    );
                    setDistance(dist);
                }

                // Check if donor has already responded
                const donorResponse = await getDonorResponseForSOS(sosId, user.$id);
                setResponse(donorResponse);
            }
        } catch (error) {
            console.error('Load SOS details error:', error);
            toast.error('Failed to load SOS details');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async () => {
        if (!user || !sos) return;

        if (sos.status !== 'active') {
            toast.error('This SOS request is no longer active');
            return;
        }

        setResponding(true);
        try {
            await respondToSOS({
                sosId: sos.$id,
                donorId: user.$id,
                message: message.trim()
            });

            toast.success('Response sent successfully! Patient can now contact you.');
            await loadSOSDetails(); // Reload to show updated status
        } catch (error: any) {
            console.error('Respond to SOS error:', error);
            toast.error(error.message || 'Failed to respond to SOS');
        } finally {
            setResponding(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || user.role !== 'donor' || !sos) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <Button variant="outline" onClick={() => router.back()} className="mb-4">
                    ← Back to Emergency Requests
                </Button>
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-red-600">Emergency Blood Request</h1>
                    <UrgencyBadge urgency={sos.urgency} />
                </div>
            </div>

            {/* Status Alert */}
            {sos.status !== 'active' && (
                <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        This request is <strong>{sos.status}</strong> and no longer accepting responses.
                    </AlertDescription>
                </Alert>
            )}

            {/* Already Responded Alert */}
            {response && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        <strong>You've responded to this request!</strong> The patient can now contact you at your registered phone number.
                        {response.message && (
                            <p className="mt-2 text-sm">Your message: "{response.message}"</p>
                        )}
                    </AlertDescription>
                </Alert>
            )}

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

                        {distance !== null && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span><strong>{distance.toFixed(1)} km</strong> away from you</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Posted {formatDistanceToNow(new Date(sos.createdAt), { addSuffix: true })}</span>
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
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${sos.latitude},${sos.longitude}`, '_blank')}
                        >
                            <MapPin className="mr-2 h-4 w-4" />
                            Get Directions
                        </Button>
                    </CardContent>
                </Card>

                {/* Contact Information (visible after response) */}
                {response && (
                    <Card className="border-green-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-green-600" />
                                Patient Contact Information
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
                                    <a href={`tel:${sos.contactPhone}`} className="font-medium text-primary hover:underline">
                                        {sos.contactPhone}
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

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

                {/* Response Form */}
                {!response && sos.status === 'active' && (
                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600">Respond to This Emergency</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="message">Message to Patient (Optional)</Label>
                                <Textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Let the patient know when you can donate..."
                                    rows={3}
                                />
                            </div>
                            <Button
                                onClick={handleRespond}
                                disabled={responding}
                                className="w-full bg-red-600 hover:bg-red-700"
                            >
                                {responding ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending Response...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        I Can Help - Send Response
                                    </>
                                )}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                By responding, the patient will be able to contact you at your registered phone number
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
