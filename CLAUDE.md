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

3. **Role-Based Access Control**
   - **Roles**: guest (default), manager, admin
   - **Role Management**: Firestore-based (no Custom Claims)
   - **Real-time Role Updates**: Firestore subscriptions
   - **Permission Hierarchy**: guest < manager < admin

4. **Security Rules**
   - Development mode: Allow read/write until Oct 9, 2025
   - Production: Role-based access control

## Commands
- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Build with Types**: `npm run build-with-types`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## Project Structure
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── ui/             # Reusable UI components
│   └── ...
├── contexts/
│   └── AuthContext.tsx # Authentication & role management
├── hooks/
│   ├── useFirestore.ts # Firestore operations
│   └── ...
├── lib/
│   ├── firebase.ts     # Firebase configuration
│   ├── auth.ts         # Authentication services
│   ├── firestore.ts    # Firestore operations
│   ├── storage.ts      # Firebase Storage operations
│   ├── roles.ts        # Role management (Firestore-based)
│   └── types/
│       └── auth.ts     # Authentication types
├── pages/
│   └── auth/           # Authentication pages
└── router/
    └── AppRouter.tsx   # Application routing
```

## Authentication System
- **Routes**: `/auth/login`, `/auth/signup`, `/auth/forgot-password`
- **Protected Routes**: Role-based access control
- **Components**: `ProtectedRoute`, `RoleGuard`
- **Context**: `AuthContext` with real-time role synchronization

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
- **Guest**: Basic access, view own bookings
- **Manager**: Booking management, view dashboards
- **Admin**: Full system access, user management

## Security Notes
- No Cloud Functions (Spark plan limitation)
- Client-side role validation with server-side Firestore rules
- Role changes require admin privileges (enforced in client + Firestore rules)
- Production rules should implement proper role-based access control

## Development Notes
- Use `useAuth()` hook for authentication state
- Use `ProtectedRoute` for route-level access control
- Use `RoleGuard` for component-level role checking
- Firestore operations available via `useFirestore` hooks