import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-black">
        <img
          src="/images/kolli-hills-iconic.jpeg"
          alt="You've reached a new destination to vibe, relax, and share!"
          className="object-cover w-full h-full"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-serif font-bold mb-6"
        >
          AVR Lodge
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-xl md:text-2xl mb-8 font-light"
        >
          You’ve reached a new destination to vibe, relax, and share!
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="text-lg md:text-xl mb-12 text-gray-200"
        >
          Make your stay Instagram-worthy. Make it unforgettable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
        >
          {/* <a
            href="/rooms"
            className="rounded-lg bg-white text-black px-6 py-2 text-lg font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-block"
          >
            Book your room
          </a> */}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white cursor-pointer"
        onClick={() => scrollToSection("about")}
      >
        <ChevronDown className="w-8 h-8 animate-bounce" />
      </motion.div>
    </section>
  );
}
