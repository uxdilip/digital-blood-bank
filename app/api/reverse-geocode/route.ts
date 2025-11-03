import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const lat = searchParams.get('lat');
        const lon = searchParams.get('lon');

        if (!lat || !lon) {
            return NextResponse.json(
                { error: 'Latitude and longitude parameters are required' },
                { status: 400 }
            );
        }

        // Call Nominatim reverse geocoding API from server side
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            {
                headers: {
                    'User-Agent': 'BloodDonationApp/1.0', // Nominatim requires User-Agent
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Reverse geocoding failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || data.error) {
            return NextResponse.json(
                { error: 'Location not found' },
                { status: 404 }
            );
        }

        const address = data.address || {};
        return NextResponse.json({
            street: address.road || address.suburb || '',
            city: address.city || address.town || address.village || '',
            state: address.state || '',
            pincode: address.postcode || '',
            displayName: data.display_name,
        });
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return NextResponse.json(
            { error: 'Failed to reverse geocode coordinates' },
            { status: 500 }
        );
    }
}
