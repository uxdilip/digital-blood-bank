'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getDonorProfile } from '@/lib/services/profile';
import { updateDonorAvailability, getDonationHistory, checkMedicalEligibility } from '@/lib/services/donor';
import { toast } from 'sonner';
import { Loader2, Heart, AlertCircle, CheckCircle, Calendar, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DonorAvailabilityPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [donorProfile, setDonorProfile] = useState<any>(null);
    const [donationHistory, setDonationHistory] = useState<any>(null);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        if (user) {
            if (user.role !== 'donor') {
                router.push(`/dashboard/${user.role}`);
                return;
            }
            loadDonorData();
        }
    }, [user]);

    async function loadDonorData() {
        if (!user) return;

        setLoading(true);
        try {
            const profile = await getDonorProfile(user.$id);
            if (profile) {
                setDonorProfile(profile);
                setIsAvailable(profile.isAvailable || false);

                const history = await getDonationHistory(profile.$id);
                setDonationHistory(history);
            }
        } catch (error: any) {
            toast.error('Failed to load donor information');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleAvailabilityToggle = async (newValue: boolean) => {
        if (!donorProfile) return;

        setUpdating(true);
        try {
            await updateDonorAvailability(donorProfile.$id, newValue);
            setIsAvailable(newValue);
            toast.success(newValue ? 'You are now available to donate!' : 'Availability status updated');
            await loadDonorData(); // Reload to get fresh data
        } catch (error: any) {
            toast.error(error.message || 'Failed to update availability');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (!user || !donorProfile) {
        return (
            <div className="max-w-3xl mx-auto">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please complete your donor profile first.{' '}
                        <Link href="/dashboard/profile/edit" className="underline font-medium">
                            Edit Profile
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const medicalEligibility = donorProfile.age && donorProfile.weight
        ? checkMedicalEligibility(donorProfile.age, donorProfile.weight)
        : { isEligible: false, reasons: ['Complete your profile with age and weight'] };

    const canDonate = donationHistory?.eligibility.isEligible && medicalEligibility.isEligible;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Donor Availability</h1>
                    <p className="text-muted-foreground">Manage your donation availability status</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/donor">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            {/* Availability Toggle Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Availability Status</CardTitle>
                    <CardDescription>
                        Let patients and blood banks know when you're available to donate
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label htmlFor="availability" className="text-base font-semibold">
                                I'm Available to Donate
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                You'll be visible in donor searches and SOS requests
                            </p>
                        </div>
                        <Switch
                            id="availability"
                            checked={isAvailable}
                            onCheckedChange={handleAvailabilityToggle}
                            disabled={updating || !canDonate}
                        />
                    </div>

                    {isAvailable ? (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                <strong>You're available!</strong> Thank you for being ready to save lives.
                                You'll receive notifications about nearby blood donation requests.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                You're currently marked as unavailable. Toggle the switch above when you're ready to donate.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Eligibility Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Eligibility Status</CardTitle>
                    <CardDescription>Your current eligibility to donate blood</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Time-based Eligibility */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Time Since Last Donation</span>
                            </div>
                            {donationHistory?.eligibility.isEligible ? (
                                <Badge className="bg-green-100 text-green-700">Eligible</Badge>
                            ) : (
                                <Badge className="bg-orange-100 text-orange-700">
                                    Wait {donationHistory?.eligibility.daysRemaining} days
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground ml-7">
                            {donationHistory?.eligibility.isEligible
                                ? 'You can donate blood now'
                                : `Next eligible: ${donationHistory?.eligibility.nextEligibleDate?.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}`}
                        </p>
                    </div>

                    {/* Medical Eligibility */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Medical Eligibility</span>
                            </div>
                            {medicalEligibility.isEligible ? (
                                <Badge className="bg-green-100 text-green-700">Eligible</Badge>
                            ) : (
                                <Badge className="bg-red-100 text-red-700">Check Requirements</Badge>
                            )}
                        </div>
                        {!medicalEligibility.isEligible && medicalEligibility.reasons.length > 0 && (
                            <ul className="text-sm text-muted-foreground ml-7 space-y-1">
                                {medicalEligibility.reasons.map((reason, index) => (
                                    <li key={index}>• {reason}</li>
                                ))}
                            </ul>
                        )}
                        {medicalEligibility.isEligible && (
                            <p className="text-sm text-muted-foreground ml-7">
                                You meet the basic medical requirements
                            </p>
                        )}
                    </div>

                    {!canDonate && (
                        <Alert className="bg-yellow-50 border-yellow-200">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                You cannot currently donate blood. Please address the eligibility requirements above.
                                {!donorProfile.bloodGroup && (
                                    <Link href="/dashboard/profile/edit" className="block mt-2 underline font-medium">
                                        Complete your profile →
                                    </Link>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Donation Statistics */}
            {donationHistory && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Donation Journey</CardTitle>
                        <CardDescription>Track your impact as a blood donor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                <p className="text-3xl font-bold text-red-600">{donationHistory.totalDonations}</p>
                                <p className="text-sm text-muted-foreground">Total Donations</p>
                            </div>

                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-blue-600">
                                    {donationHistory.totalDonations * 3}
                                </p>
                                <p className="text-sm text-muted-foreground">Lives Potentially Saved</p>
                            </div>

                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                <p className="text-xl font-bold text-purple-600">
                                    {donationHistory.lastDonationDate
                                        ? new Date(donationHistory.lastDonationDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            year: 'numeric'
                                        })
                                        : 'Never'}
                                </p>
                                <p className="text-sm text-muted-foreground">Last Donation</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Blood Group Info */}
            {donorProfile.bloodGroup && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Blood Type</CardTitle>
                        <CardDescription>Information about your blood group</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-3xl font-bold text-red-600">{donorProfile.bloodGroup}</span>
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Blood Group: {donorProfile.bloodGroup}</p>
                                <p className="text-sm text-muted-foreground">
                                    Thank you for being ready to donate {donorProfile.bloodGroup} blood.
                                    Your blood type is crucial for saving lives.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
