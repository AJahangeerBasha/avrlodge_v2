import { readFileSync } from 'fs'
import * as path from 'path'
import { db } from './firebaseConfig'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Small helper: safe number parse
function toNumber(value?: string) {
  if (!value) return 0
  const n = Number(value.toString().trim())
  return Number.isFinite(n) ? n : 0
}

const DRY_RUN = process.argv.includes('--dry')

let _dryCounter = 0
type DryDoc = { id: string }
async function maybeAdd(collectionName: string, data: unknown): Promise<DryDoc | { id: string }> {
  if (DRY_RUN) {
    _dryCounter += 1
    console.log(`    [DRY] Would add to ${collectionName}:`, data)
    return { id: `dry-${collectionName}-${_dryCounter}` }
  }
  // The project uses strong types; for this small script cast to any to call Firestore helpers
  const docRef = await addDoc(collection(db, collectionName), data as any)
  return { id: (docRef as unknown as { id: string }).id }
}

async function importCsv() {
  try {
    console.log('📥 Reading CSV')

    const csvPath = path.join(process.cwd(), 'import', 'day1.csv')
    const raw = readFileSync(csvPath, 'utf8')
    const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0)
    if (lines.length < 2) {
      console.log('No rows to import')
      return
    }

    const header = lines[0].split(',').map(h => h.trim())

    console.log(`Found ${lines.length - 1} data row(s)`)

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i]
      // naive CSV split - fine for simple CSV without quoted commas
      const cols = row.split(',').map(c => c.trim())
      const obj: Record<string, string> = {}
      for (let j = 0; j < header.length; j++) {
        obj[header[j]] = cols[j] ?? ''
      }

      const checkInDateRaw = obj['checkInDate']
      const checkOutDateRaw = obj['checkOutDate']
      const roomNumberRaw = obj['roomNumber']
      const name = obj['name']
      const phone = obj['phone']
      const guestCount = toNumber(obj['guestCount'])
      const totalPrice = toNumber(obj['totalPrice'])
      const payment_qr = toNumber(obj['paymentmethod_qr'])
      const payment_cash = toNumber(obj['paymentmethod_cash'])

      // Create guest
  const guestDoc = await maybeAdd('guest', {
        name: name || null,
        phone: phone || null,
        createdAt: serverTimestamp(),
        importedFrom: 'day1.csv',
      })

      console.log(`  ➤ Created guest (${guestDoc.id}) - ${name}`)

      // Create reservation
      interface Reservation {
        guestId: string
        guestName: string | null
        guestPhone: string | null
        guestCount: number
        totalPrice: number
        status: string
        checkInDate: string | null
        checkOutDate: string | null
        createdAt: ReturnType<typeof serverTimestamp>
        importedFrom: string
      }

      const reservationData: Reservation = {
        guestId: guestDoc.id,
        guestName: name || null,
        guestPhone: phone || null,
        guestCount,
        totalPrice,
        status: 'checked_out',
        checkInDate: checkInDateRaw ? new Date(checkInDateRaw).toISOString() : null,
        checkOutDate: checkOutDateRaw ? new Date(checkOutDateRaw).toISOString() : null,
        createdAt: serverTimestamp(),
        importedFrom: 'day1.csv',
      }

  const reservationDoc = await maybeAdd('reservations', reservationData)
      console.log(`  ➤ Created reservation (${reservationDoc.id}) for guest ${name}`)

      // Reservation rooms: split by '-' if multiple
      const roomParts = roomNumberRaw ? roomNumberRaw.split('-').map(r => r.trim()).filter(Boolean) : []
      if (roomParts.length === 0) {
        // still create a single placeholder if missing
        const rr = await maybeAdd('reservationRooms', {
          reservationId: reservationDoc.id,
          roomNumber: null,
          createdAt: serverTimestamp(),
          importedFrom: 'day1.csv',
        })
        console.log(`    ⚠️ No room number found; created placeholder reservationRoom (${rr.id})`)
      } else {
        for (const rn of roomParts) {
          const rr = await maybeAdd('reservationRooms', {
            reservationId: reservationDoc.id,
            roomNumber: rn,
            createdAt: serverTimestamp(),
            importedFrom: 'day1.csv',
          })
          console.log(`    ➤ reservationRoom created for room ${rn} (${rr.id})`)
        }
      }

      // Payments: create payment documents for non-zero amounts
      if (payment_qr > 0) {
        const p = await maybeAdd('payments', {
          reservationId: reservationDoc.id,
          amount: payment_qr,
          paymentMethod: 'Basha',
          createdAt: serverTimestamp(),
          importedFrom: 'day1.csv',
        })
        console.log(`    ➤ Payment recorded: Basha ${payment_qr} (${p.id})`)
      }

      if (payment_cash > 0) {
        const p = await maybeAdd('payments', {
          reservationId: reservationDoc.id,
          amount: payment_cash,
          paymentMethod: 'Cash',
          createdAt: serverTimestamp(),
          importedFrom: 'day1.csv',
        })
        console.log(`    ➤ Payment recorded: Cash ${payment_cash} (${p.id})`)
      }
    }

    console.log('\n🎉 Import finished')
  } catch (error) {
    console.error('❌ Import failed', error)
    process.exit(1)
  }
}

// Run when executed
importCsv()
