import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Clock,
  Wifi,
  TreePine,
  MapPin,
  Heart,
  Coffee,
  Mountain,
} from "lucide-react";

const experiences = [
  {
    title: "Check-in & Access",
    description:
      "Flexible 24-hour check-in, hot water anytime, and late check-out options.",
    icon: Clock,
    points: [
      "24-hour check-in and check-out",
      "Round-the-clock hot water",
      "Late check out (subject to availability)",
    ],
  },
  {
    title: "Food & Refreshments",
    description: "Enjoy meals, snacks, and in-room dining service.",
    icon: Coffee,
    points: [
      "Breakfast, lunch, and dinner available",
      "Snacks and beverages",
      "Room service",
    ],
  },
  {
    title: "Connectivity & Security",
    description:
      "Stay connected with free WiFi and 24/7 CCTV-secured surroundings.",
    icon: Wifi,
    points: [
      "Free WiFi across the property",
      "Fully 24/7 CCTV-surveilled premises",
    ],
  },
  {
    title: "Outdoor Features",
    description:
      "Relax with mountain views, garden seating, and a cozy campfire zone.",
    icon: TreePine,
    points: ["Benches, and garden seating", "Designated campfire zone"],
  },
  {
    title: "Activities & Entertainment",
    description: "Trekking support and on-request guides for local tours.",
    icon: Mountain,
    points: [
      "Trekking and nature walk guidance",
      "Tour and shopping guide (on request)",
    ],
  },
  {
    title: "Hospitality & Support",
    description: "Friendly staff, daily upkeep, helpdesk, and 24/7 assistance.",
    icon: Heart,
    points: [
      "Friendly and local staff",
      "Tourist support desk",
      "Daily housekeeping",
      "24/7 staff assistance",
      "First-Aid kit available",
    ],
  },
  {
    title: "Location Benefits",
    description:
      "Close to top spots, local markets, and backed by on-call mechanic support.",
    icon: MapPin,
    points: [
      "Close to all top attractions and locations",
      "Easy access to nearby villages & local markets",
      "Calm, nature-surrounded setting",
      "Local mechanic contact support for your bike/car",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const iconVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotate: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function ExperiencesSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      id="experiences"
      className="py-24 bg-gradient-to-br from-gray-50 to-white"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900">
              Experiences
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Create unforgettable memories with our curated experiences in the
            heart of Kolli Hills.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {experiences.map((experience, index) => {
            const IconComponent = experience.icon;
            return (
              <motion.div
                key={experience.title}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
              >
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon container */}
                <motion.div
                  variants={iconVariants}
                  className="relative z-10 w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg"
                >
                  <IconComponent className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-black transition-colors duration-300">
                    {experience.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {experience.description}
                  </p>

                  {/* Points list */}
                  <ul className="space-y-3">
                    {experience.points.map((point, pointIndex) => (
                      <motion.li
                        key={pointIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{
                          duration: 0.4,
                          delay: 0.4 + index * 0.1 + pointIndex * 0.05,
                          ease: "easeOut",
                        }}
                        className="flex items-start space-x-3 text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 group-hover:translate-x-1"
                      >
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-black to-gray-700 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                        <span className="leading-relaxed">{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-black/10 transition-colors duration-500" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom accent */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-16 flex justify-center"
        >
          <div className="w-24 h-1 bg-black rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
