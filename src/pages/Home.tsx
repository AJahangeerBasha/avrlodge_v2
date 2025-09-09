import { Helmet } from 'react-helmet-async'
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import HeroSection from "@/components/sections/hero"
import AboutSection from "@/components/sections/about"
import RoomsSection from "@/components/sections/rooms"
import ExperiencesSection from "@/components/sections/experiences"
import ContactSection from "@/components/sections/contact"
import WhenToVisit from "@/components/sections/when-to-visit"
import KolliHillsTop25AttractionsDesign2 from "@/components/sections/kolli-hills-top25-attractions-design2"
import GettingToKolliHillsDesign2 from "@/components/sections/getting-to-kolli-hills-design2"
import FloatingContactButtons from "@/components/sections/floating-contacts"

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>AVR Lodge - Luxury Resort in KolliHills, Tamil Nadu</title>
        <meta name="description" content="Experience luxury in the heart of KolliHills at AVR Lodge. Discover 25 must-visit attractions including Agaya Gangai Waterfalls, ancient temples, trekking routes, and local markets." />
        <meta name="keywords" content="Kolli Hills, AVR Lodge, Tamil Nadu, waterfalls, temples, trekking, attractions, luxury resort, Eastern Ghats, Agaya Gangai, Masila Falls, Arapaleeswarar Temple" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://avrlodge.com/" />
        <meta property="og:title" content="AVR Lodge - Luxury Resort in KolliHills, Tamil Nadu | Top 25 Attractions" />
        <meta property="og:description" content="Experience luxury in the heart of KolliHills at AVR Lodge. Discover 25 must-visit attractions including waterfalls, temples, trekking routes, and local markets." />
        <meta property="og:image" content="https://avrlodge.com/images/hero-image.jpg" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://avrlodge.com/" />
        <meta property="twitter:title" content="AVR Lodge - Luxury Resort in KolliHills, Tamil Nadu" />
        <meta property="twitter:description" content="Experience luxury in the heart of KolliHills at AVR Lodge. Discover 25 must-visit attractions including waterfalls, temples, trekking routes, and local markets." />
        <meta property="twitter:image" content="https://avrlodge.com/images/hero-image.jpg" />
        
        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN-TN" />
        <meta name="geo.placename" content="Kolli Hills, Tamil Nadu, India" />
        <meta name="geo.position" content="11.3917;78.3206" />
        <meta name="ICBM" content="11.3917, 78.3206" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://avrlodge.com/" />
      </Helmet>
      
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <HeroSection />
        <RoomsSection />
        <ExperiencesSection />
        <AboutSection />
        <KolliHillsTop25AttractionsDesign2 />
        <GettingToKolliHillsDesign2 />
        <WhenToVisit />
        <ContactSection />
        <Footer />
        <FloatingContactButtons />
      </div>
    </>
  )
}