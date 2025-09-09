import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useScrollToSection } from "@/hooks/use-scroll-to-section"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const scrollToSection = useScrollToSection()
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100
      setScrolled(isScrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleScrollToSection = (sectionId: string) => {
    scrollToSection(sectionId)
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-lg" : "bg-white/95 backdrop-blur-sm"
      } border-b border-gray-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-serif font-bold text-black cursor-pointer"
                onClick={() => handleScrollToSection("home")}>
              AVR Lodge
            </h1>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {["home", "experiences", "about", "attractions", "getting-to-kolli-hills", "when-to-visit", "contact"].map((item) => (
                <button
                  key={item}
                  onClick={() => handleScrollToSection(item)}
                  className="text-gray-600 hover:text-black px-3 py-2 text-sm font-medium transition-colors duration-200 capitalize"
                >
                  {item.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          
        </div>
      </div>
      
    </motion.nav>
  )
}