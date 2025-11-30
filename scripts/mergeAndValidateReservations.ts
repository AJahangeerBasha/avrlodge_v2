import * as fs from 'fs';
import * as path from 'path';

interface ExtractedComment {
  roomNumber: string;
  date: string;
  comment: {
    agent: string;
    guestName: string;
    phone: string;
    payment: string;
    pax: string;
    otherRooms: string;
    notes: string;
    raw: string;
  };
}

interface Payment {
  amount: number;
  method: 'cash' | 'bashaQR' | 'jubairQR';
}

interface MergedReservation {
  checkInDate: string;
  checkOutDate: string; // Will be set to next day for now
  guestName: string;
  guestPhone: string;
  guestEmail: string; // Empty for now
  rooms: string[];
  payments: Payment[];
  status: 'reservation' | 'booking' | 'checked_in' | 'checked_out';
  notes: string;
  rawRecords: string[]; // For debugging
}

// Parse payment string into structured payments
function parsePayments(paymentStr: string): Payment[] {
  if (!paymentStr) return [];

  const payments: Payment[] = [];

  // Split by | to get individual payment entries
  const paymentEntries = paymentStr.split('|').map(p => p.trim());

  for (const entry of paymentEntries) {
    // Extract amount using regex: Rs. 2000 or Rs 2000
    const amountMatch = entry.match(/Rs\.?\s*(\d+)/i);
    if (!amountMatch) continue;

    const amount = parseInt(amountMatch[1]);

    // Determine payment method
    let method: 'cash' | 'bashaQR' | 'jubairQR' = 'cash';

    if (/jbqr/i.test(entry)) {
      method = 'bashaQR';
    } else if (/jubair.*qr/i.test(entry)) {
      method = 'jubairQR';
    } else if (/basha.*qr|basqr/i.test(entry)) {
      method = 'bashaQR';
    } else if (/cash/i.test(entry)) {
      method = 'cash';
    }

    payments.push({ amount, method });
  }

  return payments;
}

// Normalize phone number for comparison
function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, '').trim();
}

// Create a key for grouping reservations
function createGroupKey(record: ExtractedComment): string {
  const phone = normalizePhone(record.comment.phone);
  const name = record.comment.guestName.toLowerCase().trim();
  const date = record.date;
  const payment = record.comment.payment.toLowerCase().trim();

  return `${date}|${name}|${phone}|${payment}`;
}

// Check if a record refers to another room (e.g., "See 202")
function getReferenceRoom(record: ExtractedComment): string | null {
  const match = record.comment.notes.match(/See\s+(\d{3})/i);
  return match ? match[1] : null;
}

// Get all rooms mentioned in otherRooms field
function getOtherRooms(record: ExtractedComment): string[] {
  if (!record.comment.otherRooms) return [];

  return record.comment.otherRooms
    .split(',')
    .map(r => r.trim())
    .filter(r => /^\d{3}$/.test(r));
}

// Merge records into reservations
function mergeReservations(records: ExtractedComment[]): MergedReservation[] {
  const grouped = new Map<string, ExtractedComment[]>();
  const processedRooms = new Set<string>();
  const mergedReservations: MergedReservation[] = [];

  // First pass: group by key (date, name, phone, payment)
  for (const record of records) {
    // Skip if already processed
    if (processedRooms.has(`${record.date}-${record.roomNumber}`)) {
      continue;
    }

    // Check if this is a reference ("See XXX")
    const refRoom = getReferenceRoom(record);
    if (refRoom) {
      // Find the master record
      const masterKey = `${record.date}-${refRoom}`;
      processedRooms.add(`${record.date}-${record.roomNumber}`);
      continue; // Will be handled when processing the master
    }

    const key = createGroupKey(record);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(record);
  }

  // Second pass: merge grouped records
  for (const [key, recordGroup] of grouped.entries()) {
    // Collect all rooms for this reservation
    const rooms = new Set<string>();
    const notes: string[] = [];
    let primaryRecord = recordGroup[0];

    // Add all room numbers from the group
    for (const record of recordGroup) {
      rooms.add(record.roomNumber);
      processedRooms.add(`${record.date}-${record.roomNumber}`);

      // Also add rooms from otherRooms field
      const otherRooms = getOtherRooms(record);
      otherRooms.forEach(r => rooms.add(r));

      // Collect notes
      if (record.comment.notes && !record.comment.notes.startsWith('See')) {
        notes.push(record.comment.notes);
      }
    }

    // Now find all "See XXX" references to rooms in this reservation
    for (const record of records) {
      const refRoom = getReferenceRoom(record);
      if (refRoom && rooms.has(refRoom) && record.date === primaryRecord.date) {
        rooms.add(record.roomNumber);
        processedRooms.add(`${record.date}-${record.roomNumber}`);
      }
    }

    // Parse payments
    const payments = parsePayments(primaryRecord.comment.payment);

    // Calculate check-out date (next day)
    const checkInDate = new Date(primaryRecord.date);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 1);

    // Create merged reservation
    const mergedReservation: MergedReservation = {
      checkInDate: primaryRecord.date,
      checkOutDate: checkOutDate.toISOString().split('T')[0],
      guestName: primaryRecord.comment.guestName || 'Unknown',
      guestPhone: normalizePhone(primaryRecord.comment.phone),
      guestEmail: '', // Not available in the data
      rooms: Array.from(rooms).sort(),
      payments,
      status: payments.length > 0 ? 'booking' : 'reservation',
      notes: notes.join(' | '),
      rawRecords: recordGroup.map(r => `Room ${r.roomNumber}: ${r.comment.raw}`)
    };

    mergedReservations.push(mergedReservation);
  }

  return mergedReservations;
}

// Validate reservation against Firebase schema
function validateReservation(reservation: MergedReservation, index: number): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!reservation.checkInDate) {
    errors.push(`Reservation ${index}: Missing checkInDate`);
  }

  if (!reservation.checkOutDate) {
    errors.push(`Reservation ${index}: Missing checkOutDate`);
  }

  if (!reservation.guestName || reservation.guestName === 'Unknown') {
    errors.push(`Reservation ${index}: Missing or invalid guestName`);
  }

  if (!reservation.guestPhone) {
    errors.push(`Reservation ${index}: Missing guestPhone`);
  }

  if (!reservation.rooms || reservation.rooms.length === 0) {
    errors.push(`Reservation ${index}: No rooms assigned`);
  }

  // Validate phone number format (should be 10 digits for India)
  if (reservation.guestPhone && !/^\d{9,10}$/.test(reservation.guestPhone)) {
    warnings.push(`Reservation ${index}: Phone number "${reservation.guestPhone}" may be invalid (expected 9-10 digits)`);
  }

  // Validate dates
  if (reservation.checkInDate && reservation.checkOutDate) {
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);

    if (checkOut <= checkIn) {
      errors.push(`Reservation ${index}: Check-out date must be after check-in date`);
    }
  }

  // Validate status
  const validStatuses = ['reservation', 'booking', 'checked_in', 'checked_out'];
  if (!validStatuses.includes(reservation.status)) {
    errors.push(`Reservation ${index}: Invalid status "${reservation.status}"`);
  }

  // Validate payments
  if (reservation.payments.length > 0) {
    for (let i = 0; i < reservation.payments.length; i++) {
      const payment = reservation.payments[i];

      if (!payment.amount || payment.amount <= 0) {
        errors.push(`Reservation ${index}: Payment ${i + 1} has invalid amount`);
      }

      if (!['cash', 'bashaQR', 'jubairQR'].includes(payment.method)) {
        errors.push(`Reservation ${index}: Payment ${i + 1} has invalid method "${payment.method}"`);
      }
    }
  } else {
    warnings.push(`Reservation ${index}: No payments recorded`);
  }

  // Validate room numbers
  for (const room of reservation.rooms) {
    if (!/^\d{3}$/.test(room)) {
      errors.push(`Reservation ${index}: Invalid room number "${room}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Main function
async function main() {
  console.log('Reading extracted-comments.json...');

  const jsonPath = path.join(__dirname, '../import/extracted-comments.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as ExtractedComment[];

  console.log(`Found ${data.length} extracted records`);

  console.log('\nMerging reservations...');
  const mergedReservations = mergeReservations(data);

  console.log(`Created ${mergedReservations.length} merged reservations`);

  // Validate all reservations
  console.log('\nValidating reservations...');

  let validCount = 0;
  let invalidCount = 0;
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  for (let i = 0; i < mergedReservations.length; i++) {
    const validation = validateReservation(mergedReservations[i], i + 1);

    if (validation.valid) {
      validCount++;
    } else {
      invalidCount++;
    }

    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
  }

  // Print summary
  console.log('\n=== VALIDATION SUMMARY ===');
  console.log(`Total reservations: ${mergedReservations.length}`);
  console.log(`Valid: ${validCount}`);
  console.log(`Invalid: ${invalidCount}`);
  console.log(`Errors: ${allErrors.length}`);
  console.log(`Warnings: ${allWarnings.length}`);

  if (allErrors.length > 0) {
    console.log('\n=== ERRORS ===');
    allErrors.forEach(err => console.log(`  ❌ ${err}`));
  }

  if (allWarnings.length > 0) {
    console.log('\n=== WARNINGS ===');
    allWarnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
  }

  // Save merged reservations to file
  const outputPath = path.join(__dirname, '../import/merged-reservations.json');
  fs.writeFileSync(outputPath, JSON.stringify(mergedReservations, null, 2));
  console.log(`\n✅ Merged reservations saved to: ${outputPath}`);

  // Print sample reservations
  console.log('\n=== SAMPLE MERGED RESERVATIONS ===');
  mergedReservations.slice(0, 5).forEach((res, idx) => {
    console.log(`\n${idx + 1}. ${res.guestName} (${res.guestPhone})`);
    console.log(`   Date: ${res.checkInDate} → ${res.checkOutDate}`);
    console.log(`   Rooms: [${res.rooms.join(', ')}]`);
    console.log(`   Payments: ${JSON.stringify(res.payments)}`);
    console.log(`   Status: ${res.status}`);
    if (res.notes) console.log(`   Notes: ${res.notes}`);
  });

  // Print statistics
  console.log('\n=== STATISTICS ===');
  const roomCounts = mergedReservations.map(r => r.rooms.length);
  const singleRoom = roomCounts.filter(c => c === 1).length;
  const multiRoom = roomCounts.filter(c => c > 1).length;
  const maxRooms = Math.max(...roomCounts);

  console.log(`Single-room reservations: ${singleRoom}`);
  console.log(`Multi-room reservations: ${multiRoom}`);
  console.log(`Max rooms in one reservation: ${maxRooms}`);

  const totalPayments = mergedReservations.reduce((sum, r) => {
    return sum + r.payments.reduce((pSum, p) => pSum + p.amount, 0);
  }, 0);

  console.log(`Total payment amount: Rs. ${totalPayments}`);

  // Payment method breakdown
  const paymentMethods = {
    cash: 0,
    bashaQR: 0,
    jubairQR: 0
  };

  mergedReservations.forEach(r => {
    r.payments.forEach(p => {
      paymentMethods[p.method]++;
    });
  });

  console.log('\nPayment methods:');
  console.log(`  Cash: ${paymentMethods.cash}`);
  console.log(`  Basha QR: ${paymentMethods.bashaQR}`);
  console.log(`  Jubair QR: ${paymentMethods.jubairQR}`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
