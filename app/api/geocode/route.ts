import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json(
                { error: 'Address parameter is required' },
                { status: 400 }
            );
        }

        // Call Nominatim API from server side (no CORS issues)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'BloodDonationApp/1.0', // Nominatim requires User-Agent
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: 'Location not found' },
                { status: 404 }
            );
        }

        const location = data[0];
        return NextResponse.json({
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
            displayName: location.display_name,
        });
    } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json(
            { error: 'Failed to geocode address' },
            { status: 500 }
        );
    }
}
