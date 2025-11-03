import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Droplet, MapPin, Bell } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex justify-center">
            <Droplet className="h-16 w-16 text-red-600" />
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            Blood Donation Platform
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect patients and hospitals with nearby verified blood donors and blood banks.
            Save lives with one-tap emergency SOS broadcasts.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Emergency SOS</h3>
            <p className="text-gray-600">
              Broadcast urgent blood requests to nearby eligible donors instantly. Get responses in real-time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Location-Based Search</h3>
            <p className="text-gray-600">
              Find blood banks and donors near you. View inventory in real-time with interactive maps.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Appointment Scheduling</h3>
            <p className="text-gray-600">
              Schedule blood donation appointments with verified blood banks. Track your donation history.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-12">Join Our Community</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-red-600">1000+</div>
              <div className="text-gray-600 mt-2">Registered Donors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600">50+</div>
              <div className="text-gray-600 mt-2">Blood Banks</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600">500+</div>
              <div className="text-gray-600 mt-2">Lives Saved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
