// TypeScript types for the normalized hotel management system

// Audit and Soft Delete Interfaces
export interface AuditFields {
  created_by?: string | null;
  created_at?: string | null;
  updated_by?: string | null;
  updated_at?: string | null;
  deleted_by?: string | null;
  deleted_at?: string | null;
}

// Base interface for all tables with audit fields
export interface BaseEntity extends AuditFields {
  id: string;
}

// User Profile interface (excluded from audit/soft delete as requested)
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  alternative_phone_number: string | null;
  avatar_url: string | null;
  role: 'guest' | 'admin' | 'manager';
  created_at: string;
  updated_at: string;
}

// Updated interfaces with audit fields
export interface Reservation extends BaseEntity {
  room_id?: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests?: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reference_number?: string;
  guest_type?: string;
  room_numbers?: string[];
  room_tariff?: number;
  percentage_discount?: number;
  fixed_discount?: number;
  total_quote?: number;
  advance_payment?: number;
  balance_payment?: number;
  payment_status?: string;
}

export interface RoomType extends BaseEntity {
  name: string;
  price_per_night: number;
  max_guests: number;
  number_of_rooms: number;
  description?: string;
  amenities?: string[];
  is_active: boolean;
}

export interface Room extends BaseEntity {
  room_number: string;
  room_type_id: string;
  floor_number?: number;
  is_active: boolean;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
}

export interface Guest extends BaseEntity {
  reservation_id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  pincode?: string;
  state?: string;
  district?: string;
  is_primary_guest: boolean;
}

export interface SpecialChargeMaster extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  category?: string;
}

export interface ReservationSpecialCharge extends BaseEntity {
  reservation_id: string;
  special_charge_id: string;
  quantity: number;
  total_amount: number;
  notes?: string;
}

export interface PaymentRecord extends BaseEntity {
  reservation_id: string;
  amount: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_date: string;
  notes?: string;
}

export interface GuestFeedback extends BaseEntity {
  reservation_id: string;
  rating: number;
  comment?: string;
  category: 'service' | 'cleanliness' | 'facilities' | 'overall';
  is_anonymous: boolean;
}

export interface Todo extends BaseEntity {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  due_date?: string;
  category?: string;
}

export interface CleaningTask extends BaseEntity {
  room_id: string;
  task_type: 'daily' | 'deep_clean' | 'maintenance' | 'inspection';
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  assigned_to?: string;
  scheduled_date: string;
  completed_date?: string;
  notes?: string;
  checklist_items?: string[];
}

export interface ReservationRoom extends BaseEntity {
  reservation_id: string;
  room_id: string;
  room_number: string;
  room_type?: string;
  guest_count: number;
  tariff_per_night: number;
  
  // Per-room check-in/out tracking
  room_status: 'pending' | 'checked_in' | 'checked_out';
  check_in_datetime?: string | null;
  check_out_datetime?: string | null;
  checked_in_by?: string | null;
  checked_out_by?: string | null;
  check_in_notes?: string | null;
  check_out_notes?: string | null;
}

// Audit Log Interface
export interface AuditLog extends BaseEntity {
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE';
  old_values?: any;
  new_values?: any;
  changed_fields?: string[];
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
}

// Soft Delete Response Interface
export interface SoftDeleteResponse {
  success: boolean;
  message: string;
  deleted_at?: string;
  deleted_by?: string;
}

// Restore Response Interface
export interface RestoreResponse {
  success: boolean;
  message: string;
  restored_at?: string;
  restored_by?: string;
}

// Audit Trail Query Interface
export interface AuditTrailQuery {
  table_name?: string;
  record_id?: string;
  user_id?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// Audit Trail Response Interface
export interface AuditTrailResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

// Room Check-In Document Interface
export interface RoomCheckinDocument extends BaseEntity {
  reservation_room_id: string;
  document_type: 'aadhar' | 'driving_license' | 'voter_id' | 'passport' | 'other';
  file_url: string;
  file_name: string;
  uploaded_at: string;
  uploaded_by?: string | null;
}

// Room Status Summary Interface
export interface RoomStatusSummary {
  total_rooms: number;
  pending_rooms: number;
  checked_in_rooms: number;
  checked_out_rooms: number;
  overall_status: 'pending' | 'partial_checkin' | 'completed' | 'mixed';
}

// Active Records Query Interface
export interface ActiveRecordsQuery {
  table_name: string;
  filters?: Record<string, any>;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Extended types for API responses
export interface ReservationWithDetails extends Reservation {
  guests: Guest[];
  rooms: ReservationRoom[];
  payments: PaymentRecord[];
  special_charges: (ReservationSpecialCharge & { charge: SpecialChargeMaster })[];
}

export interface RoomAvailability {
  room_number: string;
  room_type: string;
  capacity: number;
  base_tariff: number;
  is_available: boolean;
  conflicting_reservations: number;
}

export interface RoomAllocation {
  id: string;
  room_id: string
  room_number: string
  room_type: string
  capacity: number
  tariff: number
  guest_count: number
}

// API request types
export interface CreateReservationRequest {
  check_in_date: string;
  check_out_date: string;
  approx_check_in_time?: string;
  approx_check_out_time?: string;
  guest_count: number;
  guest_type: 'Individual' | 'Couple' | 'Family' | 'Friends';
  guests: Omit<Guest, 'id' | 'reservation_id' | 'created_at' | 'updated_at'>[];
  allocated_rooms: RoomAllocation[];
  special_charges?: {
    charge_id: string;
    custom_rate?: number;
    custom_description?: string;
    quantity?: number;
  }[];
  percentage_discount?: number;
  fixed_discount?: number;
}

export interface UpdateReservationRequest {
  status?: Reservation['status'];
  guest_feedback?: string;
  advance_payment?: number;
  balance_payment?: number;
  payment_status?: Reservation['payment_status'];
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  check_in_date?: string;
  check_out_date?: string;
  guest_count?: number;
  total_price?: number;
  total_quote?: number;
  percentage_discount?: number;
  fixed_discount?: number;
}

export interface CreatePaymentRequest {
  reservation_id: string;
  amount: number;
  payment_type: 'advance' | 'balance' | 'full';
  payment_method: 'qr_jubair' | 'qr_basha' | 'cash' | 'mixed';
  receipt_number?: string;
  notes?: string;
}

export interface UploadDocumentRequest {
  reservation_id: string;
  document_type: 'aadhar' | 'driving_license' | 'voter_id' | 'passport' | 'other';
  file: File;
}

// Utility types
export interface ReservationStats {
  total_reservations: number;
  pending_reservations: number;
  confirmed_reservations: number;
  checked_in_reservations: number;
  checked_out_reservations: number;
  cancelled_reservations: number;
  total_revenue: number;
  advance_payments: number;
  pending_payments: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalBookings: number;
  advancePayments: number;
  pendingPayments: number;
  netRevenue: number;
  averageBookingValue: number;
  paymentCollectionRate: number;
  period?: string;
  startDate?: string;
  endDate?: string;
}

export interface SearchFilters {
  reference_number?: string;
  phone?: string;
  guest_name?: string;
  status?: Reservation['status'];
  check_in_date_from?: string;
  check_in_date_to?: string;
  payment_status?: Reservation['payment_status'];
} 