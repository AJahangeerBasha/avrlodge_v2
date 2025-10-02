import React from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

export const DataDeletionPolicy: React.FC = () => {
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

  return (
    <>
      <Helmet>
        <title>Data Deletion Policy - AVR Lodge | Delete Your Personal Data</title>
        <meta name="description" content="Request deletion of your personal data from AVR Lodge. Learn how to remove your information from our systems and Meta platforms (Facebook, Instagram, WhatsApp)." />
        <meta name="keywords" content="data deletion, delete data, AVR Lodge, personal information, Facebook login, Meta platforms, privacy rights" />
        <meta property="og:title" content="Data Deletion Policy - AVR Lodge" />
        <meta property="og:description" content="Request deletion of your personal data from AVR Lodge systems and Meta platforms." />
        <meta property="og:type" content="article" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://avrlodge.com/data-deletion-policy" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <motion.section
          className="bg-black text-white py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                className="text-2xl md:text-4xl font-serif font-bold mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Data Deletion Policy
              </motion.h1>
              <motion.p
                className="text-xl text-gray-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Your Right to Delete Personal Information
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
                  At <strong className="text-black">AVR Lodge</strong>, you have the right to request deletion of your personal data.
                  If you used Facebook Login or interacted with us via Meta platforms (Facebook, Instagram, WhatsApp),
                  you can request data deletion at any time.
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
                {/* How to Request */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg"
                  whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-serif font-bold text-black mb-6">How to Request Data Deletion</h2>
                  <div className="space-y-6">
                    {[
                      { number: 1, title: "Send Email", desc: "Subject: 'Data Deletion Request'" },
                      { number: 2, title: "Include Details", desc: "Account or booking information" },
                      { number: 3, title: "Processing", desc: "Completed within 7 business days" }
                    ].map((step, index) => (
                      <motion.div
                        key={step.number}
                        className="flex items-start space-x-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <div className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {step.number}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-black">{step.title}</p>
                          <p className="text-gray-600">{step.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Facebook Users */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg"
                  whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-serif font-bold text-black mb-6">Facebook Users</h2>
                  <p className="text-gray-700 text-lg mb-6">Remove AVR Lodge access directly through:</p>
                  <motion.div
                    className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-xl p-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-blue-800 font-semibold text-lg">
                      Facebook Settings → Apps and Websites → AVR Lodge → Remove
                    </p>
                  </motion.div>
                </motion.div>

                {/* Legal Compliance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg"
                    whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-serif font-bold text-green-800 mb-6">Can be Deleted</h2>
                    <ul className="space-y-4">
                      {["Marketing preferences", "Social login data", "Non-essential details"].map((item, index) => (
                        <motion.li
                          key={item}
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></span>
                          <span className="text-gray-700 text-base">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg"
                    whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-serif font-bold text-orange-800 mb-6">Must be Retained</h2>
                    <ul className="space-y-4 mb-6">
                      {["Government ID records", "Financial transactions", "Legal compliance data"].map((item, index) => (
                        <motion.li
                          key={item}
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-3 flex-shrink-0"></span>
                          <span className="text-gray-700 text-base">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div
                      className="bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Per Indian regulations, some records must be retained until legally permissible to delete.
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
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
                Contact Us for Data Deletion
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
                  <h3 className="text-xl font-serif font-bold text-white mb-4">Email</h3>
                  <a
                    href="mailto:johneyresort@gmail.com?subject=Data Deletion Request"
                    className="text-gray-300 hover:text-white text-lg transition-colors duration-300 block mb-2"
                  >
                    johneyresort@gmail.com
                  </a>
                  <p className="text-gray-400 text-sm">Subject: "Data Deletion Request"</p>
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
                  <h3 className="text-xl font-serif font-bold text-white mb-4">Phone</h3>
                  <a
                    href="tel:+918122369100"
                    className="text-gray-300 hover:text-white text-lg transition-colors duration-300 block mb-2"
                  >
                    +91 81223 69100
                  </a>
                  <p className="text-gray-400 text-sm">Business hours only</p>
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
                    href="/terms-of-service"
                    className="text-gray-300 hover:text-white transition-colors duration-300 underline underline-offset-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    Terms of Service
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

export default DataDeletionPolicy