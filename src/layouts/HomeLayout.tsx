import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

function getRotatingIndex(total: number): number {
  const now = new Date()
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 1)
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const dayOfYear = Math.floor((nowUtc - startOfYear) / (1000 * 60 * 60 * 24))
  return dayOfYear % Math.max(1, total)
}

function useRotatingMetadata() {
  const metaDescriptions = [
    "Escape to AVR Lodge in Kolli Hills. Budget-friendly rooms, family suites & campfires. Free Wi-Fi, hot water, and easy access to waterfalls & treks.",
    "Discover AVR Lodge – your cozy homestay in Kolli Hills. Enjoy flexible check-in, campfire nights, and scenic views near Masila & Agaya Gangai Falls.",
    "AVR Lodge offers affordable stays in Kolli Hills with Wi-Fi, 24-hr hot water & trekking access. Perfect for couples, families, riders & backpackers.",
    "Relax at AVR Lodge Kolli Hills. Choose from Couple's Cove, Family Nest or group dorms. Experience nature, comfort & adventure at budget prices.",
    "Plan your Kolli Hills trip with AVR Lodge. Family-friendly, rider-approved & nature-close. Free Wi-Fi, flexible check-in, and campfire evenings.",
    "Stay at AVR Lodge in Kolli Hills – cozy rooms, budget rates & scenic surroundings. Near waterfalls & viewpoints. Ideal for groups, couples & families.",
    "AVR Lodge Kolli Hills offers comfort in nature with campfires, trekking support, and flexible stays. Rooms from ₹350/night with Wi-Fi & hot water.",
    "Experience Kolli Hills at AVR Lodge. Budget to family rooms, dorms for groups, and romantic couple stays. Free Wi-Fi and round-the-clock service.",
    "AVR Lodge in Kolli Hills – your affordable nature retreat. Enjoy campfire nights, local guides, and comfortable stays near Kolli's top attractions.",
    "Book AVR Lodge Kolli Hills for scenic escapes. Cozy rooms, family-friendly stays, Wi-Fi & trekking access. Close to waterfalls, viewpoints & nature."
  ]

  const idx = getRotatingIndex(metaDescriptions.length)
  return metaDescriptions[idx]
}

export function HomeLayout() {
  const description = useRotatingMetadata()

  return (
    <>
      <Helmet>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      <Outlet />
    </>
  )
}