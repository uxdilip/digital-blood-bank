'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BloodGroupSelect } from '@/components/profile';
import { AlertCircle, Loader2, MapPin, Phone, User } from 'lucide-react';
import { createSOSRequest, UrgencyLevel } from '@/lib/services/sos';
import { geocodeAddress } from '@/lib/services/location';
import { toast } from 'sonner';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function CreateSOSPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);

    // Form state
    const [bloodGroup, setBloodGroup] = useState('');
    const [unitsNeeded, setUnitsNeeded] = useState('1');
    const [urgency, setUrgency] = useState<UrgencyLevel>('Urgent');
    const [hospitalName, setHospitalName] = useState('');
    const [hospitalAddress, setHospitalAddress] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [medicalNotes, setMedicalNotes] = useState('');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (!authLoading && user?.role !== 'patient') {
            router.push('/dashboard');
        } else if (user) {
            // Pre-fill contact info from user profile
            setContactPerson(user.name || '');
            setContactPhone(user.phone || '');
        }
    }, [user, authLoading, router]);

    const handleGeocode = async () => {
        if (!hospitalAddress) {
            toast.error('Please enter hospital address');
            return;
        }

        setGeocoding(true);
        try {
            const result = await geocodeAddress(hospitalAddress);
            if (result) {
                setCoordinates({ lat: result.latitude, lng: result.longitude });
                toast.success('Location found successfully!');
            } else {
                toast.error('Could not find location. Please check the address.');
            }
        } catch (error) {
            toast.error('Failed to geocode address');
        } finally {
            setGeocoding(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        // Validation
        if (!bloodGroup) {
            toast.error('Please select blood group');
            return;
        }

        if (!coordinates) {
            toast.error('Please geocode the hospital address');
            return;
        }

        const units = parseInt(unitsNeeded);
        if (isNaN(units) || units < 1 || units > 10) {
            toast.error('Units needed must be between 1 and 10');
            return;
        }

        if (!hospitalName.trim()) {
            toast.error('Please enter hospital name');
            return;
        }

        if (!contactPerson.trim() || !contactPhone.trim()) {
            toast.error('Please enter contact person and phone');
            return;
        }

        setLoading(true);
        try {
            const sosRequest = await createSOSRequest({
                patientId: user.$id,
                bloodGroup,
                unitsNeeded: units,
                urgency,
                hospitalName: hospitalName.trim(),
                hospitalAddress: hospitalAddress.trim(),
                latitude: coordinates.lat,
                longitude: coordinates.lng,
                contactPerson: contactPerson.trim(),
                contactPhone: contactPhone.trim(),
                medicalNotes: medicalNotes.trim()
            });

            toast.success('SOS Request created successfully!');
            router.push(`/dashboard/patient/sos/${sosRequest.$id}`);
        } catch (error: any) {
            console.error('Create SOS error:', error);
            toast.error(error.message || 'Failed to create SOS request');
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

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-red-600">Create Emergency SOS</h1>
                <p className="text-muted-foreground mt-1">
                    Send urgent blood request to nearby donors
                </p>
            </div>

            {/* Warning Alert */}
            <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                    <strong>Emergency Request:</strong> This will notify all compatible donors within 25km.
                    Only create SOS for genuine emergencies. Maximum 3 active requests allowed per patient.
                </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Blood Requirement Details</CardTitle>
                        <CardDescription>
                            Provide information about the blood needed
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Blood Group */}
                        <div className="space-y-2">
                            <Label htmlFor="bloodGroup">Blood Group Required *</Label>
                            <Select value={bloodGroup} onValueChange={setBloodGroup}>
                                <SelectTrigger id="bloodGroup">
                                    <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BLOOD_GROUPS.map(group => (
                                        <SelectItem key={group} value={group}>
                                            {group}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Units Needed */}
                        <div className="space-y-2">
                            <Label htmlFor="units">Number of Units Needed *</Label>
                            <Input
                                id="units"
                                type="number"
                                min="1"
                                max="10"
                                value={unitsNeeded}
                                onChange={(e) => setUnitsNeeded(e.target.value)}
                                placeholder="Enter number of units (1-10)"
                            />
                        </div>

                        {/* Urgency Level */}
                        <div className="space-y-2">
                            <Label htmlFor="urgency">Urgency Level *</Label>
                            <Select value={urgency} onValueChange={(val) => setUrgency(val as UrgencyLevel)}>
                                <SelectTrigger id="urgency">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Critical">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                            Critical - Life threatening
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="Urgent">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                                            Urgent - Needed soon
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="Normal">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                            Normal - Planned
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Hospital Details */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Hospital Details</CardTitle>
                        <CardDescription>
                            Where should donors come to donate?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="hospitalName">Hospital Name *</Label>
                            <Input
                                id="hospitalName"
                                value={hospitalName}
                                onChange={(e) => setHospitalName(e.target.value)}
                                placeholder="Enter hospital name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hospitalAddress">Hospital Address *</Label>
                            <Textarea
                                id="hospitalAddress"
                                value={hospitalAddress}
                                onChange={(e) => setHospitalAddress(e.target.value)}
                                placeholder="Enter full hospital address"
                                rows={3}
                            />
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGeocode}
                            disabled={geocoding || !hospitalAddress}
                            className="w-full"
                        >
                            {geocoding ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Finding Location...
                                </>
                            ) : (
                                <>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Get Hospital Location
                                </>
                            )}
                        </Button>

                        {coordinates && (
                            <Alert className="border-green-200 bg-green-50">
                                <AlertDescription className="text-green-800">
                                    ✓ Location found: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>
                            How can donors reach you?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactPerson">Contact Person Name *</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="contactPerson"
                                    value={contactPerson}
                                    onChange={(e) => setContactPerson(e.target.value)}
                                    placeholder="Enter contact person name"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Contact Phone Number *</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="contactPhone"
                                    type="tel"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    placeholder="Enter phone number"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="medicalNotes">Additional Medical Notes (Optional)</Label>
                            <Textarea
                                id="medicalNotes"
                                value={medicalNotes}
                                onChange={(e) => setMedicalNotes(e.target.value)}
                                placeholder="Any specific medical requirements or instructions..."
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="mt-6 flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !coordinates}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating SOS...
                            </>
                        ) : (
                            'Create Emergency SOS'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
