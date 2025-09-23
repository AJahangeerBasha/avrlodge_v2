#!/usr/bin/env node

/**
 * AVR Lodge v2 - Database Schema Generator
 *
 * This script generates comprehensive database schema documentation
 * by reading TypeScript type definitions and creating a markdown file
 * with JavaScript object examples for all Firebase collections.
 *
 * Usage: npm run generate-schema
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  outputFile: 'DATABASE_SCHEMA.md',
  typeDefinitionsPath: 'src/lib/types',
  rootPath: process.cwd()
};

// Firebase Collections Schema
const COLLECTIONS_SCHEMA = {
  agents: {
    description: "Travel agents and partners",
    example: {
      id: "agent123",
      name: "John Travel Services",
      phoneNumber: "+91-9876543210",
      whatsAppNumber: "+91-9876543210", // optional
      agentType: "individual", // "individual" | "company"
      email: "john@travelservices.com", // optional
      state: "Karnataka",
      district: "Bangalore Urban",
      companyName: "John Travel Services Pvt Ltd", // optional, for company type
      profileImageUrl: "https://storage.url/profile.jpg", // optional
      addressProof: "https://storage.url/address.pdf", // optional
      status: "active", // "active" | "inactive" | "suspended"
      createdAt: "2025-01-15T10:30:00.000Z",
      updatedAt: "2025-01-15T10:30:00.000Z",
      createdBy: "user_uid_123",
      updatedBy: "user_uid_123"
    }
  },

  guestAudits: {
    description: "Audit trail for guest data changes",
    example: {
      guestId: "guest_123",
      action: "created", // "created" | "updated" | "deleted" | "restored" | "primary_changed"
      performedBy: "user_uid_123",
      performedAt: "2025-01-15T10:30:00.000Z",
      details: {
        operation: "primary_guest_changed",
        reason: "Guest designation updated"
      }, // optional
      previousValues: {
        isPrimaryGuest: false,
        name: "Old Name"
      }, // optional
      newValues: {
        isPrimaryGuest: true,
        name: "New Name"
      } // optional
    }
  },

  guests: {
    description: "Guest information and contact details",
    example: {
      id: "guest_123",
      reservationId: "reservation_456", // optional, can be null for standalone guests
      name: "John Doe",
      phone: "+91-9876543210",
      whatsapp: "+91-9876543210", // optional
      telegram: "@johndoe", // optional
      pincode: "560001", // 6-digit Indian pincode, optional
      state: "Karnataka", // Indian state, optional
      district: "Bangalore Urban", // District within state, optional
      isPrimaryGuest: true,
      createdBy: "user_uid_123",
      updatedBy: "user_uid_123",
      deletedBy: "user_uid_123", // optional, for soft delete
      deletedAt: "2025-01-15T10:30:00.000Z", // optional, ISO timestamp for soft delete
      createdAt: "2025-01-15T10:30:00.000Z",
      updatedAt: "2025-01-15T10:30:00.000Z"
    }
  },

  paymentAudits: {
    description: "Audit trail for payment changes",
    example: {
      paymentId: "payment_123",
      action: "created", // "created" | "updated" | "deleted" | "refunded" | "cancelled"
      performedBy: "user_uid_123",
      performedAt: "2025-01-15T10:30:00.000Z",
      details: {
        operation: "payment_refunded",
        refundAmount: 5000,
        reason: "Cancellation"
      }, // optional
      previousValues: {
        paymentStatus: "completed",
        amount: 10000
      }, // optional
      newValues: {
        paymentStatus: "refunded",
        amount: 5000
      } // optional
    }
  },

  payments: {
    description: "Financial transactions and receipts",
    example: {
      id: "payment_123",
      reservationId: "reservation_456", // optional, can be null for standalone payments
      amount: 10000, // Amount in rupees
      paymentType: "booking_advance", // "booking_advance" | "full_payment" | "partial_payment" | "security_deposit" | "additional_charges" | "refund" | "cancellation_fee" | "extra_services"
      paymentMethod: "upi", // "cash" | "card" | "upi" | "net_banking" | "wallet" | "bank_transfer" | "cheque" | "other"
      receiptNumber: "PAY-012025-00001", // Auto-generated format: PAY-MMYYYY-XXXXX
      paymentStatus: "completed", // "pending" | "completed" | "failed" | "refunded" | "cancelled"
      transactionId: "TXN123456789", // optional, external transaction reference
      gatewayResponse: "Success - Payment completed", // optional, payment gateway response
      notes: "Advance payment for booking", // optional
      createdBy: "user_uid_123",
      updatedBy: "user_uid_123",
      deletedBy: "user_uid_123", // optional, for soft delete
      deletedAt: "2025-01-15T10:30:00.000Z", // optional, ISO timestamp for soft delete
      createdAt: "2025-01-15T10:30:00.000Z",
      updatedAt: "2025-01-15T10:30:00.000Z",
      paymentDate: "2025-01-15T10:30:00.000Z" // ISO timestamp - when payment was actually made
    }
  },

  receiptNumberCounters: {
    description: "Auto-increment counters for receipt numbers",
    example: {
      id: "012025", // January 2025
      counter: 1, // Incremental counter for PAY-MMYYYY-XXXXX format
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-15T10:30:00.000Z"
    }
  },

  referenceCounters: {
    description: "Auto-increment counters for reservation references",
    example: {
      id: "012025", // January 2025
      counter: 1, // Incremental counter
      month: 1, // January (1-12)
      year: 2025,
      lastUpdated: "2025-01-15T10:30:00.000Z"
    }
  },

  reservationRooms: {
    description: "Room assignments for reservations",
    example: {
      id: "resroom_123",
      reservationId: "reservation_456",
      roomId: "room_789",
      roomNumber: "101",
      roomType: "Couple's Cove",
      guestCount: 2, // Number of guests assigned to this room
      tariffPerNight: 1200, // Room tariff per night
      roomStatus: "checked_in", // "pending" | "checked_in" | "checked_out" | "cancelled" | "no_show"
      checkInDatetime: "2025-01-15T14:00:00.000Z", // optional, actual check-in time
      checkOutDatetime: "2025-01-17T11:00:00.000Z", // optional, actual check-out time
      checkedInBy: "user_uid_123", // optional, user who performed check-in
      checkedOutBy: "user_uid_123", // optional, user who performed check-out
      checkInNotes: "Early check-in requested", // optional
      checkOutNotes: "Late check-out approved", // optional
      createdAt: "2025-01-15T10:30:00.000Z",
      updatedAt: "2025-01-15T10:30:00.000Z",
      deletedAt: "2025-01-15T10:30:00.000Z", // optional, for soft delete
      createdBy: "user_uid_123",
      updatedBy: "user_uid_123",
      deletedBy: "user_uid_123" // optional, for soft delete
    }
  },

  reservationSpecialCharges: {
    description: "Additional charges linked to reservations",
    example: {
      id: "rescharge_123",
      reservationId: "reservation_456",
      specialChargeId: "charge_789",
      quantity: 2, // Number of units (e.g., 2 campfires)
      customRate: 175, // optional, overrides defaultRate if provided
      customDescription: "Premium campfire setup", // optional
      totalAmount: 350, // Calculated: quantity * (customRate || defaultRate)
      createdAt: "2025-01-15T10:30:00.000Z",
      updatedAt: "2025-01-15T10:30:00.000Z",
      createdBy: "user_uid_123",
      updatedBy: "user_uid_123",
      deletedAt: "2025-01-15T10:30:00.000Z", // optional, for soft delete
      deletedBy: "user_uid_123" // optional, for soft delete
    }
  },

  reservations: {
    description: "Main booking/reservation records",
    example: {
      id: "reservation_123",
      roomId: "room_456", // Initial room assignment
      checkInDate: "2025-01-15", // ISO date string (YYYY-MM-DD)
      checkOutDate: "2025-01-17", // ISO date string (YYYY-MM-DD)
      guestCount: 4,
      specialRequests: "Late check-in required", // optional
      referenceNumber: "012025-001", // Auto-generated format: MMYYYY-XXX
      approxCheckInTime: "14:00", // optional, HH:MM format
      approxCheckOutTime: "11:00", // optional, HH:MM format
      guestType: "family", // optional, "individual" | "family" | "friends" | "couple" | "Individual" | "Family" | "Friends" | "Couple"
      guestName: "John Doe", // optional, guest name stored in reservation
      guestEmail: "john@example.com", // optional, guest email stored in reservation
      guestPhone: "+91-9876543210", // optional, guest phone stored in reservation
      percentageDiscount: 10, // 0-100, percentage discount applied
      fixedDiscount: 500, // Fixed amount discount in rupees
      totalQuote: 4400, // Total quoted amount before discounts
      roomTariff: 2400, // Base room charges (nights * rate)
      advancePayment: 2000, // Advance payment amount
      balancePayment: 1900, // Remaining balance amount
      totalPrice: 3900, // Final amount after discounts (totalQuote - discounts)
      agentId: "agent_789", // optional, reference to agent document ID
      agentCommission: 390, // optional, commission amount in currency
      status: "checked_in", // "reservation" | "booking" | "checked_in" | "checked_out" | "cancelled"
      paymentStatus: "partial", // "pending" | "partial" | "paid"
      createdAt: "2025-01-15T10:30:00.000Z",
      updatedAt: "2025-01-15T10:30:00.000Z",
      deletedAt: "2025-01-15T10:30:00.000Z", // optional, for soft delete
      createdBy: "user_uid_123",
      updatedBy: "user_uid_123",
      deletedBy: "user_uid_123" // optional, for soft delete
    }
  },

  roomCheckinDocumentAudits: {
    description: "Audit trail for document changes",
    example: {
      documentId: "document_123",
      action: "created", // "created" | "updated" | "deleted" | "restored"
      performedBy: "user_uid_123",
      performedAt: "2025-01-15T10:30:00.000Z",
      details: {
        operation: "document_uploaded",
        fileName: "aadhar_card.jpg",
        fileSize: 1024000
      } // optional
    }
  },

  roomCheckinDocuments: {
    description: "Guest identity documents",
    example: {
      id: "document_123",
      reservationId: "reservation_456",
      roomId: "room_789",
      documentType: "aadhar", // "aadhar" | "driving_license" | "voter_id" | "passport" | "pan_card" | "other"
      fileUrl: "https://storage.supabase.co/bucket/room-documents/path/file.jpg",
      fileName: "aadhar_card_john_doe.jpg",
      uploadedAt: "2025-01-15T10:30:00.000Z", // ISO timestamp
      uploadedBy: "user_uid_123", // optional, user ID who uploaded the document
      createdAt: "2025-01-15T10:30:00.000Z",
      updatedAt: "2025-01-15T10:30:00.000Z",
      createdBy: "user_uid_123",
      updatedBy: "user_uid_123",
      deletedBy: "user_uid_123", // optional, for soft delete
      deletedAt: "2025-01-15T10:30:00.000Z" // optional, ISO timestamp for soft delete
    }
  },

  roomTypes: {
    description: "Room category definitions",
    example: {
      id: "roomtype_123",
      name: "Couple's Cove",
      pricePerNight: 1200, // Price in rupees per night
      maxGuests: 2, // Maximum number of guests allowed
      numberOfRooms: 4, // Total number of rooms of this type
      description: "Perfect for couples seeking privacy and comfort", // optional
      amenities: [
        "Air Conditioning",
        "Private Bathroom",
        "Wi-Fi",
        "Television",
        "Mini Fridge"
      ], // Array of amenity strings
      isActive: true, // Whether this room type is currently active
      createdAt: "2025-01-15T10:30:00.000Z",
      updatedAt: "2025-01-15T10:30:00.000Z",
      deletedAt: "2025-01-15T10:30:00.000Z", // optional, for soft delete
      createdBy: "user_uid_123",
      updatedBy: "user_uid_123",
      deletedBy: "user_uid_123" // optional, for soft delete
    }
  },

  rooms: {
    description: "Individual room records",
    example: {
      id: "room_123",
      roomNumber: "101",
      roomTypeId: "roomtype_456", // Reference to roomTypes collection
      floorNumber: 1, // optional, floor number
      isActive: true, // Whether room is active/available for booking
      status: "available", // "available" | "occupied" | "maintenance" | "reserved"
      createdAt: "2025-01-15T10:30:00.000Z",
      updatedAt: "2025-01-15T10:30:00.000Z",
      deletedAt: "2025-01-15T10:30:00.000Z", // optional, for soft delete
      createdBy: "user_uid_123",
      updatedBy: "user_uid_123",
      deletedBy: "user_uid_123" // optional, for soft delete
    }
  }
};

// Enums and Data Types
const DATA_TYPES = {
  enums: {
    ReservationStatus: ["reservation", "booking", "checked_in", "checked_out", "cancelled"],
    PaymentStatus: ["pending", "partial", "paid"],
    PaymentType: ["booking_advance", "full_payment", "partial_payment", "security_deposit", "additional_charges", "refund", "cancellation_fee", "extra_services"],
    PaymentMethod: ["cash", "card", "upi", "net_banking", "wallet", "bank_transfer", "cheque", "other"],
    PaymentTransactionStatus: ["pending", "completed", "failed", "refunded", "cancelled"],
    RoomStatus: ["available", "occupied", "maintenance", "reserved"],
    ReservationRoomStatus: ["pending", "checked_in", "checked_out", "cancelled", "no_show"],
    GuestType: ["individual", "family", "friends", "couple", "Individual", "Family", "Friends", "Couple"],
    AgentType: ["individual", "company"],
    AgentStatus: ["active", "inactive", "suspended"],
    DocumentType: ["aadhar", "driving_license", "voter_id", "passport", "pan_card", "other"],
    AuditAction: ["created", "updated", "deleted", "restored", "primary_changed", "refunded", "cancelled"]
  },
  commonFields: [
    "id: string (document identifier)",
    "createdAt: ISO timestamp string",
    "updatedAt: ISO timestamp string",
    "createdBy: user UID string",
    "updatedBy: user UID string"
  ],
  softDeleteFields: [
    "deletedAt: ISO timestamp string (optional)",
    "deletedBy: user UID string (optional)"
  ]
};

// Business Rules and Constraints
const BUSINESS_RULES = {
  referenceNumbers: {
    format: "MMYYYY-XXX (e.g., '012025-001')",
    description: "Monthly reset with auto-increment counter",
    storage: "referenceCounters collection"
  },
  receiptNumbers: {
    format: "PAY-MMYYYY-XXXXX (e.g., 'PAY-012025-00001')",
    description: "Monthly reset with auto-increment counter",
    storage: "receiptNumberCounters collection"
  },
  softDelete: {
    pattern: "Records are never permanently deleted",
    implementation: "deletedAt timestamp marks deletion, deletedBy tracks who deleted",
    querying: "Queries filter out deleted records client-side"
  },
  paymentConstraints: {
    cash: "₹2,00,000 maximum",
    upi: "₹1,00,000 maximum",
    cardProcessingFee: "2%",
    netBankingProcessingFee: "1%"
  },
  documentUpload: {
    maxFileSize: "5MB",
    supportedFormats: "JPG, PNG, PDF",
    maxDocumentsPerRoom: "20",
    storage: "Supabase Storage bucket: 'room-documents'"
  }
};

/**
 * Generate the complete database schema markdown content
 */
function generateSchemaContent() {
  const timestamp = new Date().toISOString();

  let content = `# AVR Lodge v2 - Firebase Database Schema

*Generated on: ${timestamp}*

This document provides a comprehensive overview of all Firebase Firestore collections and their data structures as JavaScript objects. This serves as a reference equivalent to \`db.sql\` for relational databases.

## Collections Overview

The AVR Lodge v2 system uses Firebase Firestore with ${Object.keys(COLLECTIONS_SCHEMA).length} main collections:

`;

  // Add collections list
  Object.entries(COLLECTIONS_SCHEMA).forEach(([name, info], index) => {
    content += `${index + 1}. **${name}** - ${info.description}\n`;
  });

  content += `\n---\n\n## Collection Schemas\n\n`;

  // Generate each collection schema
  Object.entries(COLLECTIONS_SCHEMA).forEach(([collectionName, info], index) => {
    content += `### ${index + 1}. ${collectionName} Collection\n\n`;
    content += `\`\`\`javascript\n`;
    content += `{\n  // Document ID: auto-generated string\n`;

    // Format the example object
    const formattedExample = JSON.stringify(info.example, null, 2)
      .split('\n')
      .slice(1, -1) // Remove opening and closing braces
      .map(line => `  ${line}`)
      .join('\n');

    content += formattedExample;
    content += `\n}\n\`\`\`\n\n`;
  });

  // Add relationships section
  content += `---\n\n## Data Relationships\n\n`;
  content += `### Primary Relationships\n\n`;
  content += `1. **reservations** ↔ **reservationRooms** (One-to-Many)\n`;
  content += `   - A reservation can have multiple room assignments\n`;
  content += `   - Each room assignment belongs to one reservation\n\n`;
  content += `2. **reservations** ↔ **guests** (One-to-Many)\n`;
  content += `   - A reservation can have multiple guests\n`;
  content += `   - Each guest is linked to one reservation (or standalone)\n\n`;
  content += `3. **reservations** ↔ **payments** (One-to-Many)\n`;
  content += `   - A reservation can have multiple payments\n`;
  content += `   - Each payment is linked to one reservation (or standalone)\n\n`;
  content += `4. **reservations** ↔ **reservationSpecialCharges** (One-to-Many)\n`;
  content += `   - A reservation can have multiple special charges\n`;
  content += `   - Each special charge is linked to one reservation\n\n`;
  content += `5. **reservations** ↔ **roomCheckinDocuments** (One-to-Many)\n`;
  content += `   - A reservation can have multiple documents\n`;
  content += `   - Each document is linked to one reservation and room\n\n`;
  content += `6. **rooms** ↔ **roomTypes** (Many-to-One)\n`;
  content += `   - Multiple rooms can belong to one room type\n`;
  content += `   - Each room belongs to one room type\n\n`;
  content += `7. **reservations** ↔ **agents** (Many-to-One)\n`;
  content += `   - Multiple reservations can be created by one agent\n`;
  content += `   - Each reservation can be linked to one agent (optional)\n\n`;

  // Add audit trails
  content += `### Audit Trails\n\n`;
  content += `Each main entity has corresponding audit collections:\n`;
  content += `- **guests** → **guestAudits**\n`;
  content += `- **payments** → **paymentAudits**\n`;
  content += `- **roomCheckinDocuments** → **roomCheckinDocumentAudits**\n\n`;

  // Add reference counters
  content += `### Reference Counters\n\n`;
  content += `Auto-increment counters for unique number generation:\n`;
  content += `- **referenceCounters** → Generates reservation reference numbers (MMYYYY-XXX)\n`;
  content += `- **receiptNumberCounters** → Generates payment receipt numbers (PAY-MMYYYY-XXXXX)\n\n`;

  // Add data types and enums
  content += `---\n\n## Data Types & Enums\n\n`;
  content += `### Common Enums\n\n`;
  content += `\`\`\`javascript\n`;

  Object.entries(DATA_TYPES.enums).forEach(([enumName, values]) => {
    content += `// ${enumName}\n`;
    content += `${enumName} = ${values.map(v => `"${v}"`).join(' | ')}\n\n`;
  });

  content += `\`\`\`\n\n`;

  // Add common fields
  content += `### Common Fields\n\n`;
  content += `All collections include these standard fields:\n`;
  DATA_TYPES.commonFields.forEach(field => {
    content += `- \`${field}\`\n`;
  });
  content += `\nSoft delete fields (optional):\n`;
  DATA_TYPES.softDeleteFields.forEach(field => {
    content += `- \`${field}\`\n`;
  });

  // Add business rules
  content += `\n---\n\n## Business Rules\n\n`;

  content += `### Reference Number Generation\n`;
  content += `- Format: \`${BUSINESS_RULES.referenceNumbers.format}\`\n`;
  content += `- ${BUSINESS_RULES.referenceNumbers.description}\n`;
  content += `- Stored in \`${BUSINESS_RULES.referenceNumbers.storage}\`\n\n`;

  content += `### Receipt Number Generation\n`;
  content += `- Format: \`${BUSINESS_RULES.receiptNumbers.format}\`\n`;
  content += `- ${BUSINESS_RULES.receiptNumbers.description}\n`;
  content += `- Stored in \`${BUSINESS_RULES.receiptNumbers.storage}\`\n\n`;

  content += `### Soft Delete Pattern\n`;
  content += `- ${BUSINESS_RULES.softDelete.pattern}\n`;
  content += `- \`${BUSINESS_RULES.softDelete.implementation}\`\n`;
  content += `- ${BUSINESS_RULES.softDelete.querying}\n\n`;

  content += `### Payment Constraints\n`;
  Object.entries(BUSINESS_RULES.paymentConstraints).forEach(([key, value]) => {
    content += `- ${key}: ${value}\n`;
  });

  content += `\n### Document Upload Rules\n`;
  Object.entries(BUSINESS_RULES.documentUpload).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
    content += `- ${label}: ${value}\n`;
  });

  // Add storage integration
  content += `\n---\n\n## Storage Integration\n\n`;
  content += `### Supabase Storage\n`;
  content += `- **Bucket**: \`room-documents\`\n`;
  content += `- **File Path Structure**: \`reservations/{reservationId}/{roomId}/filename.ext\`\n`;
  content += `- **Access**: Private with public URL generation\n`;
  content += `- **File URLs**: Stored as complete URLs in \`roomCheckinDocuments.fileUrl\`\n\n`;

  content += `### Firebase Authentication\n`;
  content += `- **User Management**: Email/password + Google OAuth\n`;
  content += `- **Role Storage**: Stored in Firestore \`/users\` collection\n`;
  content += `- **Roles**: guest, manager, admin\n\n`;

  content += `---\n\n`;
  content += `*This schema serves as the complete reference for the AVR Lodge v2 Firebase database structure. All collections follow consistent patterns for auditing, soft deletes, and relationship management.*\n\n`;
  content += `**Generated by**: \`npm run generate-schema\`  \n`;
  content += `**Last Updated**: ${timestamp}  \n`;
  content += `**Version**: 2.0  \n`;

  return content;
}

/**
 * Write the schema to file
 */
function writeSchemaFile() {
  try {
    const outputPath = path.join(CONFIG.rootPath, CONFIG.outputFile);
    const content = generateSchemaContent();

    fs.writeFileSync(outputPath, content, 'utf8');

    console.log('✅ Database schema generated successfully!');
    console.log(`📄 File: ${CONFIG.outputFile}`);
    console.log(`📊 Collections: ${Object.keys(COLLECTIONS_SCHEMA).length}`);
    console.log(`📝 Size: ${(content.length / 1024).toFixed(2)}KB`);
    console.log(`🕐 Generated: ${new Date().toLocaleString()}`);

  } catch (error) {
    console.error('❌ Error generating database schema:', error.message);
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Generating AVR Lodge v2 Database Schema...');
  console.log('');

  writeSchemaFile();

  console.log('');
  console.log('📖 Usage:');
  console.log('  npm run generate-schema    # Generate schema documentation');
  console.log('  npm run update-schema      # Update existing schema');
  console.log('');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateSchemaContent,
  writeSchemaFile,
  COLLECTIONS_SCHEMA,
  DATA_TYPES,
  BUSINESS_RULES
};