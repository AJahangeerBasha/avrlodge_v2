// Debug agent data for specific reservation
const debug = () => {
  console.log('🔍 To debug agent data, check browser console at:')
  console.log('👉 http://localhost:3007/admin/bookings')
  console.log('')
  console.log('🎯 Look for console logs starting with:')
  console.log('  "🔍 DEBUGGING SPECIFIC RESERVATION:"')
  console.log('  "🎯 BOOKING CARD DATA for 5tnn6iuqJfRWvY9YiWnz:"')
  console.log('')
  console.log('📝 This will show:')
  console.log('  - Raw Firebase reservation data')
  console.log('  - Agent ID and commission from Firebase')
  console.log('  - Agent name lookup result')
  console.log('  - Final booking object sent to card component')
}

debug()