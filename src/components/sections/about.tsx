import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export default function AboutSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  return (
    <section id="about" className="py-20 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">
              Nestled in KolliHills
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              AVR Lodge stands as a beacon of tranquility amidst the breathtaking landscapes of KolliHills, Tamil Nadu. 
              Our resort offers an intimate escape where the pristine beauty of the Eastern Ghats meets luxury hospitality.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Experience the perfect blend of modern comfort and natural splendor, where every moment is crafted to rejuvenate 
              your spirit and create lasting memories in one of South India&apos;s most enchanting hill stations.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">2000ft</div>
                <div className="text-gray-600">Above Sea Level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">24/7</div>
                <div className="text-gray-600">Concierge Service</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Rolling hills landscape in grayscale"
                className="object-cover grayscale hover:scale-105 transition-transform duration-500 w-full h-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}