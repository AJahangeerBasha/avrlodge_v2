# AVR Lodge v2 - Firebase Database Schema

*Generated on: 2025-09-21T17:06:57.295Z*

This document provides a comprehensive overview of all Firebase Firestore collections and their data structures as JavaScript objects. This serves as a reference equivalent to `db.sql` for relational databases.

## Collections Overview

The AVR Lodge v2 system uses Firebase Firestore with 14 main collections:

1. **agents** - Travel agents and partners
2. **guestAudits** - Audit trail for guest data changes
3. **guests** - Guest information and contact details
4. **paymentAudits** - Audit trail for payment changes
5. **payments** - Financial transactions and receipts
6. **receiptNumberCounters** - Auto-increment counters for receipt numbers
7. **referenceCounters** - Auto-increment counters for reservation references
8. **reservationRooms** - Room assignments for reservations
9. **reservationSpecialCharges** - Additional charges linked to reservations
10. **reservations** - Main booking/reservation records
11. **roomCheckinDocumentAudits** - Audit trail for document changes
12. **roomCheckinDocuments** - Guest identity documents
13. **roomTypes** - Room category definitions
14. **rooms** - Individual room records

---

## Collection Schemas

### 1. agents Collection

```javascript
{
  // Document ID: auto-generated string
    "id": "agent123",
    "name": "John Travel Services",
    "phoneNumber": "+91-9876543210",
    "whatsAppNumber": "+91-9876543210",
    "agentType": "individual",
    "email": "john@travelservices.com",
    "state": "Karnataka",
    "district": "Bangalore Urban",
    "companyName": "John Travel Services Pvt Ltd",
    "profileImageUrl": "https://storage.url/profile.jpg",
    "addressProof": "https://storage.url/address.pdf",
    "status": "active",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "createdBy": "user_uid_123",
    "updatedBy": "user_uid_123"
}
```

### 2. guestAudits Collection

```javascript
{
  // Document ID: auto-generated string
    "guestId": "guest_123",
    "action": "created",
    "performedBy": "user_uid_123",
    "performedAt": "2025-01-15T10:30:00.000Z",
    "details": {
      "operation": "primary_guest_changed",
      "reason": "Guest designation updated"
    },
    "previousValues": {
      "isPrimaryGuest": false,
      "name": "Old Name"
    },
    "newValues": {
      "isPrimaryGuest": true,
      "name": "New Name"
    }
}
```

### 3. guests Collection

```javascript
{
  // Document ID: auto-generated string
    "id": "guest_123",
    "reservationId": "reservation_456",
    "name": "John Doe",
    "phone": "+91-9876543210",
    "whatsapp": "+91-9876543210",
    "telegram": "@johndoe",
    "pincode": "560001",
    "state": "Karnataka",
    "district": "Bangalore Urban",
    "isPrimaryGuest": true,
    "createdBy": "user_uid_123",
    "updatedBy": "user_uid_123",
    "deletedBy": "user_uid_123",
    "deletedAt": "2025-01-15T10:30:00.000Z",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### 4. paymentAudits Collection

```javascript
{
  // Document ID: auto-generated string
    "paymentId": "payment_123",
    "action": "created",
    "performedBy": "user_uid_123",
    "performedAt": "2025-01-15T10:30:00.000Z",
    "details": {
      "operation": "payment_refunded",
      "refundAmount": 5000,
      "reason": "Cancellation"
    },
    "previousValues": {
      "paymentStatus": "completed",
      "amount": 10000
    },
    "newValues": {
      "paymentStatus": "refunded",
      "amount": 5000
    }
}
```

### 5. payments Collection

```javascript
{
  // Document ID: auto-generated string
    "id": "payment_123",
    "reservationId": "reservation_456",
    "amount": 10000,
    "paymentType": "booking_advance",
    "paymentMethod": "upi",
    "receiptNumber": "PAY-012025-00001",
    "paymentStatus": "completed",
    "transactionId": "TXN123456789",
    "gatewayResponse": "Success - Payment completed",
    "notes": "Advance payment for booking",
    "createdBy": "user_uid_123",
    "updatedBy": "user_uid_123",
    "deletedBy": "user_uid_123",
    "deletedAt": "2025-01-15T10:30:00.000Z",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "paymentDate": "2025-01-15T10:30:00.000Z"
}
```

### 6. receiptNumberCounters Collection

```javascript
{
  // Document ID: auto-generated string
    "id": "012025",
    "counter": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### 7. referenceCounters Collection

```javascript
{
  // Document ID: auto-generated string
    "id": "012025",
    "counter": 1,
    "month": 1,
    "year": 2025,
    "lastUpdated": "2025-01-15T10:30:00.000Z"
}
```

### 8. reservationRooms Collection

```javascript
{
  // Document ID: auto-generated string
    "id": "resroom_123",
    "reservationId": "reservation_456",
    "roomId": "room_789",
    "roomNumber": "101",
    "roomType": "Couple's Cove",
    "guestCount": 2,
    "tariffPerNight": 1200,
    "roomStatus": "checked_in",
    "checkInDatetime": "2025-01-15T14:00:00.000Z",
    "checkOutDatetime": "2025-01-17T11:00:00.000Z",
    "checkedInBy": "user_uid_123",
    "checkedOutBy": "user_uid_123",
    "checkInNotes": "Early check-in requested",
    "checkOutNotes": "Late check-out approved",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "deletedAt": "2025-01-15T10:30:00.000Z",
    "createdBy": "user_uid_123",
    "updatedBy": "user_uid_123",
    "deletedBy": "user_uid_123"
}
```

### 9. reservationSpecialCharges Collection

```javascript
{
  // Document ID: auto-generated string
    "id": "rescharge_123",
    "reservationId": "reservation_456",
    "specialChargeId": "charge_789",
    "quantity": 2,
    "customRate": 175,
    "customDescription": "Premium campfire setup",
    "totalAmount": 350,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "createdBy": "user_uid_123",
    "updatedBy": "user_uid_123",
    "deletedAt": "2025-01-15T10:30:00.000Z",
    "deletedBy": "user_uid_123"
}
```

### 10. reservations Collection

```javascript
{
  // Document ID: auto-generated string
    "id": "reservation_123",
    "roomId": "room_456",
    "checkInDate": "2025-01-15",
    "checkOutDate": "2025-01-17",
    "guestCount": 4,
    "specialRequests": "Late check-in required",
    "referenceNumber": "012025-001",
    "approxCheckInTime": "14:00",
    "approxCheckOutTime": "11:00",
    "guestType": "family",
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "guestPhone": "+91-9876543210",
    "percentageDiscount": 10,
    "fixedDiscount": 500,
    "totalQuote": 4400,
    "roomTariff": 2400,
    "advancePayment": 2000,
    "balancePayment": 1900,
    "totalPrice": 3900,
    "agentId": "agent_789",
    "agentCommission": 390,
    "status": "checked_in",
    "paymentStatus": "partial",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "deletedAt": "2025-01-15T10:30:00.000Z",
    "createdBy": "user_uid_123",
    "updatedBy": "user_uid_123",
    "deletedBy": "user_uid_123"
}
```

### 11. roomCheckinDocumentAudits Collection

```javascript
{
  // Document ID: auto-generated string
    "documentId": "document_123",
    "action": "created",
    "performedBy": "user_uid_123",
    "performedAt": "2025-01-15T10:30:00.000Z",
    "details": {
      "operation": "document_uploaded",
      "fileName": "aadhar_card.jpg",
      "fileSize": 1024000
    }
}
```

### 12. roomCheckinDocuments Collection

```javascript
{
  // Document ID: auto-generated string
    "id": "document_123",
    "reservationId": "reservation_456",
    "roomId": "room_789",
    "documentType": "aadhar",
    "fileUrl": "https://storage.supabase.co/bucket/room-documents/path/file.jpg",
    "fileName": "aadhar_card_john_doe.jpg",
    "uploadedAt": "2025-01-15T10:30:00.000Z",
    "uploadedBy": "user_uid_123",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "createdBy": "user_uid_123",
    "updatedBy": "user_uid_123",
    "deletedBy": "user_uid_123",
    "deletedAt": "2025-01-15T10:30:00.000Z"
}
```

### 13. roomTypes Collection

```javascript
{
  // Document ID: auto-generated string
    "id": "roomtype_123",
    "name": "Couple's Cove",
    "pricePerNight": 1200,
    "maxGuests": 2,
    "numberOfRooms": 4,
    "description": "Perfect for couples seeking privacy and comfort",
    "amenities": [
      "Air Conditioning",
      "Private Bathroom",
      "Wi-Fi",
      "Television",
      "Mini Fridge"
    ],
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "deletedAt": "2025-01-15T10:30:00.000Z",
    "createdBy": "user_uid_123",
    "updatedBy": "user_uid_123",
    "deletedBy": "user_uid_123"
}
```

### 14. rooms Collection

```javascript
{
  // Document ID: auto-generated string
    "id": "room_123",
    "roomNumber": "101",
    "roomTypeId": "roomtype_456",
    "floorNumber": 1,
    "isActive": true,
    "status": "available",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z",
    "deletedAt": "2025-01-15T10:30:00.000Z",
    "createdBy": "user_uid_123",
    "updatedBy": "user_uid_123",
    "deletedBy": "user_uid_123"
}
```

---

## Data Relationships

### Primary Relationships

1. **reservations** ↔ **reservationRooms** (One-to-Many)
   - A reservation can have multiple room assignments
   - Each room assignment belongs to one reservation

2. **reservations** ↔ **guests** (One-to-Many)
   - A reservation can have multiple guests
   - Each guest is linked to one reservation (or standalone)

3. **reservations** ↔ **payments** (One-to-Many)
   - A reservation can have multiple payments
   - Each payment is linked to one reservation (or standalone)

4. **reservations** ↔ **reservationSpecialCharges** (One-to-Many)
   - A reservation can have multiple special charges
   - Each special charge is linked to one reservation

5. **reservations** ↔ **roomCheckinDocuments** (One-to-Many)
   - A reservation can have multiple documents
   - Each document is linked to one reservation and room

6. **rooms** ↔ **roomTypes** (Many-to-One)
   - Multiple rooms can belong to one room type
   - Each room belongs to one room type

7. **reservations** ↔ **agents** (Many-to-One)
   - Multiple reservations can be created by one agent
   - Each reservation can be linked to one agent (optional)

### Audit Trails

Each main entity has corresponding audit collections:
- **guests** → **guestAudits**
- **payments** → **paymentAudits**
- **roomCheckinDocuments** → **roomCheckinDocumentAudits**

### Reference Counters

Auto-increment counters for unique number generation:
- **referenceCounters** → Generates reservation reference numbers (MMYYYY-XXX)
- **receiptNumberCounters** → Generates payment receipt numbers (PAY-MMYYYY-XXXXX)

---

## Data Types & Enums

### Common Enums

```javascript
// ReservationStatus
ReservationStatus = "reservation" | "booking" | "checked_in" | "checked_out" | "cancelled"

// PaymentStatus
PaymentStatus = "pending" | "partial" | "paid"

// PaymentType
PaymentType = "booking_advance" | "full_payment" | "partial_payment" | "security_deposit" | "additional_charges" | "refund" | "cancellation_fee" | "extra_services"

// PaymentMethod
PaymentMethod = "cash" | "card" | "upi" | "net_banking" | "wallet" | "bank_transfer" | "cheque" | "other"

// PaymentTransactionStatus
PaymentTransactionStatus = "pending" | "completed" | "failed" | "refunded" | "cancelled"

// RoomStatus
RoomStatus = "available" | "occupied" | "maintenance" | "reserved"

// ReservationRoomStatus
ReservationRoomStatus = "pending" | "checked_in" | "checked_out" | "cancelled" | "no_show"

// GuestType
GuestType = "individual" | "family" | "friends" | "couple" | "Individual" | "Family" | "Friends" | "Couple"

// AgentType
AgentType = "individual" | "company"

// AgentStatus
AgentStatus = "active" | "inactive" | "suspended"

// DocumentType
DocumentType = "aadhar" | "driving_license" | "voter_id" | "passport" | "pan_card" | "other"

// AuditAction
AuditAction = "created" | "updated" | "deleted" | "restored" | "primary_changed" | "refunded" | "cancelled"

```

### Common Fields

All collections include these standard fields:
- `id: string (document identifier)`
- `createdAt: ISO timestamp string`
- `updatedAt: ISO timestamp string`
- `createdBy: user UID string`
- `updatedBy: user UID string`

Soft delete fields (optional):
- `deletedAt: ISO timestamp string (optional)`
- `deletedBy: user UID string (optional)`

---

## Business Rules

### Reference Number Generation
- Format: `MMYYYY-XXX (e.g., '012025-001')`
- Monthly reset with auto-increment counter
- Stored in `referenceCounters collection`

### Receipt Number Generation
- Format: `PAY-MMYYYY-XXXXX (e.g., 'PAY-012025-00001')`
- Monthly reset with auto-increment counter
- Stored in `receiptNumberCounters collection`

### Soft Delete Pattern
- Records are never permanently deleted
- `deletedAt timestamp marks deletion, deletedBy tracks who deleted`
- Queries filter out deleted records client-side

### Payment Constraints
- cash: ₹2,00,000 maximum
- upi: ₹1,00,000 maximum
- cardProcessingFee: 2%
- netBankingProcessingFee: 1%

### Document Upload Rules
- max file size: 5MB
- supported formats: JPG, PNG, PDF
- max documents per room: 20
- storage: Supabase Storage bucket: 'room-documents'

---

## Storage Integration

### Supabase Storage
- **Bucket**: `room-documents`
- **File Path Structure**: `reservations/{reservationId}/{roomId}/filename.ext`
- **Access**: Private with public URL generation
- **File URLs**: Stored as complete URLs in `roomCheckinDocuments.fileUrl`

### Firebase Authentication
- **User Management**: Email/password + Google OAuth
- **Role Storage**: Stored in Firestore `/users` collection
- **Roles**: guest, manager, admin

---

*This schema serves as the complete reference for the AVR Lodge v2 Firebase database structure. All collections follow consistent patterns for auditing, soft deletes, and relationship management.*

**Generated by**: `npm run generate-schema`  
**Last Updated**: 2025-09-21T17:06:57.295Z  
**Version**: 2.0  
