// Common interfaces used across the application
import { Room } from './rooms'

// Booking interface with proper typing
export interface Booking {
  id: string
  reference_number: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
  total_quote: number
  total_paid: number
  remaining_balance: number
  status: 'reservation' | 'booking' | 'checked_in' | 'checked_out' | 'cancelled'
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
  guest_count: number
  room_details: RoomDetail[]
}

export interface RoomDetail {
  id: string
  room_number: string
  room_type: string
  guest_count: number
  room_status: 'pending' | 'checked_in' | 'checked_out'
  check_in_datetime?: string | null
  check_out_datetime?: string | null
}

// Modal state interfaces
export interface PaymentModalState {
  isOpen: boolean
  booking: Booking | null
}

export interface CheckInModalState {
  isOpen: boolean
  booking: Booking | null
  room: Room | null
}

export interface CheckOutModalState {
  isOpen: boolean
  booking: Booking | null
  room: Room | null
}

export interface RoomChangeModalState {
  isOpen: boolean
  booking: Booking | null
  room: Room | null
}

// Document interface for file uploads
export interface DocumentFile {
  id: string
  reservationId: string
  roomId: string
  documentType: 'aadhar' | 'driving_license' | 'voter_id' | 'passport' | 'pan_card' | 'other'
  fileUrl: string
  fileName: string
  uploadedAt: string
  uploadedBy?: string
}

// Chart data interfaces
export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface DashboardData {
  totalBookings: number
  totalRevenue: number
  occupancyRate: number
  monthlyBookings: ChartData[]
  revenueData: ChartData[]
  roomTypeDistribution: ChartData[]
}

// Form data interfaces
export interface GuestFormData {
  name: string
  email: string
  phone: string
  whatsapp?: string
  telegram?: string
  pincode?: string
  state?: string
  district?: string
}

// API Response interfaces
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Generic list response
export interface ListResponse<T = unknown> {
  items: T[]
  total: number
  page: number
  limit: number
}

// File upload interfaces
export interface FileUploadData {
  file: File
  fileName: string
  fileType: string
  fileSize: number
}

export interface UploadResponse {
  fileUrl: string
  fileName: string
  success: boolean
  error?: string
}

// Error handling
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Calendar/Event interfaces
export interface CalendarEvent {
  id: string
  title: string
  start: Date | string
  end: Date | string
  status: 'confirmed' | 'pending' | 'cancelled'
  booking?: Booking
  room?: Room
}

// Auth related interfaces
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
}

export interface UserProfile {
  id: string
  displayName: string
  email: string
  photoURL?: string
  role: 'guest' | 'manager' | 'admin'
  createdAt: string
  updatedAt: string
  emailVerified?: boolean
}

// Firestore document with metadata
export interface FirestoreDocument {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  deletedAt?: string | null
  deletedBy?: string | null
}

// Generic state management
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface PaginationState {
  page: number
  limit: number
  total: number
}

// Statistics interfaces
export interface BookingStats {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  totalRevenue: number
  averageBookingValue: number
}

export interface RoomStats {
  totalRooms: number
  availableRooms: number
  occupiedRooms: number
  maintenanceRooms: number
  reservedRooms: number
  occupancyRate: number
}