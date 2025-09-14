# Claude Code Configuration

This file contains project-specific information for Claude Code to better understand and work with this codebase.

## Project Overview
- **Name**: AVR Lodge v2
- **Type**: Resort/Lodge management system
- **Platform**: Web application (React + TypeScript + Vite)
- **Backend**: Firebase (Firestore, Auth) + Supabase (Storage)
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
- **Storage**: Supabase Storage
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
     - `fileUrl: string` (Supabase Storage URL)
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
│   ├── supabase.ts     # Supabase client configuration
│   ├── supabaseStorage.ts # Supabase Storage operations
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

## Supabase Storage Configuration

### Storage Integration
The system uses **Supabase Storage** for document management, not Firebase Storage. This hybrid approach combines Firebase's strengths (authentication, database) with Supabase's excellent file storage capabilities.

### Supabase Configuration
- **Project URL**: `https://gyscskrvuxpgysletrvz.supabase.co`
- **Environment Variable**: `VITE_SUPABASE_ANON_KEY` (required)
- **Storage Bucket**: `room-documents`
- **File Access**: Private with public URL generation and signed URL fallback

### Storage Structure
```
room-documents/
├── reservations/
│   └── {reservationId}/
│       └── {roomId}/
│           ├── aadhar_card_image.jpg
│           ├── driving_license_scan.pdf
│           └── passport_photo.png
└── temp/
    └── uploads/
        └── {tempId}/
            └── pending_files...
```

### File Upload Logic
```typescript
// 1. Upload file to Supabase Storage
const uploadFile = async (path: string, file: File | Blob) => {
  const { data, error } = await supabase.storage
    .from('room-documents')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  return { data, error }
}

// 2. Get public URL for file access
const getFileDownloadURL = async (path: string): Promise<string> => {
  const { data } = supabase.storage
    .from('room-documents')
    .getPublicUrl(path)

  return data.publicUrl
}

// 3. Create signed URL for private files (fallback)
const createSignedUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('room-documents')
    .createSignedUrl(path, 3600) // 1 hour expiry

  return data?.signedUrl || ''
}
```

### Document Preview System
The document preview system has been optimized for Supabase Storage:

#### URL Resolution Logic
1. **Check existing URL**: If `fileUrl` already contains `supabase.co`, use as-is
2. **Generate public URL**: Use `supabase.storage.from('room-documents').getPublicUrl(path)`
3. **Fallback to signed URL**: If public URL fails, create temporary signed URL
4. **Error handling**: Show meaningful error messages with debugging info

#### Preview Features
- **Image Preview**: Full-size modal preview for JPG, PNG, GIF, BMP, WebP
- **PDF Preview**: Iframe-based preview with fallback to external link
- **Thumbnail Generation**: 64x64px thumbnails in document list
- **File Type Detection**: Smart detection based on file extension
- **Error Recovery**: Multiple fallback strategies for failed loads

#### Document List UX
```typescript
// Compact list design with thumbnails
<div className="space-y-3">
  {documents.map(doc => (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      {/* 64x64px thumbnail or file icon */}
      <div className="w-16 h-16">
        {isImage ? <img src={getSupabasePublicURL(doc)} /> : <FileIcon />}
      </div>

      {/* Document info */}
      <div className="flex-1">
        <h4>{doc.documentType}</h4>
        <p>{doc.fileName}</p>
        <span>{formatDate(doc.uploadedAt)}</span>
      </div>

      {/* Preview button */}
      <Button onClick={() => openPreview(doc)}>
        Preview
      </Button>
    </div>
  ))}
</div>
```

### Storage Validation & Security
```typescript
// File validation rules
const STORAGE_CONFIG = {
  bucket: 'room-documents',
  maxFileSize: 5242880, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf'
  ],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
  publicAccess: false // Files require authentication
}

// Upload validation
const validateFile = (file: File) => {
  if (file.size > STORAGE_CONFIG.maxFileSize) {
    throw new Error('File too large (max 5MB)')
  }

  if (!STORAGE_CONFIG.allowedMimeTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  return true
}
```

### Integration Points
- **Room Check-in**: Documents uploaded during room check-in process
- **Firestore Metadata**: File metadata stored in `/roomCheckinDocuments` collection
- **Admin Dashboard**: Document viewing and management in booking cards
- **Preview System**: Modal-based preview with Supabase URL resolution

### Environment Setup
```bash
# Add to .env.local
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Bucket Configuration (Supabase Dashboard)
1. **Create Bucket**: `room-documents`
2. **Set Privacy**: Private (not publicly readable)
3. **File Size Limit**: 5MB per file
4. **Allowed Types**: `image/*`, `application/pdf`
5. **RLS Policies**: Configure based on user authentication

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
  - Supabase Storage integration for file uploads
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
- **Digital Document Storage**: Supabase Storage integration for secure file management
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

## UX Design System
- **Design Philosophy**: Black & white aesthetic with sophisticated animations
- **Animation Framework**: Framer Motion v11.18.2 for smooth, professional animations
- **Color Scheme**: Monochromatic black and white with subtle gray accents
- **Typography**: Serif fonts for headings, clean sans-serif for body text
- **Visual Effects**: Glass morphism with `bg-white/95 backdrop-blur-sm` transparency

### Design Implementation
- **Authentication Pages**: Login, Signup, Forgot Password with animated form elements
- **Admin Dashboard**: 7 pages with comprehensive black/white theme and animations
  - AdminDashboard, AdminRoomTypes, AdminRooms, AdminBookings
  - AdminCalendar, AdminReservation, AdminSpecialCharges
- **Manager Dashboard**: 4 pages with consistent design system
  - ManagerDashboard, ManagerBookings, ManagerCalendar, ManagerReservation
- **Animation Patterns**: Staggered entrance animations, hover effects, scale transitions
- **Interactive Elements**: `whileHover={{ scale: 1.02 }}` for buttons and cards
- **Visual Hierarchy**: Professional layouts with consistent spacing and shadows

### Technical Implementation
- **Framer Motion Integration**: Added to all 18 pages (3 auth + 7 admin + 4 manager + home)
- **Color Consistency**: Replaced all colored elements with black/white/gray variants
- **Performance Optimized**: Efficient animation timing and smooth transitions
- **Component Enhancement**: Enhanced Cards, Buttons, Inputs with hover states
- **Responsive Design**: Full mobile-first responsive system with CSS classes

### Responsive Design System
- **Mobile-First Approach**: Designed for phones (320px-480px), tablets (up to 1024px), and large devices
- **CSS Variables**: Consistent spacing, typography, and component sizing across all breakpoints
- **Reusable Classes**: Responsive typography, spacing, grids, and form components
- **Component Standards**: Standardized button heights, input sizes, and card padding
- **Utility Classes**: Mobile/tablet/desktop visibility controls and responsive containers

#### CSS Class Library
- **Typography**: `.text-responsive-{size}` - Auto-scaling text from mobile to desktop
- **Components**: `.btn-responsive`, `.input-responsive`, `.card-responsive` - Consistent component sizing
- **Grids**: `.grid-responsive-{1-4}` - Responsive grid layouts (1 col mobile → 2-4 cols desktop)
- **Containers**: `.container-responsive` - Responsive padding and max-width containers
- **Forms**: `.form-responsive`, `.form-group-responsive` - Consistent form layouts
- **Spacing**: `.gap-responsive`, `.space-responsive-{size}` - Responsive spacing utilities
- **Visibility**: `.mobile-hidden`, `.tablet-hidden`, `.desktop-hidden` - Breakpoint visibility

## Recent Updates
- **Complete UX Design System Overhaul**: Transformed entire application with black & white aesthetic
  - Updated 18 total pages: 3 authentication + 7 admin + 4 manager + home reference
  - Implemented sophisticated Framer Motion animations throughout
  - Applied glass morphism effects and professional typography
- **Complete Backend Infrastructure**: Built full resort management system with PostgreSQL to Firestore migration
- **Database Migration**: Successfully migrated 8 PostgreSQL tables to Firestore with full relationship preservation
  - Core tables: room_types, rooms, special_charges_master, reservations, reservation_rooms, reservation_special_charges
  - Extended tables: room_checkin_documents, payments, guests
- **Document Management System**: Complete digital document management with Supabase Storage integration
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

## Booking Management System Implementation (Recent)

### Complete Firebase Booking System
- **Branch**: `bookings` - Complete booking management system with Firebase integration
- **Migration**: Moved from PostgreSQL/Supabase to pure Firebase ecosystem
- **Components**: 6 new React components with TypeScript integration
- **Context**: Centralized booking state management with `BookingsContext`

### Core Components Architecture

#### **FirebaseBookingCard Component** (`/src/components/bookings/FirebaseBookingCard.tsx`)
- **Purpose**: Main booking display card with comprehensive booking information
- **Features**:
  - Real-time payment history with accordion UI (saves space)
  - Dynamic status calculation: `reservation` → `booking` (when payment made) → `checked_in` → `checked_out`
  - Document viewing integration with upload count display
  - Payment totals calculated from actual Firebase payments (not cached booking values)
  - Guest contact information with phone, WhatsApp, Telegram links
  - Room assignment display with room numbers and types

- **Business Logic**:
  ```typescript
  const calculatePaymentTotals = () => {
    const totalPaid = payments
      .filter(payment => payment.paymentStatus === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const remainingBalance = Math.max(0, (booking.total_quote || 0) - totalPaid)
    return { totalPaid, remainingBalance }
  }

  const getCalculatedStatus = () => {
    if (booking.status === 'checked_out') return 'Checked Out'
    if (booking.status === 'checked_in') return 'Checked In'
    if (calculatePaymentTotals().totalPaid > 0) return 'Booking'
    return 'Reservation'
  }
  ```

#### **FirebasePaymentModal Component** (`/src/components/bookings/FirebasePaymentModal.tsx`)
- **Purpose**: Payment processing and recording interface
- **Payment Methods**:
  - Jubair QR (UPI via QR Code)
  - Basha QR (UPI via QR Code)
  - Cash payments
- **Features**:
  - Real-time payment calculation and validation
  - Transaction ID capture for QR payments
  - Auto-amount setting to remaining balance
  - Payment method validation and constraints
  - Instant parent component refresh after payment

- **Simplified Payment Data**:
  ```typescript
  const paymentData = {
    reservationId: booking.id,
    amount: paymentAmount,
    paymentMethod: actualPaymentMethod, // "Jubair QR", "Basha QR", "Cash"
    transactionId: transactionId.trim() || undefined,
    paymentDate: new Date().toISOString()
  }
  ```

#### **Room Check-in/Check-out Modals**
- **RoomCheckInModal**: Document upload integration with Supabase Storage
- **RoomCheckOutModal**: Checkout processing with final payment reconciliation
- **Document Management**: Support for 6 Indian identity document types
- **Validation**: File type, size validation, and completion tracking

#### **BookingModalManager Component** (`/src/components/bookings/BookingModalManager.tsx`)
- **Purpose**: Centralized modal state management
- **Pattern**: Single component managing all booking-related modals
- **Integration**: Seamless integration with BookingsContext
- **Auto-refresh**: Automatic booking data refresh after operations

### BookingsContext State Management (`/src/contexts/BookingsContext.tsx`)
- **Purpose**: Global booking state management with React Context
- **Features**:
  - Centralized modal state (payment, check-in, check-out)
  - Automatic data refresh after operations
  - Real-time booking updates
  - Modal action handlers with proper state cleanup

- **Context API**:
  ```typescript
  interface BookingsContextType {
    paymentModal: PaymentModalState
    checkInModal: CheckInModalState
    checkOutModal: CheckOutModalState
    actions: {
      openPaymentModal: (booking: Booking) => void
      closePaymentModal: () => void
      openCheckInModal: (booking: Booking, room: Room) => void
      closeCheckInModal: () => void
      openCheckOutModal: (booking: Booking, room: Room) => void
      closeCheckOutModal: () => void
      refreshBookings: () => void
    }
  }
  ```

### Payment System Integration

#### **Fixed Payment Data Structure**
- **Removed Fields**: `notes`, `paymentType`, `paymentStatus` (auto-set to 'completed')
- **Simplified Storage**: Clean payment method names stored ("Jubair QR", "Basha QR", "Cash")
- **Business Rule**: Payment amount cannot exceed remaining balance
- **Validation**: Real-time amount validation with max limit enforcement

#### **Payment History Display**
- **UI Pattern**: Accordion format to save space in booking cards
- **Data Source**: Live Firebase payments collection (not cached booking values)
- **Real-time Updates**: Automatic refresh when payments are made
- **Filtering**: Client-side soft delete filtering (fixed Firestore query issues)

### Document Management Integration

#### **Fixed Document Loading Issue**
- **Problem**: "View Uploaded Documents" showing empty after check-in
- **Root Cause**: Server-side Firestore query `where('deletedAt', '==', null)` not matching documents without `deletedAt` field
- **Solution**: Moved to client-side soft delete filtering
- **Implementation**:
  ```typescript
  // Fixed in getRoomCheckinDocuments() and subscribeToRoomCheckinDocuments()
  // Removed: q = query(q, where('deletedAt', '==', null))
  // Added: documents = documents.filter(doc => !doc.deletedAt)
  ```

#### **Document Upload Flow**
1. **Check-in Modal**: Upload documents during room check-in
2. **Supabase Storage**: Secure file storage with validation
3. **Firebase Metadata**: Document metadata stored in Firestore
4. **Real-time Updates**: Immediate document count updates in booking cards
5. **View Documents**: Modal-based document viewer with download support

### Real-time Data Synchronization

#### **Payment History Sync**
- **Challenge**: Payment totals not updating after payment completion
- **Solution**: Real-time payment loading with calculated totals
- **Implementation**: `useEffect` triggers on booking changes and manual refresh calls
- **Result**: Instant UI updates when payments are made

#### **Status Calculation Logic**
- **Dynamic Status**: Status calculated from actual payment data, not cached values
- **Business Rules**:
  - `Reservation`: No payments made (`totalPaid = 0`)
  - `Booking`: Partial or full payment made (`totalPaid > 0`)
  - `Checked In`: Room check-in completed
  - `Checked Out`: Room check-out completed

#### **Component Communication**
- **Parent-Child Updates**: Payment modal triggers parent BookingCard refresh
- **Context Integration**: All modals communicate via BookingsContext
- **State Consistency**: Centralized state management prevents stale data

### UI/UX Design Patterns

#### **Black & White Aesthetic**
- **Design Philosophy**: Professional monochromatic design with subtle animations
- **Framer Motion**: Smooth modal transitions and hover effects
- **Glass Morphism**: `bg-white/95 backdrop-blur-sm` for modal overlays
- **Visual Hierarchy**: Clear information structure with appropriate spacing

#### **Responsive Design**
- **Mobile-First**: All booking components fully responsive
- **Accordion UI**: Space-efficient payment history display
- **Modal Optimization**: Proper modal sizing and scroll handling
- **Touch-Friendly**: Mobile-optimized button sizes and interactions

### Firebase Integration Optimizations

#### **Firestore Query Optimization**
- **Issue**: Complex queries with multiple filters causing index errors
- **Solution**: Simplified server-side queries with client-side filtering fallbacks
- **Performance**: Efficient data loading with minimal over-fetching
- **Reliability**: Fallback mechanisms for query failures

#### **Real-time Subscriptions**
- **Payment Updates**: Live payment status changes
- **Document Updates**: Real-time document upload/delete notifications
- **Booking Status**: Instant status updates across all components
- **Error Handling**: Comprehensive error handling with user feedback

### Business Logic Implementation

#### **Payment Processing Rules**
- **Amount Validation**: Cannot exceed remaining balance
- **Payment Methods**: Support for UPI QR codes and cash payments
- **Transaction Tracking**: Optional transaction ID for QR payments
- **Auto-calculation**: Remaining balance auto-calculated and displayed

#### **Status Transition Logic**
- **State Machine**: Proper status transitions with validation
- **Business Rules**: Prevent invalid status changes
- **User Feedback**: Clear status indicators and change notifications
- **Audit Trail**: All status changes logged with timestamps and user attribution

#### **Document Requirements**
- **Check-in Requirement**: Documents must be uploaded during check-in
- **File Validation**: Type, size, and format validation
- **Completion Tracking**: Document upload progress and requirements
- **Security**: Secure file storage with access controls

### Component Integration Architecture

#### **Layout Integration**
- **AdminBookings Page**: Main booking management interface
- **Modal Management**: Centralized modal state and lifecycle
- **Context Providers**: BookingsContext wrapping booking components
- **Layout Consistency**: Consistent design across all booking interfaces

#### **Data Flow Pattern**
1. **BookingsContext**: Global state management
2. **BookingCard**: Display and user interaction
3. **Modals**: Specialized operations (payment, check-in, check-out)
4. **Firebase Services**: Backend data operations
5. **UI Updates**: Real-time synchronization and refresh

This comprehensive booking system provides a complete resort management solution with real-time updates, secure payment processing, document management, and professional UI/UX design.

## Document Preview System (Latest Update)

### Enhanced Document Viewer
The document preview system has been completely redesigned for better UX and Supabase Storage integration:

#### **Fixed Storage Integration Issues**
- **Problem**: Previous system tried to use Firebase Storage URLs, causing "Bucket not found" errors
- **Solution**: Implemented proper Supabase Storage URL resolution with fallback mechanisms
- **Result**: Documents now load correctly with proper error handling

#### **Smart URL Resolution**
```typescript
// Multi-layer URL resolution for maximum compatibility
const getSupabasePublicURL = (doc) => {
  // 1. Check if already a valid Supabase URL
  if (doc.fileUrl.includes('supabase.co')) {
    return doc.fileUrl
  }

  // 2. Generate public URL from path
  const { data } = supabase.storage
    .from('room-documents')
    .getPublicUrl(doc.fileUrl)

  return data.publicUrl
}

// Fallback to signed URLs for private files
const getSignedURL = async (doc) => {
  const { data } = await supabase.storage
    .from('room-documents')
    .createSignedUrl(filePath, 3600) // 1-hour expiry

  return data.signedUrl
}
```

#### **Improved UX Design**
- **Compact Modal**: Reduced from `max-w-4xl` to `max-w-2xl` for better screen usage
- **List Layout**: Changed from 3-column grid to vertical list for better mobile experience
- **Smart Thumbnails**: 64x64px image previews with fallback to file icons
- **Room ID Optimization**: Shows last 4 characters of room ID for cleaner display

#### **Document List Features**
- **Visual Hierarchy**: Document type as primary title, filename as secondary
- **Compact Date Format**: "14 Sep" instead of full date strings
- **Hover Effects**: Smooth transitions and visual feedback
- **Error Recovery**: Graceful fallback when images fail to load

#### **Preview Modal Features**
- **Full-size Image Preview**: Modal-based image viewing with proper scaling
- **PDF Support**: Iframe-based PDF preview with external link fallback
- **Error Debugging**: Shows actual URLs being attempted for troubleshooting
- **Multiple Fallbacks**: Public URL → Signed URL → Error message with details

#### **Technical Improvements**
- **Hybrid Architecture**: Firebase for auth/database + Supabase for storage
- **Real-time Updates**: Document changes reflect immediately in UI
- **Type Safety**: Proper TypeScript interfaces for all document operations
- **Performance**: Optimized image loading with lazy loading and caching

This enhanced document system now provides a seamless, professional experience for viewing and managing reservation documents across all device types.