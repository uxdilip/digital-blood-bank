'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProfilePhotoUpload, BloodGroupSelect, AddressInput } from '@/components/profile';
import { updateUserProfile, getDonorProfile, getBloodBankProfile, updateDonorProfile, createDonorProfile, updateBloodBankProfile, createBloodBankProfile } from '@/lib/services/profile';
import { toast } from 'sonner';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfileEditPage() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Basic profile fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profilePhoto: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        latitude: 0,
        longitude: 0,
        emergencyContact: '',
        emergencyContactName: ''
    });

    // Donor-specific fields
    const [donorData, setDonorData] = useState({
        bloodGroup: '',
        weight: '',
        age: ''
    });

    // Blood bank-specific fields
    const [bloodBankData, setBloodBankData] = useState({
        organizationName: '',
        licenseNumber: '',
        operatingHours: '',
        contactPerson: '',
        contactPersonPhone: '',
        website: ''
    });

    const [donorProfile, setDonorProfile] = useState<any>(null);
    const [bloodBankProfile, setBloodBankProfile] = useState<any>(null);

    useEffect(() => {
        if (user) {
            loadProfileData();
        }
    }, [user]);

    async function loadProfileData() {
        if (!user) return;

        setLoading(true);
        try {
            // Load basic user data
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                profilePhoto: user.profilePhoto || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                pincode: user.pincode || '',
                latitude: user.latitude || 0,
                longitude: user.longitude || 0,
                emergencyContact: user.emergencyContact || '',
                emergencyContactName: user.emergencyContactName || ''
            });

            // Load role-specific data
            if (user.role === 'donor') {
                const profile = await getDonorProfile(user.$id);
                setDonorProfile(profile);
                if (profile) {
                    setDonorData({
                        bloodGroup: profile.bloodGroup || '',
                        weight: profile.weight?.toString() || '',
                        age: profile.age?.toString() || ''
                    });
                }
            } else if (user.role === 'blood_bank') {
                const profile = await getBloodBankProfile(user.$id);
                setBloodBankProfile(profile);
                if (profile) {
                    setBloodBankData({
                        organizationName: profile.organizationName || '',
                        licenseNumber: profile.licenseNumber || '',
                        operatingHours: profile.operatingHours || '',
                        contactPerson: profile.contactPerson || '',
                        contactPersonPhone: profile.contactPersonPhone || '',
                        website: profile.website || ''
                    });
                }
            }
        } catch (error: any) {
            toast.error('Failed to load profile data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        try {
            // Update basic profile
            await updateUserProfile(user.$id, {
                name: formData.name,
                phone: formData.phone,
                profilePhoto: formData.profilePhoto,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                latitude: formData.latitude,
                longitude: formData.longitude,
                emergencyContact: formData.emergencyContact,
                emergencyContactName: formData.emergencyContactName
            });

            // Update or create role-specific profile
            if (user.role === 'donor') {
                const donorUpdateData = {
                    bloodGroup: donorData.bloodGroup,
                    weight: donorData.weight ? parseInt(donorData.weight) : null,
                    age: donorData.age ? parseInt(donorData.age) : null,
                    medicallyEligible: donorData.weight && donorData.age
                        ? parseInt(donorData.weight) >= 50 && parseInt(donorData.age) >= 18 && parseInt(donorData.age) <= 65
                        : false
                };

                if (donorProfile) {
                    await updateDonorProfile(donorProfile.$id, donorUpdateData);
                } else {
                    await createDonorProfile(user.$id, donorUpdateData);
                }
            } else if (user.role === 'blood_bank') {
                const bloodBankUpdateData = {
                    organizationName: bloodBankData.organizationName,
                    licenseNumber: bloodBankData.licenseNumber,
                    operatingHours: bloodBankData.operatingHours,
                    contactPerson: bloodBankData.contactPerson,
                    contactPersonPhone: bloodBankData.contactPersonPhone,
                    website: bloodBankData.website
                };

                if (bloodBankProfile) {
                    await updateBloodBankProfile(bloodBankProfile.$id, bloodBankUpdateData);
                } else {
                    await createBloodBankProfile(user.$id, bloodBankUpdateData);
                }
            }

            await refreshUser();
            toast.success('Profile updated successfully!');
            router.push('/dashboard/profile/view');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Edit Profile</h1>
                    <p className="text-muted-foreground">Update your personal information and settings</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/dashboard/${user.role}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
                    <CardDescription>Upload a profile picture to personalize your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfilePhotoUpload
                        currentPhotoId={formData.profilePhoto}
                        userName={formData.name}
                        onPhotoUpdate={(photoId) => setFormData({ ...formData, profilePhoto: photoId || '' })}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Address & Location</CardTitle>
                    <CardDescription>Help others find you for blood donation needs</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddressInput
                        address={formData.address}
                        city={formData.city}
                        state={formData.state}
                        pincode={formData.pincode}
                        onAddressChange={(field, value) => setFormData({ ...formData, [field]: value })}
                        onCoordinatesUpdate={(latitude, longitude) => {
                            setFormData({ ...formData, latitude, longitude });
                        }}
                    />
                    {formData.latitude !== 0 && formData.longitude !== 0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-800">
                                ✓ Location set: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                    <CardDescription>Someone we can reach in case of emergency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContactName">Contact Name</Label>
                            <Input
                                id="emergencyContactName"
                                value={formData.emergencyContactName}
                                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                placeholder="Name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergencyContact">Contact Phone</Label>
                            <Input
                                id="emergencyContact"
                                value={formData.emergencyContact}
                                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                placeholder="Phone number"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {user.role === 'donor' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Donor Information</CardTitle>
                        <CardDescription>Essential details for blood donation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <BloodGroupSelect
                            value={donorData.bloodGroup}
                            onChange={(value) => setDonorData({ ...donorData, bloodGroup: value })}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={donorData.weight}
                                    onChange={(e) => setDonorData({ ...donorData, weight: e.target.value })}
                                    placeholder="Min 50 kg"
                                />
                                <p className="text-xs text-muted-foreground">Minimum 50 kg to donate</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={donorData.age}
                                    onChange={(e) => setDonorData({ ...donorData, age: e.target.value })}
                                    placeholder="18-65"
                                />
                                <p className="text-xs text-muted-foreground">Must be 18-65 years old</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {user.role === 'blood_bank' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Blood Bank Information</CardTitle>
                        <CardDescription>Organization details and operational information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="organizationName">Organization Name</Label>
                            <Input
                                id="organizationName"
                                value={bloodBankData.organizationName}
                                onChange={(e) => setBloodBankData({ ...bloodBankData, organizationName: e.target.value })}
                                placeholder="Blood Bank / Hospital Name"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="licenseNumber">License Number</Label>
                                <Input
                                    id="licenseNumber"
                                    value={bloodBankData.licenseNumber}
                                    onChange={(e) => setBloodBankData({ ...bloodBankData, licenseNumber: e.target.value })}
                                    placeholder="License/Registration Number"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="operatingHours">Operating Hours</Label>
                                <Input
                                    id="operatingHours"
                                    value={bloodBankData.operatingHours}
                                    onChange={(e) => setBloodBankData({ ...bloodBankData, operatingHours: e.target.value })}
                                    placeholder="e.g., Mon-Sat 9AM-6PM"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">Contact Person</Label>
                                <Input
                                    id="contactPerson"
                                    value={bloodBankData.contactPerson}
                                    onChange={(e) => setBloodBankData({ ...bloodBankData, contactPerson: e.target.value })}
                                    placeholder="Primary contact name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactPersonPhone">Contact Person Phone</Label>
                                <Input
                                    id="contactPersonPhone"
                                    value={bloodBankData.contactPersonPhone}
                                    onChange={(e) => setBloodBankData({ ...bloodBankData, contactPersonPhone: e.target.value })}
                                    placeholder="Contact phone number"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website (Optional)</Label>
                            <Input
                                id="website"
                                type="url"
                                value={bloodBankData.website}
                                onChange={(e) => setBloodBankData({ ...bloodBankData, website: e.target.value })}
                                placeholder="https://example.com"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
