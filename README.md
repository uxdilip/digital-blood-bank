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
- 🚨 Create emergency SOS broadcasts to nearby donors
- 🔍 Search blood bank inventory by location
- 📅 View nearby blood banks on interactive maps
- 📊 Track SOS request status and responses

### For Donors
- 🔔 Receive real-time SOS notifications for matching blood type
- ✅ Auto-calculated eligibility (56-day donation interval)
- 📍 Location-based request filtering
- 📅 Schedule donation appointments
- 📈 Track donation history

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
cd minor_project
npm install
```

### Step 2: Setup Appwrite

1. **Create Appwrite Project**
   - Go to [Appwrite Cloud Console](https://cloud.appwrite.io)
   - Create a new project
   - Copy the Project ID

2. **Setup Database Collections**
   - Follow the detailed guide in `APPWRITE_SETUP.md`
   - Create all 6 collections (Users, Donors, BloodBanks, Inventory, SOS, Appointments)
   - Create storage bucket for documents

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Appwrite credentials:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here

NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_users_collection_id
NEXT_PUBLIC_APPWRITE_DONORS_COLLECTION_ID=your_donors_collection_id
NEXT_PUBLIC_APPWRITE_BLOOD_BANKS_COLLECTION_ID=your_blood_banks_collection_id
NEXT_PUBLIC_APPWRITE_INVENTORY_COLLECTION_ID=your_inventory_collection_id
NEXT_PUBLIC_APPWRITE_SOS_REQUESTS_COLLECTION_ID=your_sos_collection_id
NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID=your_appointments_collection_id

NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=your_bucket_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
blood-donation-app/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # Protected dashboards
│   │   ├── patient/         # Patient dashboard
│   │   ├── donor/           # Donor dashboard
│   │   ├── blood-bank/      # Blood bank dashboard
│   │   └── admin/           # Admin dashboard
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   └── ui/                  # Shadcn UI components
├── hooks/
│   └── use-auth.tsx         # Authentication hook
├── lib/
│   ├── appwrite/            # Appwrite configuration
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   └── env.ts
│   ├── constants.ts         # App constants
│   └── utils.ts             # Utility functions
├── types/
│   └── index.ts             # TypeScript types
├── middleware.ts            # Route protection
├── .env.local               # Environment variables (create this)
├── .env.example             # Environment template
├── APPWRITE_SETUP.md        # Appwrite setup guide
└── README.md                # This file
```

## 🔐 User Roles

1. **Patient/Requester** - Create SOS requests, search inventory
2. **Donor** - Respond to SOS, schedule donations
3. **Blood Bank** - Manage inventory, accept appointments
4. **Admin** - Verify users, platform oversight

## 🎨 Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **Lucide React** - Icons

### Backend
- **Appwrite** - BaaS (Backend as a Service)
  - Authentication
  - Database (NoSQL)
  - Real-time subscriptions
  - Storage
  - Serverless functions

### Deployment
- **Vercel** - Next.js hosting (free tier)

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

## 📝 Development Phases

**Phase 1: Foundation** ✅ COMPLETED
- [x] Project setup with Next.js & TypeScript
- [x] Appwrite integration
- [x] Authentication system (login/register)
- [x] Role-based routing
- [x] Basic dashboard layouts
- [x] Database schema documentation

**Phase 2: User Profiles** (Next)
- [ ] Donor profile with blood group
- [ ] Blood bank profile with license
- [ ] Location services integration
- [ ] Document upload for verification

**Phase 3: Inventory Management**
- [ ] Blood bank inventory CRUD
- [ ] Public inventory search
- [ ] Map integration with Leaflet

**Phase 4: SOS Emergency System**
- [ ] SOS request creation
- [ ] Real-time broadcasting
- [ ] Donor notifications
- [ ] Response tracking

**Phase 5: Appointments**
- [ ] Calendar/slot management
- [ ] Booking system
- [ ] Appointment confirmations

**Phase 6: Admin Dashboard**
- [ ] Verification workflows
- [ ] User moderation
- [ ] Analytics

**Phase 7: Notifications**
- [ ] In-app notifications
- [ ] Push notifications (PWA)
- [ ] Email notifications

**Phase 8: Production**
- [ ] Testing & optimization
- [ ] Documentation
- [ ] Deployment

## 🆘 Support

- **Appwrite Documentation**: https://appwrite.io/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Shadcn/ui Documentation**: https://ui.shadcn.com

## 🎯 Current Status

**Phase 1 COMPLETED** ✅

The foundation is ready with:
- Authentication system working
- Role-based dashboards created
- Database schema documented
- Project structure established

**Next Steps:**
- Setup your Appwrite database (follow APPWRITE_SETUP.md)
- Test user registration and login
- Proceed to Phase 2: User Profiles

---

**Made with ❤️ for saving lives through blood donation**
