# Claude Code Configuration

AVR Lodge v2 - Resort management system built with React + TypeScript + Vite, Firebase (auth/database), and Supabase (storage).

## Project Setup
- **Working Directory**: D:\personal\projects\resorts\repo\avrlodge_v2
- **Main Branch**: main
- **Current Branch**: issue-fix

## Commands
- **Development**: `npm run dev`
- **Build**: `npm run build` / `npm run build-with-types`
- **Lint**: `npm run lint`
- **Data Import**: `npm run import-room-types` / `npm run import-rooms` / `npm run import-special-charges`

## Firebase Configuration
- **Project ID**: avrlodgev2
- **Plan**: Spark (Free) - No Cloud Functions
- **Auth**: Email/Password + Google OAuth
- **Database**: Firestore (asia-east1)
- **Storage**: Supabase Storage for documents

### Environment Variables
```
VITE_FIREBASE_API_KEY="AIzaSyDZxKLNEHICeyOoIwiJdAVf6ULMbW-Kq_c"
VITE_FIREBASE_AUTH_DOMAIN="avrlodgev2.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="avrlodgev2"
VITE_FIREBASE_STORAGE_BUCKET="avrlodgev2.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="423109120986"
VITE_FIREBASE_APP_ID="1:423109120986:web:69500d1e043f9cc170e6e3"
VITE_FIREBASE_MEASUREMENT_ID="G-HSKHTM1097"
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Core Collections
### Users (`/users/{uid}`)
- `role: 'guest' | 'manager' | 'admin'`
- Standard fields: displayName, email, photoURL, timestamps

### Room Types (`/roomTypes/{id}`)
- `name`, `pricePerNight`, `maxGuests`, `numberOfRooms`
- `amenities: string[]`, `isActive: boolean`

### Rooms (`/rooms/{id}`)
- `roomNumber`, `roomTypeId`, `floorNumber`
- `status: 'available' | 'occupied' | 'maintenance' | 'reserved'`

### Reservations (`/reservations/{id}`)
- `referenceNumber` (MMYYYY-XXX format)
- Guest info: `guestName`, `guestEmail`, `guestPhone`
- Dates: `checkInDate`, `checkOutDate`
- Status: `'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'`

### Payments (`/payments/{id}`)
- `reservationId`, `amount`, `paymentMethod`
- `receiptNumber` (PAY-MMYYYY-XXXXX format)
- Payment methods: "Jubair QR", "Basha QR", "Cash"

### Room Check-in Documents (`/roomCheckinDocuments/{id}`)
- `documentType: 'aadhar' | 'driving_license' | 'voter_id' | 'passport' | 'pan_card' | 'other'`
- `fileUrl` (Supabase Storage), `fileName`, soft delete support

## Supabase Storage
- **Bucket**: `room-documents`
- **Max File Size**: 5MB
- **Allowed Types**: JPG, PNG, PDF
- **Structure**: `reservations/{reservationId}/{roomId}/filename.ext`

## Role-Based Access
- **Guest**: Public pages only (redirected to `/`)
- **Manager**: `/manager/*` routes (dashboard, calendar, reservations, bookings)
- **Admin**: Full access including `/admin/*` routes + user management

## Authentication Routes
- `/auth/login`, `/auth/signup`, `/auth/forgot-password`
- Auto-redirect based on role for authenticated users

## Key Components
- **Layouts**: `AdminLayout`, `ManagerLayout`, `HomeLayout`, `RootLayout`
- **Context**: `AuthContext` (auth/role), `BookingsContext` (booking state)
- **Booking System**: `FirebaseBookingCard`, `FirebasePaymentModal`, modals for check-in/out

## Development Notes
- Use `useAuth()` hook for authentication
- Firestore operations via `useFirestore` hooks
- Role management via Firestore (no Custom Claims due to Spark plan)
- Real-time subscriptions for live updates
- Client-side soft delete filtering for documents
- Black & white design aesthetic with Framer Motion animations

## Business Logic
- **Payment Status**: `reservation` → `booking` (when paid) → `checked_in` → `checked_out`
- **Reference Numbers**: Auto-generated with monthly counters
- **Document Requirements**: Must upload during check-in
- **Room Status**: Real-time updates with conflict prevention