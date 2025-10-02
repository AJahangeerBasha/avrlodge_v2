import React from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

export const TermsOfService: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const terms = [
    {
      title: "Booking & Reservations",
      items: [
        "Subject to availability • Valid ID required",
        "Online/phone/third-party bookings accepted",
        "Advance payment may be required",
        "We reserve cancellation rights for non-payment"
      ]
    },
    {
      title: "Check-in & Check-out",
      items: [
        "Check-in: 12:00 noon onwards",
        "Check-out: 11:00 AM sharp",
        "Late checkout available (charges apply)",
        "Guests liable for property damage"
      ]
    },
    {
      title: "Cancellation & Refunds",
      items: [
        "Terms vary by booking platform",
        "Refunds via original payment method",
        "No-shows may forfeit refunds",
        "Processing: 7-10 business days"
      ]
    },
    {
      title: "Guest Conduct",
      items: [
        "Respect guests, staff, and property",
        "No illegal activities permitted",
        "Eviction without refund for violations",
        "Smoking in designated areas only"
      ]
    },
    {
      title: "Website & Online Services",
      items: [
        "Provide accurate booking information",
        "No unauthorized website access",
        "Third-party links not our responsibility",
        "Account suspension for violations"
      ]
    },
    {
      title: "Liability Limitations",
      items: [
        "Not responsible for personal property loss",
        "No liability for force majeure events",
        "Limited to booking amount paid",
        "Travel insurance recommended"
      ]
    }
  ]

  return (
    <>
      <Helmet>
        <title>Terms of Service - AVR Lodge | Booking Terms & Conditions</title>
        <meta name="description" content="Read AVR Lodge's terms of service covering booking policies, check-in procedures, guest conduct, and liability. Essential information for your Kolli Hills stay." />
        <meta name="keywords" content="terms of service, booking policy, AVR Lodge, Kolli Hills, check-in policy, guest conduct, cancellation policy" />
        <meta property="og:title" content="Terms of Service - AVR Lodge" />
        <meta property="og:description" content="Complete terms and conditions for booking and staying at AVR Lodge, Kolli Hills." />
        <meta property="og:type" content="article" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://avrlodge.com/terms-of-service" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <motion.section
          className="bg-black text-white py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-2">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                className="text-2xl md:text-4xl font-serif font-bold mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Terms of Service
              </motion.h1>
              <motion.p
                className="text-xl text-gray-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Effective Date: 1st September 2025
              </motion.p>
            </div>
          </div>
        </motion.section>

        {/* Introduction */}
        <motion.section
          className="py-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg"
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-700 leading-relaxed text-lg text-center">
                  Welcome to <strong className="text-black">AVR Lodge, Kolli Hills</strong>. By booking or staying with us, you agree to these terms and conditions. Please read them carefully.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Main Content Sections */}
        <motion.section
          className="pb-16 bg-gray-50"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {terms.map((section, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg"
                    whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-serif font-bold text-black mb-6">{section.title}</h2>
                    <ul className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <motion.li
                          key={itemIndex}
                          className="flex items-start space-x-4"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: itemIndex * 0.1, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <span className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></span>
                          <span className="text-gray-700 leading-relaxed text-base">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          className="py-16 bg-black text-white"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2
                className="text-3xl font-serif font-bold text-white mb-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                Questions? Contact Us
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-serif font-bold text-white mb-4">Phone</h3>
                  <a
                    href="tel:+918122369100"
                    className="text-gray-300 hover:text-white text-lg transition-colors duration-300"
                  >
                    +91 81223 69100
                  </a>
                </motion.div>
                <motion.div
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-serif font-bold text-white mb-4">Email</h3>
                  <a
                    href="mailto:johneyresort@gmail.com"
                    className="text-gray-300 hover:text-white text-lg transition-colors duration-300"
                  >
                    johneyresort@gmail.com
                  </a>
                </motion.div>
              </div>

              <motion.div
                className="pt-8 border-t border-white/20"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <p className="text-gray-400 mb-4">Related Policies</p>
                <div className="space-x-6">
                  <motion.a
                    href="/privacy-policy"
                    className="text-gray-300 hover:text-white transition-colors duration-300 underline underline-offset-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    Privacy Policy
                  </motion.a>
                  <motion.a
                    href="/data-deletion-policy"
                    className="text-gray-300 hover:text-white transition-colors duration-300 underline underline-offset-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    Data Deletion Policy
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
    </>
  )
}

export default TermsOfService