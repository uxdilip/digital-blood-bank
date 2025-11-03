'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getDonorProfile, getBloodBankProfile, getProfilePhotoUrl } from '@/lib/services/profile';
import { getDonationHistory, calculateDonorStats, checkDonorEligibility, formatEligibilityDate } from '@/lib/services/donor';
import {
    User, Mail, Phone, MapPin, Heart, Calendar, Activity, Building, Clock,
    Globe, FileText, Edit, Loader2, Shield, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ProfileViewPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [donorProfile, setDonorProfile] = useState<any>(null);
    const [bloodBankProfile, setBloodBankProfile] = useState<any>(null);
    const [donationHistory, setDonationHistory] = useState<any>(null);

    useEffect(() => {
        if (user) {
            loadProfileData();
        }
    }, [user]);

    async function loadProfileData() {
        if (!user) return;

        setLoading(true);
        try {
            if (user.role === 'donor') {
                const profile = await getDonorProfile(user.$id);
                setDonorProfile(profile);

                if (profile) {
                    const history = await getDonationHistory(profile.$id);
                    setDonationHistory(history);
                }
            } else if (user.role === 'blood_bank') {
                const profile = await getBloodBankProfile(user.$id);
                setBloodBankProfile(profile);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (!user) return null;

    const photoUrl = user.profilePhoto ? getProfilePhotoUrl(user.profilePhoto) : null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'donor': return 'bg-red-100 text-red-700';
            case 'blood_bank': return 'bg-blue-100 text-blue-700';
            case 'patient': return 'bg-green-100 text-green-700';
            case 'admin': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'donor': return 'Blood Donor';
            case 'blood_bank': return 'Blood Bank';
            case 'patient': return 'Patient';
            case 'admin': return 'Administrator';
            default: return role;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p className="text-muted-foreground">View your complete profile information</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/profile/edit">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Link>
                </Button>
            </div>

            {/* Profile Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                        <Avatar className="h-32 w-32">
                            {photoUrl ? (
                                <AvatarImage src={photoUrl} alt={user.name} />
                            ) : (
                                <AvatarFallback className="bg-red-100 text-red-600 text-3xl">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            )}
                        </Avatar>

                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div>
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <Badge className={getRoleBadgeColor(user.role)}>
                                    {getRoleLabel(user.role)}
                                </Badge>
                                {user.isVerified ? (
                                    <Badge className="bg-green-100 text-green-700">
                                        <Shield className="mr-1 h-3 w-3" />
                                        Verified
                                    </Badge>
                                ) : (
                                    <Badge className="bg-yellow-100 text-yellow-700">
                                        <AlertCircle className="mr-1 h-3 w-3" />
                                        Unverified
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {user.email}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    {user.phone || 'Not provided'}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Donor Stats Card */}
            {user.role === 'donor' && donorProfile && donationHistory && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Donations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">
                                {donationHistory.totalDonations}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {calculateDonorStats(donationHistory.totalDonations).livesSaved} lives saved
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Donor Level
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {calculateDonorStats(donationHistory.totalDonations).level}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {calculateDonorStats(donationHistory.totalDonations).donationsUntilNext} more to {calculateDonorStats(donationHistory.totalDonations).nextMilestone}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Eligibility Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${donationHistory.eligibility.isEligible ? 'text-green-600' : 'text-orange-600'}`}>
                                {donationHistory.eligibility.isEligible ? 'Eligible' : 'Not Eligible'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {donationHistory.eligibility.isEligible
                                    ? 'Ready to donate'
                                    : `Wait ${donationHistory.eligibility.daysRemaining} more days`}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Phone</p>
                                <p className="text-sm text-muted-foreground">{user.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {(user.address || user.city) && (
                        <>
                            <Separator />
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Address</p>
                                    <p className="text-sm text-muted-foreground">
                                        {user.address && `${user.address}, `}
                                        {user.city && `${user.city}, `}
                                        {user.state} {user.pincode}
                                    </p>
                                    {user.latitude && user.longitude && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            📍 Location: {user.latitude.toFixed(4)}, {user.longitude.toFixed(4)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {user.emergencyContactName && (
                        <>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium mb-2">Emergency Contact</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">{user.emergencyContactName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">{user.emergencyContact || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Donor Information */}
            {user.role === 'donor' && donorProfile && (
                <Card>
                    <CardHeader>
                        <CardTitle>Donor Information</CardTitle>
                        <CardDescription>Your blood donation details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3">
                                <Heart className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Blood Group</p>
                                    <p className="text-2xl font-bold text-red-600">{donorProfile.bloodGroup || 'Not set'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Weight</p>
                                    <p className="text-sm text-muted-foreground">{donorProfile.weight ? `${donorProfile.weight} kg` : 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Age</p>
                                    <p className="text-sm text-muted-foreground">{donorProfile.age ? `${donorProfile.age} years` : 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        {donationHistory && (
                            <>
                                <Separator />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Last Donation</p>
                                            <p className="text-sm text-muted-foreground">
                                                {donationHistory.lastDonationDate
                                                    ? new Date(donationHistory.lastDonationDate).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })
                                                    : 'Never donated'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Next Eligible Date</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatEligibilityDate(donationHistory.eligibility.nextEligibleDate)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />
                        <div className="flex items-center gap-2">
                            {donorProfile.isAvailable ? (
                                <Badge className="bg-green-100 text-green-700">Available to Donate</Badge>
                            ) : (
                                <Badge className="bg-gray-100 text-gray-700">Not Available</Badge>
                            )}
                            {donorProfile.medicallyEligible ? (
                                <Badge className="bg-blue-100 text-blue-700">Medically Eligible</Badge>
                            ) : (
                                <Badge className="bg-orange-100 text-orange-700">Check Eligibility</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Blood Bank Information */}
            {user.role === 'blood_bank' && bloodBankProfile && (
                <Card>
                    <CardHeader>
                        <CardTitle>Blood Bank Information</CardTitle>
                        <CardDescription>Organization and operational details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Organization Name</p>
                                    <p className="text-sm text-muted-foreground">{bloodBankProfile.organizationName || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">License Number</p>
                                    <p className="text-sm text-muted-foreground">{bloodBankProfile.licenseNumber || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Operating Hours</p>
                                    <p className="text-sm text-muted-foreground">{bloodBankProfile.operatingHours || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Contact Person</p>
                                    <p className="text-sm text-muted-foreground">{bloodBankProfile.contactPerson || 'Not provided'}</p>
                                    {bloodBankProfile.contactPersonPhone && (
                                        <p className="text-xs text-muted-foreground">{bloodBankProfile.contactPersonPhone}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {bloodBankProfile.website && (
                            <>
                                <Separator />
                                <div className="flex items-start gap-3">
                                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Website</p>
                                        <a
                                            href={bloodBankProfile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            {bloodBankProfile.website}
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />
                        <div>
                            {bloodBankProfile.isVerified ? (
                                <Badge className="bg-green-100 text-green-700">
                                    <Shield className="mr-1 h-3 w-3" />
                                    Verified Blood Bank
                                </Badge>
                            ) : (
                                <Badge className="bg-yellow-100 text-yellow-700">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    Pending Verification
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
