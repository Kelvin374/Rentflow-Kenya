# RentFlow Kenya 🏠

A production-ready property management platform for the Kenyan market. Built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## Features

- **Role-based Dashboard**: Landlord, Property Manager, Caretaker, Tenant, Admin
- **Property Management**: Add properties, units, track occupancy
- **Tenant Management**: Profiles, leases, emergency contacts
- **Rent Collection**: M-Pesa integration, automated reminders, receipts
- **Maintenance Tracking**: Submit, assign, track repair progress
- **Financial Reports**: Revenue, expenses, occupancy analytics
- **Digital Leases**: Create, sign, manage lease agreements
- **M-Pesa Integration**: Daraja API STK Push for payments

## Tech Stack

| Layer      | Technology                 |
| ---------- | -------------------------- |
| Frontend   | Next.js 16, React 19       |
| Styling    | Tailwind CSS 4             |
| Icons      | Lucide React               |
| Backend    | Express.js (optional)      |
| Database   | Supabase (PostgreSQL)      |
| Auth       | Supabase Auth              |
| Storage    | Supabase Storage           |
| Payments   | M-Pesa Daraja API          |

## Quick Start

### 1. Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project ([supabase.com](https://supabase.com))

### 2. Supabase Setup

1. Create a Supabase project
2. Run the migration SQL from `supabase/migrations/00001_initial_schema.sql` in the Supabase SQL editor
3. Get your project URL and API keys from **Settings > API**

### 3. Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 4. Install & Run

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Seed the database
cd backend && npm run seed

# Start backend (terminal 1)
cd backend && npm run dev

# Start frontend (terminal 2)
npm run dev
```

Visit **http://localhost:3000**

### Default Credentials

| Role      | Email                     | Password      |
| --------- | ------------------------- | ------------- |
| Landlord  | admin@rentflow.co.ke      | Landlord123!  |
| Manager   | manager@rentflow.co.ke    | Manager123!   |
| Tenant    | elizabeth.o@gmail.com     | Tenant123!    |
| Tenant    | kevin@example.com         | Tenant123!    |

## Project Structure

```
rentflow/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── dashboard/         # Landlord dashboard
│   │   ├── properties/        # Property management
│   │   ├── tenants/           # Tenant management
│   │   ├── payments/          # Payment tracking
│   │   ├── maintenance/       # Maintenance board
│   │   ├── reports/           # Financial reports
│   │   └── tenant/            # Tenant portal
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utilities, auth, API
│   └── types/                 # TypeScript types
├── backend/
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth middleware
│   │   ├── utils/             # Supabase client
│   │   └── index.ts           # Express server
│   └── package.json
├── supabase/
│   └── migrations/            # SQL migrations
└── scripts/                   # Setup utilities
```

## M-Pesa Integration

Configure M-Pesa in `backend/.env`:

```env
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=174379
```

The app runs in demo mode if M-Pesa isn't configured.

## API Endpoints

| Method | Endpoint                 | Description                |
| ------ | ------------------------ | -------------------------- |
| POST   | /api/auth/register       | Register user              |
| POST   | /api/auth/login          | Login                      |
| GET    | /api/properties          | List properties            |
| POST   | /api/properties          | Create property            |
| GET    | /api/tenants             | List tenants               |
| POST   | /api/tenants             | Add tenant                 |
| GET    | /api/payments            | List payments              |
| POST   | /api/payments            | Record payment             |
| GET    | /api/maintenance         | List maintenance requests  |
| POST   | /api/maintenance         | Create request             |
| POST   | /api/mpesa/stkpush       | Initiate M-Pesa payment    |

## License

MIT
