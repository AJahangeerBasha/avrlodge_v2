# Claude Code Configuration

This file contains project-specific information for Claude Code to better understand and work with this codebase.

## Project Overview
- **Name**: AVR Lodge v2
- **Type**: Resort/Lodge management system
- **Platform**: Web application (React + TypeScript + Vite)
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Styling**: Tailwind CSS + shadcn/ui

## Development Setup
- **Working Directory**: D:\personal\projects\resorts\repo\avrlodge_v2
- **Git Repository**: Yes
- **Main Branch**: main
- **Current Branch**: config-firebase

## Firebase Configuration
- **Project ID**: avrlodgev2
- **Authentication**: Email/Password + Google OAuth
- **Database**: Firestore (asia-east1)
- **Storage**: Firebase Storage
- **Plan**: Spark (Free) - No Cloud Functions

### Firebase Services
1. **Authentication**
   - Email/Password authentication
   - Google OAuth provider
   - User profiles stored in Firestore `/users` collection

2. **Firestore Database**
   - **Users Collection** (`/users/{uid}`)
     - `displayName: string`
     - `email: string`
     - `photoURL?: string`
     - `role: 'guest' | 'manager' | 'admin'`
     - `createdAt: string`
     - `updatedAt: string`
     - `emailVerified?: boolean`

   - **Room Types Collection** (`/roomTypes/{id}`)
     - `name: string` (e.g., "Couple's Cove", "Family Nest")
     - `pricePerNight: number`
     - `maxGuests: number`
     - `numberOfRooms: number`
     - `description?: string`
     - `amenities: string[]`
     - `isActive: boolean`
     - `createdAt/updatedAt: timestamp`
     - `createdBy/updatedBy: string` (user uid)

   - **Rooms Collection** (`/rooms/{id}`)
     - `roomNumber: string` (e.g., "101", "102")
     - `roomTypeId: string` (reference to roomTypes)
     - `floorNumber?: number`
     - `status: 'available' | 'occupied' | 'maintenance' | 'reserved'`
     - `isActive: boolean`
     - `createdAt/updatedAt: timestamp`
     - `createdBy/updatedBy: string` (user uid)

   - **Special Charges Collection** (`/specialCharges/{id}`)
     - `chargeName: string` (e.g., "Kitchen", "Campfire")
     - `defaultRate: number`
     - `rateType: 'per_day' | 'per_person' | 'fixed'`
     - `description?: string`
     - `isActive: boolean`
     - `createdAt/updatedAt: timestamp`
     - `createdBy/updatedBy: string` (user uid)

   - **Reservations Collection** (`/reservations/{id}`)
     - `referenceNumber: string` (auto-generated: MMYYYY-XXX)
     - `guestName: string`
     - `guestEmail: string`
     - `guestPhone: string`
     - `guestType: 'walk_in' | 'online' | 'agent' | 'corporate'`
     - `checkInDate: timestamp`
     - `checkOutDate: timestamp`
     - `guestCount: number`
     - `totalPrice: number`
     - `status: 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'`
     - `paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded'`
     - `isActive: boolean`
     - `createdAt/updatedAt: timestamp`
     - `createdBy/updatedBy: string` (user uid)

   - **Reservation Rooms Collection** (`/reservationRooms/{id}`)
     - `reservationId: string` (reference to reservations)
     - `roomId: string` (reference to rooms)
     - `roomNumber: string`
     - `roomType: string`
     - `roomStatus: 'pending' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'`
     - `checkInTime?: timestamp`
     - `checkOutTime?: timestamp`
     - `checkedInBy?: string` (user uid)
     - `checkedOutBy?: string` (user uid)
     - `createdAt/updatedAt: timestamp`
     - `createdBy/updatedBy: string` (user uid)

   - **Reservation Special Charges Collection** (`/reservationSpecialCharges/{id}`)
     - `reservationId: string` (reference to reservations)
     - `specialChargeId: string` (reference to specialCharges)
     - `quantity: number`
     - `customRate?: number` (overrides defaultRate if provided)
     - `customDescription?: string`
     - `totalAmount: number`
     - `createdAt/updatedAt: timestamp`
     - `createdBy/updatedBy: string` (user uid)
     - `deletedAt?: timestamp` (soft delete)
     - `deletedBy?: string` (user uid)

   - **Room Check-in Documents Collection** (`/roomCheckinDocuments/{id}`)
     - `reservationId?: string` (reference to reservations)
     - `roomId: string` (reference to rooms)
     - `documentType: 'aadhar' | 'driving_license' | 'voter_id' | 'passport' | 'pan_card' | 'other'`
     - `fileUrl: string` (Firebase Storage URL)
     - `fileName: string`
     - `uploadedAt: timestamp`
     - `uploadedBy?: string` (user uid)
     - `createdAt/updatedAt: timestamp`
     - `createdBy/updatedBy: string` (user uid)
     - `deletedAt?: timestamp` (soft delete)
     - `deletedBy?: string` (user uid)

   - **Payments Collection** (`/payments/{id}`)
     - `reservationId?: string` (reference to reservations)
     - `amount: number`
     - `paymentType: 'booking_advance' | 'full_payment' | 'partial_payment' | 'security_deposit' | 'additional_charges' | 'refund' | 'cancellation_fee' | 'extra_services'`
     - `paymentMethod: 'cash' | 'card' | 'upi' | 'net_banking' | 'wallet' | 'bank_transfer' | 'cheque' | 'other'`
     - `receiptNumber: string` (auto-generated: PAY-MMYYYY-XXXXX)
     - `paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'`
     - `transactionId?: string`
     - `gatewayResponse?: string`
     - `notes?: string`
     - `paymentDate: timestamp`
     - `createdAt/updatedAt: timestamp`
     - `createdBy/updatedBy: string` (user uid)
     - `deletedAt?: timestamp` (soft delete)
     - `deletedBy?: string` (user uid)

   - **Guests Collection** (`/guests/{id}`)
     - `reservationId?: string` (reference to reservations)
     - `name: string`
     - `phone: string`
     - `whatsapp?: string`
     - `telegram?: string`
     - `pincode?: string` (6-digit Indian pincode)
     - `state?: string` (Indian state)
     - `district?: string`
     - `isPrimaryGuest: boolean`
     - `createdAt/updatedAt: timestamp`
     - `createdBy/updatedBy: string` (user uid)
     - `deletedAt?: timestamp` (soft delete)
     - `deletedBy?: string` (user uid)

   - **Reference Number Counters Collection** (`/referenceNumberCounters/{id}`)
     - `id: string` (format: MMYYYY, e.g., "012025")
     - `counter: number` (incremental counter)
     - `createdAt/updatedAt: timestamp`

   - **Receipt Number Counters Collection** (`/receiptNumberCounters/{id}`)
     - `id: string` (format: MMYYYY, e.g., "012025")
     - `counter: number` (incremental counter for PAY-MMYYYY-XXXXX)
     - `createdAt/updatedAt: timestamp`

3. **Role-Based Access Control**
   - **Roles**: guest (default), manager, admin
   - **Role Management**: Firestore-based (no Custom Claims)
   - **Real-time Role Updates**: Firestore subscriptions
   - **Permission Hierarchy**: guest < manager < admin

4. **Security Rules**
   - Development mode: Allow read/write until Dec 31, 2025
   - Production: Role-based access control
   - Rules deployed via `firebase deploy --only firestore:rules`

## Commands
- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Build with Types**: `npm run build-with-types`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`
- **Import Room Types**: `npm run import-room-types`
- **Import Rooms**: `npm run import-rooms`
- **Import Special Charges**: `npm run import-special-charges`

## Project Structure
```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components  
│   ├── ui/             # Reusable UI components
│   └── ...
├── contexts/
│   └── AuthContext.tsx # Authentication & role management
├── hooks/
│   ├── useFirestore.ts # Firestore operations
│   └── ...
├── layouts/
│   ├── AdminLayout.tsx # Admin protected layout
│   ├── ManagerLayout.tsx # Manager protected layout
│   ├── HomeLayout.tsx  # Public home layout
│   └── RootLayout.tsx  # Root application layout
├── lib/
│   ├── firebase.ts     # Firebase configuration
│   ├── auth.ts         # Authentication services
│   ├── firestore.ts    # Firestore operations
│   ├── storage.ts      # Firebase Storage operations
│   ├── roles.ts        # Role management (Firestore-based)
│   ├── redirects.ts    # Role-based redirect utilities
│   ├── roomTypes.ts    # Room types CRUD operations
│   ├── rooms.ts        # Rooms CRUD operations
│   ├── specialCharges.ts # Special charges CRUD operations
│   ├── reservations.ts # Reservations CRUD operations
│   ├── reservationRooms.ts # Reservation rooms CRUD operations
│   ├── reservationSpecialCharges.ts # Reservation special charges CRUD operations
│   ├── roomCheckinDocuments.ts # Room check-in documents CRUD operations
│   ├── payments.ts     # Payments CRUD operations
│   ├── guests.ts       # Guests CRUD operations
│   ├── types/
│   │   ├── auth.ts     # Authentication types
│   │   ├── roomTypes.ts # Room types interfaces
│   │   ├── rooms.ts    # Rooms interfaces
│   │   ├── specialCharges.ts # Special charges interfaces
│   │   ├── reservations.ts # Reservations interfaces
│   │   ├── reservationRooms.ts # Reservation rooms interfaces
│   │   ├── reservationSpecialCharges.ts # Reservation special charges interfaces
│   │   ├── roomCheckinDocuments.ts # Room check-in documents interfaces
│   │   ├── payments.ts # Payments interfaces
│   │   └── guests.ts   # Guests interfaces
│   └── utils/
│       ├── roomStatus.ts # Room status utilities
│       ├── referenceNumber.ts # Reference number generation
│       ├── receiptNumber.ts # Receipt number generation
│       ├── reservationRoomValidation.ts # Reservation room validation
│       ├── reservationSpecialChargeValidation.ts # Special charges validation
│       ├── reservationSpecialChargeManagement.ts # Special charges management
│       ├── roomCheckinDocumentValidation.ts # Document validation
│       ├── roomCheckinDocumentManagement.ts # Document management
│       ├── paymentValidation.ts # Payment validation
│       ├── paymentManagement.ts # Payment management
│       ├── guestValidation.ts # Guest validation
│       └── guestManagement.ts # Guest management
├── pages/
│   ├── admin/          # Admin dashboard pages
│   ├── auth/           # Authentication pages
│   ├── manager/        # Manager dashboard pages
│   └── ...
├── scripts/
│   ├── importRoomTypes.ts # Import room types data to Firestore
│   ├── importRooms.ts  # Import rooms data to Firestore
│   └── importSpecialCharges.ts # Import special charges data to Firestore
└── router/
    └── AppRouter.tsx   # Application routing with nested routes
```

## Authentication System
- **Auth Routes**: `/auth/login`, `/auth/signup`, `/auth/forgot-password`
- **Admin Routes**: `/admin`, `/admin/calendar`, `/admin/reservation`, `/admin/bookings`, `/admin/room-types`, `/admin/rooms`
- **Manager Routes**: `/manager`, `/manager/calendar`, `/manager/reservation`, `/manager/bookings`
- **Protected Routes**: Role-based access control with automatic redirects
- **Components**: Protected layouts (AdminLayout, ManagerLayout)
- **Context**: `AuthContext` with real-time role synchronization
- **Redirect Logic**: Authenticated users accessing auth routes are redirected based on role

## Firebase Environment Variables
```
VITE_FIREBASE_API_KEY="AIzaSyDZxKLNEHICeyOoIwiJdAVf6ULMbW-Kq_c"
VITE_FIREBASE_AUTH_DOMAIN="avrlodgev2.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="avrlodgev2"
VITE_FIREBASE_STORAGE_BUCKET="avrlodgev2.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="423109120986"
VITE_FIREBASE_APP_ID="1:423109120986:web:69500d1e043f9cc170e6e3"
VITE_FIREBASE_MEASUREMENT_ID="G-HSKHTM1097"
```

## Role Management
Since we're using Firebase Spark plan (free), role management is handled via Firestore collections instead of Custom Claims:

### Setting User Roles
- Admin users can update roles through the application UI
- Roles are stored in the user document in Firestore
- Real-time role updates via Firestore subscriptions

### Role Permissions
- **Guest**: Basic access, public pages only (redirected to `/`)
- **Manager**: Access to manager dashboard, calendar, reservations, and bookings management
- **Admin**: Full system access including admin panel, user management, and can access manager panel

## Security Notes
- No Cloud Functions (Spark plan limitation)
- Client-side role validation with server-side Firestore rules
- Role changes require admin privileges (enforced in client + Firestore rules)
- Production rules should implement proper role-based access control

## Development Notes
- Use `useAuth()` hook for authentication state and role management
- Protected layouts (AdminLayout, ManagerLayout) handle role-based access control
- Use `redirectByRole()` utility from `lib/redirects.ts` for consistent navigation
- Auth pages redirect authenticated users based on their role
- Admin users can access both admin and manager panels
- Manager users only access manager panel
- Guest users are redirected to home page for protected routes
- Firestore operations available via `useFirestore` hooks

## Layout Navigation
### AdminLayout
- Dashboard (`/admin`)
- Calendar (`/admin/calendar`) 
- Reservations (`/admin/reservation`)
- Bookings (`/admin/bookings`)
- Room Types (`/admin/room-types`)
- Rooms (`/admin/rooms`)
- Settings (`/admin/settings`)

### ManagerLayout  
- Dashboard (`/manager`)
- Calendar (`/manager/calendar`)
- Reservations (`/manager/reservation`) 
- Bookings (`/manager/bookings`)

## Data Migration & Management
### PostgreSQL to Firestore Migration
- **Room Types**: Converted 5 room types from PostgreSQL to Firestore
  - Couple's Cove (₹1,200/night, 2 guests, 4 rooms)
  - Family Nest (₹2,200/night, 4 guests, 10 rooms)
  - Rider's Haven (₹3,000/night, 6 guests, 2 rooms)
  - Dormitory One Stay (₹350/night, 6 guests, 1 room)
  - Dormitory Two Stay (₹350/night, 15 guests, 1 room)

- **Rooms**: Converted 16 individual rooms from PostgreSQL to Firestore
  - Maintained original UUIDs as Firestore document IDs
  - Preserved room relationships to room types
  - Room status: available, occupied, maintenance, reserved
  - Floor assignments and room number organization

- **Special Charges**: Converted 4 special charges from PostgreSQL to Firestore
  - Kitchen (₹350/fixed, dining facility access)
  - Campfire (₹150/person, outdoor activity)
  - Conference Hall (₹500/day, meeting space)
  - Extra Person (₹300/person, additional guest charge)

- **Reservations System**: Complete reservation management system
  - Auto-generated reference numbers (format: MMYYYY-XXX)
  - Guest information management with contact details
  - Check-in/check-out date tracking
  - Multi-status workflow (reservation → booking → checked_in → checked_out)
  - Payment status tracking (pending → partial → paid → refunded)

- **Reservation Rooms**: One-to-many relationship with reservations
  - Room assignment and status tracking
  - Check-in/check-out time logging
  - Staff tracking (who checked in/out guests)
  - Room-specific status management

- **Reservation Special Charges**: Additional charges system
  - Link special charges to specific reservations
  - Custom rates and descriptions
  - Quantity-based calculations
  - Soft delete functionality for charge removal

- **Room Check-in Documents**: Digital document management system
  - Document types: Aadhar, Driving License, Voter ID, Passport, PAN Card, Other
  - Firebase Storage integration for file uploads
  - Document validation with file type and size restrictions
  - Room and reservation-specific document organization
  - Audit trails for document uploads and deletions

- **Payments System**: Complete financial management system
  - Auto-generated receipt numbers (format: PAY-MMYYYY-XXXXX)
  - 8 payment types: booking advance, full payment, partial payment, security deposit, additional charges, refund, cancellation fee, extra services
  - 8 payment methods: cash, card, UPI, net banking, wallet, bank transfer, cheque, other
  - Payment status tracking (pending → completed → failed/refunded/cancelled)
  - Refund processing with original payment linking

- **Guests System**: Comprehensive guest management
  - Primary guest designation with smart selection algorithms
  - Multiple contact methods: phone (required), WhatsApp, Telegram
  - Indian location tracking: 6-digit pincode, state, district
  - Duplicate detection and guest merging capabilities
  - Guest analytics and return visitor identification

### Admin Management Features
- **Room Types Management** (`/admin/room-types`)
  - Full CRUD operations with real-time updates
  - Statistics dashboard (total types, rooms, capacity, avg price)
  - Search and filter capabilities
  - Amenities management with visual tags

- **Rooms Management** (`/admin/rooms`)
  - Real-time room status updates with visual indicators
  - Occupancy statistics and analytics
  - Status change functionality (available ↔ occupied ↔ maintenance ↔ reserved)
  - Room type integration showing pricing and capacity
  - Search by room number and room type
  - Filter by status and floor

- **Special Charges Management** (`/admin/special-charges`)
  - CRUD operations for additional service charges
  - Rate type management (per_day, per_person, fixed)
  - Usage analytics and popular charges tracking
  - Real-time updates with validation

### Room Status System
- **Available**: Ready for check-in (green indicator)
- **Occupied**: Guest currently staying (red indicator) 
- **Maintenance**: Requires service work (orange indicator)
- **Reserved**: Booked for future check-in (blue indicator)
- Smart status transitions with validation rules
- Real-time occupancy rate calculations

## Backend Infrastructure
### Reservation Management System
- **Reference Number Generation**: Transaction-safe auto-increment system (MMYYYY-XXX format)
- **Guest Management**: Comprehensive guest information tracking with multiple contact methods
- **Multi-Status Workflow**: Advanced status transitions (reservation → booking → checked_in → checked_out → cancelled)
- **Payment Tracking**: Complete payment status management (pending → partial → paid → refunded)
- **Date Management**: Check-in/check-out date validation and conflict detection

### Room Assignment System  
- **Dynamic Room Assignment**: Link multiple rooms to single reservation
- **Check-in/Check-out Workflow**: Time-stamped entry/exit with staff tracking
- **Room Status Management**: Real-time status updates (pending → checked_in → checked_out)
- **Conflict Detection**: Prevent double-booking and status conflicts
- **Batch Operations**: Efficient multi-room check-in/check-out processes

### Special Charges System
- **Flexible Charging**: Support for fixed, per-person, and per-day rates
- **Custom Rates**: Override default rates with validation
- **Calculation Engine**: Automatic total calculation with consistency checks
- **Bulk Operations**: Batch creation and management of charges
- **Usage Analytics**: Track popular charges and revenue insights
- **Soft Delete**: Preserve audit trail while removing charges

### Document Management System
- **Digital Document Storage**: Firebase Storage integration for secure file management
- **Document Type Validation**: Support for 6 Indian identity document types
- **File Validation**: Size limits (5MB), format restrictions (JPG, PNG, PDF)
- **Upload Management**: Bulk document uploads with progress tracking
- **Completion Tracking**: Document requirements and missing document identification
- **Audit Trails**: Complete document operation history with user attribution

### Payment Processing System
- **Receipt Generation**: Auto-generated unique receipt numbers (PAY-MMYYYY-XXXXX format)
- **Multi-Payment Support**: 8 payment types with business rule enforcement
- **Payment Method Handling**: Support for 8 payment methods with processing fees and limits
- **Refund Management**: Safe refund processing with validation against business rules
- **Revenue Analytics**: Comprehensive payment analytics and dashboard metrics
- **Transaction Safety**: All critical operations use Firestore transactions

### Guest Management System
- **Contact Management**: Multi-channel communication support (phone, WhatsApp, Telegram)
- **Location Intelligence**: Indian geography validation with pincode-to-state detection
- **Duplicate Prevention**: Smart algorithms to detect and prevent duplicate guests
- **Primary Guest Logic**: Intelligent primary guest selection with scoring algorithms
- **Guest Analytics**: Geographic distribution, contact method usage, and return visitor tracking
- **Data Quality**: Comprehensive validation with smart suggestions and auto-corrections

### Validation & Business Rules
- **Comprehensive Validation**: Multi-layer validation for all entities
- **Business Rule Enforcement**: Prevent invalid state transitions and data inconsistencies
- **Rate Consistency**: Validate custom rates against reasonable limits
- **Calculation Verification**: Ensure mathematical accuracy in all charge calculations
- **Duplicate Prevention**: Block duplicate charges and conflicting reservations

### Real-time Operations
- **Live Updates**: Real-time Firestore subscriptions for all collections
- **Fallback Filtering**: Client-side filtering when Firestore indexes are insufficient
- **Transaction Safety**: Atomic operations for critical data modifications
- **Batch Processing**: Efficient bulk operations with transaction guarantees
- **Error Handling**: Comprehensive error handling with fallback strategies

## Recent Updates
- **Complete Backend Infrastructure**: Built full resort management system with PostgreSQL to Firestore migration
- **Database Migration**: Successfully migrated 8 PostgreSQL tables to Firestore with full relationship preservation
  - Core tables: room_types, rooms, special_charges_master, reservations, reservation_rooms, reservation_special_charges
  - Extended tables: room_checkin_documents, payments, guests
- **Document Management System**: Complete digital document management with Firebase Storage integration
  - Support for 6 Indian identity document types (Aadhar, Driving License, Voter ID, Passport, PAN Card, Other)
  - File validation, bulk uploads, and completion tracking
  - Document audit trails and requirement management
- **Payment Processing System**: Comprehensive financial management with auto-generated receipts
  - 8 payment types and 8 payment methods with business rule enforcement
  - Receipt number generation (PAY-MMYYYY-XXXXX format) with monthly counter reset
  - Refund processing, payment reconciliation, and revenue analytics
  - Payment method constraints (UPI ₹1L limit, Cash ₹2L limit, processing fees)
- **Guest Management System**: Advanced guest management with Indian market optimization
  - Multi-contact support (phone, WhatsApp, Telegram) with smart formatting
  - Indian geography validation (36 states/territories, 6-digit pincode, district tracking)
  - Duplicate detection algorithms and intelligent guest merging
  - Primary guest designation with smart selection and guest analytics
- **Reference & Receipt Systems**: Transaction-safe auto-increment number generation
  - Reservation reference numbers (MMYYYY-XXX format)
  - Payment receipt numbers (PAY-MMYYYY-XXXXX format)
  - Monthly counter reset with collision prevention
- **Validation Framework**: Comprehensive multi-layer validation for all entities
  - Business rule enforcement and data consistency checks
  - Indian-specific validation (mobile numbers, pincode, state names)
  - Smart suggestions and auto-corrections for data entry
- **Real-time Operations**: Live updates with Firestore subscriptions and fallback client-side filtering
- **Audit & Compliance**: Complete audit trails for all operations with user attribution
- **Analytics & Insights**: Pre-built analytics for reservations, payments, guests, and documents
- **Firestore Optimization**: 50+ composite indexes for efficient querying across all collections
- **Role-based Access**: Comprehensive admin/manager/guest access control system
- **Firestore Rules**: Extended development period until Dec 31, 2025
- to memorize