import React from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

export const PrivacyPolicy: React.FC = () => {
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

  const sections = [
    {
      title: "Information We Collect",
      content: [
        "Personal Details: Name, phone, email, postal address, and government-issued ID (required under Indian law).",
        "Booking & Stay Information: Dates of stay, room preferences, payment details, and special requests.",
        "Communication Data: Emails, calls, or messages regarding reservations or inquiries.",
        "Website/Online Data: IP address, browser type, cookies, and usage details."
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        "Managing and confirming reservations.",
        "Complying with legal requirements for guest registration.",
        "Processing payments through secure gateways.",
        "Communicating updates, offers, or responses to your inquiries.",
        "Improving our website, guest services, and overall experience."
      ]
    },
    {
      title: "Sharing of Information",
      content: [
        "Legal & Regulatory Compliance: With government authorities as mandated for lodging establishments.",
        "Service Providers: With trusted partners like payment processors or online booking platforms.",
        "Legal Protection: If required to protect the safety, rights, or property of our lodge, guests, or others."
      ]
    },
    {
      title: "Cookies & Website Usage",
      content: [
        "We may use cookies to enhance your browsing experience, remember preferences, and analyze site traffic.",
        "You may disable cookies in your browser, but some features may not work properly.",
        "Our website may contain links to third-party sites. We are not responsible for their privacy practices."
      ]
    },
    {
      title: "Data Security",
      content: [
        "We adopt reasonable physical, technical, and administrative measures to protect your information.",
        "However, no system is completely secure, and we cannot guarantee absolute protection of your data."
      ]
    },
    {
      title: "Your Rights",
      content: [
        "Request access to the information we hold about you.",
        "Request correction of inaccurate or incomplete details.",
        "Request deletion of your data, subject to legal and regulatory requirements.",
        "To exercise these rights, please contact us using the information provided below."
      ]
    }
  ]

  return (
    <>
      <Helmet>
        <title>Privacy Policy - AVR Lodge | Data Protection & Privacy Rights</title>
        <meta name="description" content="Learn how AVR Lodge protects your personal information. Our privacy policy explains data collection, usage, and your rights as our guest in Kolli Hills, Tamil Nadu." />
        <meta name="keywords" content="privacy policy, data protection, AVR Lodge, personal information, guest rights, Kolli Hills resort privacy" />
        <meta property="og:title" content="Privacy Policy - AVR Lodge" />
        <meta property="og:description" content="Transparent privacy practices at AVR Lodge. Learn how we protect and use your personal information." />
        <meta property="og:type" content="article" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://avrlodge.com/privacy-policy" />
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
                Privacy Policy
              </motion.h1>
              <motion.p
                className="text-xl text-gray-300 mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Your Privacy & Data Protection Rights
              </motion.p>
              <motion.p
                className="text-lg text-gray-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
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
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg"
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-700 leading-relaxed text-lg text-center">
                  At <strong className="text-black">AVR Lodge, Kolli Hills</strong>, we respect your privacy and are committed to protecting your personal information.
                  This Privacy Policy explains what data we collect, how we use it, and your rights regarding your information.
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
                {sections.map((section, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg"
                    whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-serif font-bold text-black mb-6">{section.title}</h2>
                    <ul className="space-y-4">
                      {section.content.map((item, itemIndex) => (
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

        {/* Updates Policy */}
        <motion.section
          className="py-16 bg-gray-100"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg"
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-serif font-bold text-black mb-6">Updates to This Policy</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws.
                  The revised version will be posted on our website with the effective date.
                </p>
              </motion.div>
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
                className="text-3xl font-serif font-bold text-white mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                Questions? Contact Us
              </motion.h2>
              <motion.p
                className="text-gray-300 text-lg mb-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
              >
                For questions, concerns, or requests related to this Privacy Policy, please reach out to us:
              </motion.p>

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
                    href="/terms-of-service"
                    className="text-gray-300 hover:text-white transition-colors duration-300 underline underline-offset-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    Terms of Service
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

export default PrivacyPolicy