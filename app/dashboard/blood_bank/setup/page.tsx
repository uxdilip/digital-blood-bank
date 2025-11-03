'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getBloodBankProfile, updateBloodBankProfile, createBloodBankProfile } from '@/lib/services/profile';
import { toast } from 'sonner';
import { Loader2, Building, FileText, Clock, User, Phone, Globe, Save, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BloodBankSetupPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [bloodBankProfile, setBloodBankProfile] = useState<any>(null);

    const [formData, setFormData] = useState({
        organizationName: '',
        licenseNumber: '',
        operatingHours: '',
        contactPerson: '',
        contactPersonPhone: '',
        website: ''
    });

    useEffect(() => {
        if (user) {
            if (user.role !== 'blood_bank') {
                router.push(`/dashboard/${user.role}`);
                return;
            }
            loadBloodBankData();
        }
    }, [user]);

    async function loadBloodBankData() {
        if (!user) return;

        setLoading(true);
        try {
            const profile = await getBloodBankProfile(user.$id);
            if (profile) {
                setBloodBankProfile(profile);
                setFormData({
                    organizationName: profile.organizationName || '',
                    licenseNumber: profile.licenseNumber || '',
                    operatingHours: profile.operatingHours || '',
                    contactPerson: profile.contactPerson || '',
                    contactPersonPhone: profile.contactPersonPhone || '',
                    website: profile.website || ''
                });
            }
        } catch (error: any) {
            toast.error('Failed to load blood bank information');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        if (!user) return;

        // Validation
        if (!formData.organizationName || !formData.licenseNumber) {
            toast.error('Organization name and license number are required');
            return;
        }

        setSaving(true);
        try {
            if (bloodBankProfile) {
                await updateBloodBankProfile(bloodBankProfile.$id, formData);
                toast.success('Blood bank information updated successfully!');
            } else {
                await createBloodBankProfile(user.$id, formData);
                toast.success('Blood bank profile created successfully!');
            }

            await loadBloodBankData(); // Reload fresh data
        } catch (error: any) {
            toast.error(error.message || 'Failed to save information');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (!user) return null;

    const isProfileComplete = formData.organizationName && formData.licenseNumber && formData.operatingHours;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Blood Bank Setup</h1>
                    <p className="text-muted-foreground">Complete your organization's information</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/blood_bank">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            {/* Status Alert */}
            {!isProfileComplete ? (
                <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        <strong>Profile Incomplete:</strong> Complete your organization details to start receiving donation requests.
                    </AlertDescription>
                </Alert>
            ) : bloodBankProfile?.isVerified ? (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        <strong>Verified Blood Bank:</strong> Your organization is verified and can accept donations.
                    </AlertDescription>
                </Alert>
            ) : (
                <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        <strong>Pending Verification:</strong> Your profile is under review. You'll be notified once verified.
                    </AlertDescription>
                </Alert>
            )}

            {/* Organization Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>Basic information about your blood bank or hospital</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="organizationName">
                            Organization Name <span className="text-red-600">*</span>
                        </Label>
                        <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="organizationName"
                                value={formData.organizationName}
                                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                placeholder="e.g., City General Hospital Blood Bank"
                                className="pl-10"
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Official name of your blood bank or hospital
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="licenseNumber">
                            License/Registration Number <span className="text-red-600">*</span>
                        </Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                placeholder="e.g., BB/2024/12345"
                                className="pl-10"
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Government-issued license or registration number
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Operational Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Operational Information</CardTitle>
                    <CardDescription>When and how people can reach you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="operatingHours">
                            Operating Hours <span className="text-red-600">*</span>
                        </Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="operatingHours"
                                value={formData.operatingHours}
                                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                                placeholder="e.g., Mon-Sat 9:00 AM - 6:00 PM, Sun 10:00 AM - 2:00 PM"
                                className="pl-10"
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Your working days and hours
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactPerson">Contact Person</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                    placeholder="Name of primary contact"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactPersonPhone">Contact Person Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="contactPersonPhone"
                                    value={formData.contactPersonPhone}
                                    onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })}
                                    placeholder="Phone number"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="website"
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://example.com"
                                className="pl-10"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Your organization's website (if available)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Location Reminder */}
            {(!user.address || !user.latitude || !user.longitude) && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Don't forget:</strong> Add your address and location in your{' '}
                        <Link href="/dashboard/profile/edit" className="underline font-medium">
                            profile settings
                        </Link>
                        {' '}so patients can find you easily.
                    </AlertDescription>
                </Alert>
            )}

            {/* Verification Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                    <CardDescription>Get verified to build trust with donors</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <p className="font-medium">Organization Verification</p>
                            <p className="text-sm text-muted-foreground">
                                Verified blood banks get priority in search results
                            </p>
                        </div>
                        <Badge className={bloodBankProfile?.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {bloodBankProfile?.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                    </div>

                    {!bloodBankProfile?.isVerified && (
                        <p className="text-sm text-muted-foreground mt-4">
                            Admin will review your license and organization details. This typically takes 1-2 business days.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving || !formData.organizationName || !formData.licenseNumber}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Information
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
