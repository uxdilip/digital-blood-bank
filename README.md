# 🩸 Blood Donation Platform

A real-time web application that connects patients and hospitals with nearby verified blood donors and registered blood banks. Features include inventory management, one-tap emergency SOS broadcasts, appointment scheduling, and an admin dashboard for verification and oversight.

## 🎯 Project Overview

**Built with 100% Free Tier Services:**
- ✅ Next.js 14+ (App Router)
- ✅ Appwrite Cloud (Free Tier)
- ✅ Vercel Hosting (Free Tier)
- ✅ Leaflet + OpenStreetMap (Free)
- ✅ Tailwind CSS + Shadcn/ui

## 🚀 Features

### For Patients/Requesters
- 🚨 **Create Emergency SOS Broadcasts** - Urgent blood requests to nearby donors
- � **Hospital Details** - Add hospital location with Google Maps geocoding
- 🎚️ **Urgency Levels** - Mark requests as Critical, Urgent, or Normal
- � **Track Responses** - View which donors responded "I Can Help"
- ✅ **Request Management** - Mark as fulfilled or cancel requests
- 🗂️ **Status Tabs** - Filter requests by Active/Fulfilled/Cancelled
- � **Dashboard Overview** - See recent SOS requests at a glance
- 📅 **Auto-Expiry** - Requests expire automatically after 24 hours
- 🚫 **Spam Prevention** - Maximum 3 active requests allowed

### For Donors
- 🔔 **Nearby Emergency Requests** - See compatible SOS requests within 10-100km radius
- ✅ **Blood Compatibility Matching** - Only see requests you can help with
- 📍 **Distance Calculation** - Know exactly how far the hospital is
- 💬 **"I Can Help" Response** - Respond to requests with optional messages
- 🩸 **Blood Group Display** - Your blood type prominently shown on dashboard
- � **Availability Toggle** - Set yourself as available/unavailable
- �️ **Interactive Maps** - Find nearby donors and patients on map
- ⏰ **Real-time Updates** - Dashboard refreshes with new requests automatically
- � **Profile Completion Alerts** - Clear guidance on missing profile information

### For Blood Banks
- 📦 Manage blood inventory (all blood types)
- 🏥 Accept and manage donation appointments
- ⏰ Set operating hours and availability
- 📊 Inventory analytics

### For Admins
- ✔️ Verify donors and blood banks
- 👥 User management and moderation
- 📊 Platform analytics and insights
- 🔍 Inventory oversight

## 📋 Prerequisites

- Node.js 18+ installed
- Appwrite Cloud account (free): https://cloud.appwrite.io
- Git

## 🛠️ Installation & Setup

### Step 1: Clone and Install

```bash
git clone https://github.com/uxdilip/digital-blood-bank.git
cd minor_project
npm install
```

### Step 2: Setup Appwrite Cloud

1. **Create Appwrite Project**
   - Go to [Appwrite Cloud Console](https://cloud.appwrite.io)
   - Create a new project
   - Copy the Project ID and API Key

2. **Create Database Collections**

   Run the automated setup scripts:
   ```bash
   # Create users, donors, patients, blood_banks collections
   node update-database-phase2.js
   
   # Create sos_requests and sos_responses collections
   node update-database-phase3.js
   ```

   Or create manually in Appwrite Console:
   - Database: `blood_donation_db`
   - Collections:
     - `users` - Main user information
     - `donors` - Donor-specific data
     - `patients` - Patient-specific data
     - `blood_banks` - Blood bank information
     - `sos_requests` - Emergency blood requests
     - `sos_responses` - Donor responses to SOS

3. **Configure Collection Permissions**
   
   For ALL collections, set:
   - **Document Security**: DISABLED
   - **Read**: Any (anyone can read)
   - **Create**: Users (authenticated users)
   - **Update**: Users (authenticated users)
   - **Delete**: Users (authenticated users)

4. **Create Storage Bucket**
   - Bucket ID: `profile-photos`
   - Permissions: Same as collections above

### Step 3: Configure Environment Variables

Create `.env.local` file in root directory:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Get Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps JavaScript API & Geocoding API
3. Create API key
4. Restrict to your domain (optional)

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📁 Project Structure

```
minor_project/
├── app/
│   ├── (auth)/                      # Authentication pages
│   │   ├── login/page.tsx           # Login page
│   │   └── register/page.tsx        # Registration with role selection
│   ├── dashboard/                   # Protected dashboards
│   │   ├── donor/
│   │   │   ├── page.tsx             # Donor dashboard with nearby SOS
│   │   │   ├── availability/        # Toggle availability status
│   │   │   └── sos/
│   │   │       ├── page.tsx         # SOS list with filters
│   │   │       └── [id]/page.tsx    # SOS details & response
│   │   ├── patient/
│   │   │   ├── page.tsx             # Patient dashboard
│   │   │   ├── find-donors/         # Map to find donors
│   │   │   └── sos/
│   │   │       ├── create/page.tsx  # Create SOS request
│   │   │       ├── my-requests/     # Manage requests (tabs)
│   │   │       └── [id]/page.tsx    # View responses
│   │   ├── blood-bank/page.tsx      # Blood bank dashboard
│   │   ├── profile/
│   │   │   ├── page.tsx             # View profile
│   │   │   └── edit/page.tsx        # Edit profile + photo upload
│   │   └── page.tsx                 # Dashboard router
│   ├── layout.tsx                   # Root layout with auth
│   ├── globals.css                  # Global styles
│   └── page.tsx                     # Landing page
├── components/
│   ├── ui/                          # Shadcn/ui components
│   ├── auth/                        # Auth-related components
│   ├── profile/                     # Profile components
│   │   ├── profile-photo-upload.tsx # Photo upload
│   │   ├── address-input.tsx        # Address with geocoding
│   │   └── blood-group-select.tsx   # Blood group selector
│   ├── donor/                       # Donor components
│   └── sos/                         # SOS components
│       ├── urgency-badge.tsx        # Urgency indicator
│       └── sos-card.tsx             # SOS request card
├── lib/
│   ├── appwrite/
│   │   ├── config.ts                # Appwrite client setup
│   │   └── env.ts                   # Environment & collection IDs
│   ├── services/                    # API services
│   │   ├── auth.ts                  # Authentication
│   │   ├── profile.ts               # Profile CRUD
│   │   ├── donor-availability.ts    # Availability management
│   │   ├── location.ts              # Geocoding & distance calc
│   │   ├── sos.ts                   # SOS request service
│   │   └── sos-response.ts          # Response service
│   └── utils.ts                     # Utility functions
├── hooks/
│   └── use-auth.tsx                 # Auth context hook
├── types/
│   └── index.ts                     # TypeScript definitions
├── middleware.ts                    # Route protection
├── .env.local                       # Environment variables (create this)
├── update-database-phase2.js        # DB setup script (Phase 2)
├── update-database-phase3.js        # DB setup script (Phase 3)
└── README.md                        # This file
```

## 🔐 User Roles

1. **Patient/Requester** - Create SOS requests, search inventory
2. **Donor** - Respond to SOS, schedule donations
3. **Blood Bank** - Manage inventory, accept appointments
4. **Admin** - Verify users, platform oversight

## 🎨 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful component library
- **Lucide React** - Icon library
- **date-fns** - Date formatting and manipulation

### Backend & Services
- **Appwrite Cloud** - Complete BaaS solution (Free Tier)
  - Authentication (email/password with sessions)
  - Database (NoSQL with queries and indexing)
  - Storage (file uploads for profile photos)
  - Real-time updates (WebSocket subscriptions)
- **Google Maps API** - Geocoding and location services
  - Maps JavaScript API
  - Geocoding API

### Key Libraries
```json
{
  "next": "15.0.3",
  "react": "^19.0.0-rc",
  "typescript": "^5",
  "appwrite": "^16.0.2",
  "tailwindcss": "^3.4.1",
  "date-fns": "^2.30.0",
  "@radix-ui/*": "latest",
  "lucide-react": "latest"
}
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

## 🧮 Key Algorithms & Features

### Blood Compatibility Matrix
The system uses a comprehensive compatibility matrix to match donors with patients:

```typescript
const BLOOD_COMPATIBILITY = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'] // Universal recipient
};
```

### Distance Calculation (Haversine Formula)
Accurate distance calculation between two geographic coordinates:

```typescript
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * 
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
```

### SOS Request Spam Prevention
- Maximum 3 active requests per patient
- Automatic expiry after 24 hours
- Status tracking: `active` → `fulfilled` or `cancelled`

### Donor Availability Auto-Expiry
- Availability expires after 7 days
- Automatic status updates
- Prevents stale data in search results

## 🐛 Troubleshooting

### Common Issues & Solutions

**Issue**: "Invalid query: Syntax error"
```
Error: AppwriteException: Invalid query: Syntax error
```
**Solution**: Update query syntax to use Appwrite SDK Query helpers:
```typescript
// ❌ Wrong (old syntax)
[`userId=${userId}`]

// ✅ Correct (new syntax)
[Query.equal('userId', userId)]
```

---

**Issue**: "401 Unauthorized" on SOS responses
```
Error: The current user is not authorized to perform the requested action
```
**Solution**: 
1. Go to Appwrite Console → Databases → your database
2. Select `sos_responses` collection
3. Click "Settings" tab
4. Ensure **"Document Security"** is **DISABLED** (unchecked)
5. Set permissions:
   - Read: `Any`
   - Create: `Users`
   - Update: `Users`
   - Delete: `Users`

---

**Issue**: Dashboard shows "Complete your profile" even after updating
```
Profile incomplete - missing blood group or location
```
**Solution**: Check that BOTH are set:
- Blood group is saved in the **donor** profile collection
- Location (latitude/longitude) is saved in the **users** collection
- Use the profile edit page to set both
- Verify data in Appwrite Console

---

**Issue**: "Attribute has invalid format" when creating SOS
```
Error: Attribute 'status' has invalid format
```
**Solution**: Ensure enum values are lowercase:
```typescript
// ❌ Wrong
status: 'Active'
urgency: 'Critical'

// ✅ Correct
status: 'active'
urgency: 'critical'
```

---

**Issue**: Google Maps not loading or geocoding not working
```
Error: Google Maps API key invalid
```
**Solution**:
1. Check `.env.local` has `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
2. Verify API key in Google Cloud Console
3. Enable required APIs:
   - Maps JavaScript API
   - Geocoding API
4. Check API key restrictions (if any)
5. Restart dev server after adding env variable

---

**Issue**: Profile photo upload fails
```
Error: Storage bucket not found
```
**Solution**:
1. Create bucket in Appwrite Console → Storage
2. Bucket ID: `profile-photos` (or update in code)
3. Set bucket permissions (same as collections)
4. Update bucket ID in `lib/appwrite/env.ts` if different

---

**Issue**: No nearby donors showing on map
```
Map shows but no markers appear
```
**Solution**:
- Ensure donors have:
  1. Completed profile (blood group set)
  2. Location set (latitude/longitude in user table)
  3. Availability status set to "available"
- Check if radius is large enough (try 100km)
- Verify blood type compatibility
- Check browser console for errors

## 📝 Development Phases

**Phase 1: Foundation** ✅ COMPLETED
- [x] Project setup with Next.js 15 & TypeScript
- [x] Appwrite Cloud integration
- [x] Authentication system (login/register)
- [x] Role-based routing with middleware
- [x] Basic dashboard layouts
- [x] Database schema implementation

**Phase 2: User Profiles & Availability** ✅ COMPLETED
- [x] Donor profile with blood group, weight, age
- [x] Patient profile with medical history
- [x] Blood bank profile with license & services
- [x] Location services integration (Google Maps)
- [x] Profile photo upload with Appwrite Storage
- [x] Address geocoding for accurate coordinates
- [x] Donor availability system with auto-expiry
- [x] Interactive map to find nearby donors
- [x] Blood compatibility matrix matching
- [x] Radius-based filtering (10-100km)

**Phase 3: SOS Emergency Blood Request System** ✅ COMPLETED
- [x] Emergency SOS request creation form
- [x] Blood group, units needed, urgency levels
- [x] Hospital details with geocoding
- [x] Real-time dashboard updates (patient & donor)
- [x] Proximity-based matching with distance calculation
- [x] Blood compatibility filtering
- [x] Donor response system ("I Can Help")
- [x] Response tracking with messages
- [x] Request management (view responses, mark fulfilled, cancel)
- [x] Status tabs (Active/Fulfilled/Cancelled)
- [x] Spam prevention (max 3 active requests)
- [x] Auto-expiry after 24 hours
- [x] Hospital location with map integration
- [x] Contact information access after response

**Phase 4: Inventory Management** (Next)
- [ ] Blood bank inventory CRUD
- [ ] Public inventory search
- [ ] Stock level monitoring
- [ ] Expiry date tracking

**Phase 5: Appointments** (Future)
- [ ] Calendar/slot management
- [ ] Booking system
- [ ] Appointment confirmations
- [ ] Donation history tracking

**Phase 6: Admin Dashboard** (Future)
- [ ] Verification workflows
- [ ] User moderation
- [ ] Analytics & reports

**Phase 7: Notifications** (Future)
- [ ] In-app notifications
- [ ] Push notifications (PWA)
- [ ] Email notifications
- [ ] SMS alerts for urgent requests

**Phase 8: Production** (Future)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment

## 🆘 Support

- **Appwrite Documentation**: https://appwrite.io/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Shadcn/ui Documentation**: https://ui.shadcn.com

## 🎯 Current Status

**Phases 1-3 COMPLETED** ✅

The application is now fully functional with:
- ✅ Complete authentication system
- ✅ Role-based dashboards (Donor, Patient, Blood Bank)
- ✅ User profiles with photo upload
- ✅ Location services and geocoding
- ✅ Donor availability management
- ✅ Interactive map to find nearby donors
- ✅ Blood compatibility matching
- ✅ **SOS Emergency Blood Request System**
  - Emergency request creation
  - Real-time dashboard updates
  - Proximity-based donor matching
  - Donor response tracking
  - Request fulfillment workflow
  - Spam prevention & auto-expiry

**Live Features:**
- Patients can create emergency SOS requests with hospital details
- Donors see nearby compatible requests on their dashboard
- Distance calculation with Haversine formula
- Urgency levels (Critical/Urgent/Normal) with visual indicators
- Response system with optional messages
- Full request lifecycle management

**Next Steps:**
- Phase 4: Blood Bank Inventory Management
- Add real-time notifications
- Implement appointment scheduling

---

**Made with ❤️ for saving lives through blood donation**
