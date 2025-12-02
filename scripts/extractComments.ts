import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

interface CommentEntry {
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

interface MergeRange {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

// Function to parse and format comment text
function parseComment(rawComment: string): {
  agent: string;
  guestName: string;
  phone: string;
  payment: string;
  pax: string;
  otherRooms: string;
  notes: string;
  raw: string;
} {
  const lines = rawComment.split('\n').map(line => line.trim()).filter(line => line);

  let agent = '';
  let guestName = '';
  let phone = '';
  let payment = '';
  let pax = '';
  let otherRooms = '';
  let notes = '';

  // Extract agent (first line usually ends with :)
  if (lines.length > 0 && lines[0].includes(':')) {
    agent = lines[0].replace(':', '').trim();
  }

  // Process remaining lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Check for phone number (9-10 digits, may have spaces or dashes)
    if (!phone && /^\d[\d\s-]{7,}\d$/.test(line)) {
      phone = line.replace(/[\s-]/g, '');
    }
    // Check for payment (starts with Rs or contains payment keywords)
    else if (/Rs\.?\s*\d+|jbqr|cash/i.test(line)) {
      if (payment) {
        payment += ' | ' + line;
      } else {
        payment = line;
      }
    }
    // Check for pax count
    else if (/\d+\s*pax|^\d+A\+\d+C/i.test(line)) {
      pax = line;
    }
    // Check for room references
    else if (/^See\s+\d+/i.test(line)) {
      notes = line;
    }
    // Check for comma-separated room numbers
    else if (/^\d{3}(?:\s*,\s*\d{3})+/.test(line)) {
      otherRooms = line;
    }
    // Guest name (usually first non-agent, non-phone line)
    else if (!guestName && i === 1) {
      guestName = line;
    }
    // Other notes
    else if (line && !payment && !pax) {
      if (notes) {
        notes += ' | ' + line;
      } else {
        notes = line;
      }
    }
  }

  // Set default phone if empty
  if (!phone) {
    phone = '9999999999';
  }

  return {
    agent,
    guestName,
    phone,
    payment,
    pax,
    otherRooms,
    notes,
    raw: rawComment
  };
}

async function extractComments() {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '../import/importFile-Sample.xlsx');

  console.log('Reading Excel file...');
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0]; // Get the first worksheet

  if (!worksheet) {
    throw new Error('No worksheet found in the Excel file');
  }

  console.log('Extracting comments...');

  const results: CommentEntry[] = [];
  const processedCells = new Set<string>();

  // Build a map of merged ranges
  const mergedRanges: MergeRange[] = [];

  // Access merged cells through the worksheet model
  if (worksheet.model && worksheet.model.merges) {
    worksheet.model.merges.forEach((merge: string) => {
      const range = parseMergeRange(merge);
      mergedRanges.push(range);
    });
  }

  console.log(`Found ${mergedRanges.length} merged cell ranges`);

  // Iterate through all cells starting from row 3 (data rows)
  worksheet.eachRow((row, rowNumber) => {
    // Skip header rows (rows 1 and 2)
    if (rowNumber <= 2) return;

    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      // Skip column A (room numbers)
      if (colNumber === 1) return;

      const cellAddress = cell.address;

      // Skip if already processed
      if (processedCells.has(cellAddress)) return;

      // Check if cell has a comment/note
      if (cell.note) {
        const commentText = typeof cell.note === 'string'
          ? cell.note
          : cell.note.texts?.map(t => t.text).join('') || '';

        if (commentText.trim()) {
          // Find if this cell is part of a merged range
          const mergeRange = findMergeRange(rowNumber, colNumber, mergedRanges);

          if (mergeRange) {
            // Process all cells in the merged range
            for (let r = mergeRange.top; r <= mergeRange.bottom; r++) {
              // Skip header rows
              if (r <= 2) continue;

              for (let c = mergeRange.left; c <= mergeRange.right; c++) {
                const mergedCell = worksheet.getCell(r, c);
                processedCells.add(mergedCell.address);

                // Get room number from column A
                const roomCell = worksheet.getCell(r, 1);
                const roomNumber = roomCell.value?.toString() || '';

                // Get date day from row 2
                const dateCell = worksheet.getCell(2, c);
                const dayNumber = dateCell.value?.toString() || '';

                // Convert to full date format
                const fullDate = convertToDate(dayNumber);

                if (roomNumber && fullDate) {
                  results.push({
                    roomNumber,
                    date: fullDate,
                    comment: parseComment(commentText.trim())
                  });
                }
              }
            }
          } else {
            // Single cell with comment
            processedCells.add(cellAddress);

            // Get room number from column A
            const roomCell = worksheet.getCell(rowNumber, 1);
            const roomNumber = roomCell.value?.toString() || '';

            // Get date day from row 2
            const dateCell = worksheet.getCell(2, colNumber);
            const dayNumber = dateCell.value?.toString() || '';

            // Convert to full date format
            const fullDate = convertToDate(dayNumber);

            if (roomNumber && fullDate) {
              results.push({
                roomNumber,
                date: fullDate,
                comment: parseComment(commentText.trim())
              });
            }
          }
        }
      }
    });
  });

  console.log(`Extracted ${results.length} comment entries`);

  // Sort by date, then by room number
  console.log('Sorting entries by date...');
  results.sort((a, b) => {
    // First compare dates
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) {
      return dateCompare;
    }
    // If dates are equal, compare room numbers
    return a.roomNumber.localeCompare(b.roomNumber);
  });

  // Save as JSON
  const jsonPath = path.join(__dirname, '../import/extracted-comments.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`JSON saved to: ${jsonPath}`);

  // Save as CSV
  const csvPath = path.join(__dirname, '../import/extracted-comments.csv');
  const csvHeader = 'Room Number,Date,Agent,Guest Name,Phone,Payment,Pax,Other Rooms,Notes\n';
  const csvRows = results.map(entry =>
    `"${entry.roomNumber}","${entry.date}","${entry.comment.agent}","${entry.comment.guestName}","${entry.comment.phone}","${entry.comment.payment.replace(/"/g, '""')}","${entry.comment.pax}","${entry.comment.otherRooms}","${entry.comment.notes.replace(/"/g, '""')}"`
  ).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows);
  console.log(`CSV saved to: ${csvPath}`);

  return results;
}

// Helper function to convert day number to full date (November 2025)
function convertToDate(dayNumber: string): string | null {
  const day = parseInt(dayNumber);
  if (isNaN(day) || day < 1 || day > 30) {
    return null;
  }

  // Format: YYYY-MM-DD (November 2025)
  const year = 2025;
  const month = 11;
  const paddedDay = day.toString().padStart(2, '0');

  return `${year}-${month.toString().padStart(2, '0')}-${paddedDay}`;
}

// Helper function to find if a cell is in a merged range
function findMergeRange(row: number, col: number, ranges: MergeRange[]): MergeRange | null {
  for (const range of ranges) {
    if (row >= range.top && row <= range.bottom &&
        col >= range.left && col <= range.right) {
      return range;
    }
  }
  return null;
}

// Helper function to parse cell address (e.g., "B2" -> {row: 2, col: 2})
function parseAddress(address: string): { row: number; col: number } {
  const match = address.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell address: ${address}`);

  const col = columnToNumber(match[1]);
  const row = parseInt(match[2]);

  return { row, col };
}

// Helper function to parse merge range (e.g., "B2:C3" -> {top: 2, bottom: 3, left: 2, right: 3})
function parseMergeRange(range: string): MergeRange {
  const [start, end] = range.split(':');
  const startCell = parseAddress(start);
  const endCell = end ? parseAddress(end) : startCell; // Handle single cell case

  return {
    top: Math.min(startCell.row, endCell.row),
    bottom: Math.max(startCell.row, endCell.row),
    left: Math.min(startCell.col, endCell.col),
    right: Math.max(startCell.col, endCell.col)
  };
}

// Helper function to convert column letter to number (A=1, B=2, etc.)
function columnToNumber(column: string): number {
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    result = result * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return result;
}

// Run the extraction
extractComments()
  .then(results => {
    console.log('\nExtraction complete!');
    console.log(`Total entries: ${results.length}`);

    // Display first few entries as sample
    if (results.length > 0) {
      console.log('\nSample entries:');
      results.slice(0, 5).forEach(entry => {
        console.log(`  Room ${entry.roomNumber}, Date ${entry.date}:`);
        console.log(`    Agent: ${entry.comment.agent}`);
        console.log(`    Guest: ${entry.comment.guestName}`);
        console.log(`    Phone: ${entry.comment.phone}`);
        console.log(`    Payment: ${entry.comment.payment}`);
        if (entry.comment.pax) console.log(`    Pax: ${entry.comment.pax}`);
        if (entry.comment.otherRooms) console.log(`    Other Rooms: ${entry.comment.otherRooms}`);
        if (entry.comment.notes) console.log(`    Notes: ${entry.comment.notes}`);
        console.log('');
      });
    }
  })
  .catch(error => {
    console.error('Error extracting comments:', error);
    process.exit(1);
  });
