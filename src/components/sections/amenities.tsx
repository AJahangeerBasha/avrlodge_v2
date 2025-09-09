import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Waves, Sparkles, Utensils, Mountain } from "lucide-react"
// import Image from "next/image"

const amenities = [
  {
    icon: Waves,
    title: "Infinity Pool",
    description: "Stunning infinity pool overlooking the valley with 24/7 access and poolside service."
  },
  {
    icon: Sparkles,
    title: "Wellness Spa",
    description: "Rejuvenating spa treatments using organic herbs and traditional Ayurvedic practices."
  },
  {
    icon: Utensils,
    title: "Fine Dining",
    description: "Multi-cuisine restaurant featuring local delicacies and international favorites."
  },
  {
    icon: Mountain,
    title: "Adventure Tours",
    description: "Guided trekking, bird watching, and nature exploration activities."
  }
]

export default function AmenitiesSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  return (
    <section id="amenities" className="py-20 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            World-Class Amenities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Indulge in our carefully curated amenities designed to enhance your mountain retreat experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {amenities.map((amenity, index) => (
            <motion.div
              key={amenity.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <amenity.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{amenity.title}</h3>
              <p className="text-gray-600">{amenity.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          >
            <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500"
                alt="Luxury spa treatment room with massage table"
                className="w-full h-full object-cover grayscale hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.7 }}
          >
            <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500"
                alt="Elegant hotel restaurant with fine dining setup"
                className="w-full h-full object-cover grayscale hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}