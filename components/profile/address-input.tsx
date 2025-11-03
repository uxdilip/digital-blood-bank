'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { geocodeAddress } from '@/lib/services/location';
import { toast } from 'sonner';

interface AddressInputProps {
    address: string;
    city: string;
    state: string;
    pincode: string;
    onAddressChange: (field: string, value: string) => void;
    onCoordinatesUpdate: (latitude: number, longitude: number) => void;
}

export function AddressInput({
    address,
    city,
    state,
    pincode,
    onAddressChange,
    onCoordinatesUpdate
}: AddressInputProps) {
    const [geocoding, setGeocoding] = useState(false);

    const handleGeocode = async () => {
        if (!address || !city || !state) {
            toast.error('Please enter address, city, and state first');
            return;
        }

        setGeocoding(true);
        try {
            const fullAddress = `${address}, ${city}, ${state} ${pincode}`;
            const coordinates = await geocodeAddress(fullAddress);

            if (coordinates) {
                onCoordinatesUpdate(coordinates.latitude, coordinates.longitude);
                toast.success('Location found successfully!');
            } else {
                toast.error('Could not find location. Please check the address.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to geocode address');
        } finally {
            setGeocoding(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                    id="address"
                    value={address}
                    onChange={(e) => onAddressChange('address', e.target.value)}
                    placeholder="Enter your street address"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        value={city}
                        onChange={(e) => onAddressChange('city', e.target.value)}
                        placeholder="City"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                        id="state"
                        value={state}
                        onChange={(e) => onAddressChange('state', e.target.value)}
                        placeholder="State"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                        id="pincode"
                        value={pincode}
                        onChange={(e) => onAddressChange('pincode', e.target.value)}
                        placeholder="Pincode"
                    />
                </div>

                <div className="flex items-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGeocode}
                        disabled={geocoding || !address || !city || !state}
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
                                Get Coordinates
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <p className="text-xs text-muted-foreground">
                Click "Get Coordinates" to find your location and enable proximity features
            </p>
        </div>
    );
}
