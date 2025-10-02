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

  const content = [
    "All guests are required to provide valid government-issued photo identification at the time of check-in, as per the hospitality regulations. International guests must provide a passport, visa details, and any other documentation as mandated by law. This requirement is mandatory for security, verification, and lawful lodging records.",

    "During the booking and stay process, AVR Lodge collects personal information including full name, postal address, contact details (phone number and email address), government-issued ID details (such as Aadhaar card, Passport, Voter ID, or Driving License), dates of stay, room preferences, number of guests, payment information (processed securely through gateways but without storing full card numbers), and special requests.",

    "The information collected is used for managing and confirming bookings, fulfilling guest requests, complying with legal and regulatory obligations, and ensuring smooth communication before, during, and after a guest's stay.",

    "Sensitive personal information is collected only when necessary, such as for identity verification for legal or security purposes, and is always handled with strict confidentiality.",

    "Personal information is collected and processed only to the extent necessary to deliver services and comply with legal obligations. This includes processing and confirming reservations, legal guest registration with authorities, secure payment processing, and communication regarding stays, updates, or, where consent is provided, promotional offers.",

    "Payment details are processed exclusively through certified third-party payment gateways to confirm deposits, settle bills, and prevent fraudulent activity. AVR Lodge does not store sensitive payment information such as credit or debit card numbers.",

    "Communication using guest data may include booking confirmations, check-in or check-out details, reminders, updates about services, and promotional messages.",

    "Guest data may also be analyzed internally to evaluate patterns such as booking trends, seasonal demand, and service preferences. This analysis is conducted only on aggregated or anonymized data to protect guest identities.",

    "Personal identifiers such as ID numbers, financial details, or direct contact information will never be included in public reports, marketing material, or external communications.",

    "Guest information may be shared with government authorities as required by Indian law, including local law enforcement and regulatory bodies, to ensure compliance with all hospitality regulations.",

    "Guest information may be shared with trusted third-party service providers such as payment gateways, online booking platforms, and technology partners who assist in processing payments, managing reservations, or enhancing guest services.",

    "Guest information will never be sold, rented, or traded to any third party for marketing or commercial gain.",

    "All personal information collected by AVR Lodge is protected by reasonable physical, technical, and administrative safeguards to reduce the risk of unauthorized access, disclosure, or misuse.",

    "While every effort is made to ensure security, no digital or physical system can be completely secure, and absolute protection of data cannot be guaranteed. Guests are encouraged to use secure methods of communication and payment.",

    "Guests may withdraw consent for receiving promotional or marketing communication at any time without affecting the services they are entitled to.",

    "AVR Lodge's website may use cookies to improve browsing experience, remember user preferences, and analyze traffic. Guests may disable cookies in their browser settings, though some website features may not function correctly. Links to third-party websites may be provided for convenience; AVR Lodge is not responsible for their privacy practices.",

    "Guest records, including identification and booking details, are retained for the duration required under Indian law. Payment transaction records are retained by certified payment processors as per their policies.",

    "Bookings for guests under 18 must be made or accompanied by a parent or legal guardian. AVR Lodge does not knowingly collect personal information from minors without proper consent.",

    "AVR Lodge is not liable for unauthorized access, data breaches, system errors, or misuse of guest information beyond reasonable control. Guests are responsible for safeguarding their own credentials, devices, and payment methods.",

    "AVR Lodge may update this Privacy Policy periodically to reflect changes in practices, technology, or applicable laws. The revised version will always be posted on the official website with the effective date clearly mentioned."
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
        <div className="bg-black text-white py-6">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                Privacy Policy - AVR Lodge, Kolli Hills
              </h1>
              <p className="text-sm text-gray-300">
                Effective Date: 1st September 2025
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  {content.map((paragraph, index) => (
                    <p key={index}>• {paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="py-6 bg-black text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-lg font-bold text-white mb-4">Questions? Contact Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white mb-2">Phone</h3>
                  <a
                    href="tel:+918122369100"
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    +91 81223 69100
                  </a>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white mb-2">Email</h3>
                  <a
                    href="mailto:johneyresort@gmail.com"
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    johneyresort@gmail.com
                  </a>
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-gray-400 text-xs mb-2">Related Policies</p>
                <div className="space-x-4">
                  <a
                    href="/terms-of-service"
                    className="text-gray-300 hover:text-white text-xs transition-colors underline"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="/data-deletion-policy"
                    className="text-gray-300 hover:text-white text-xs transition-colors underline"
                  >
                    Data Deletion Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PrivacyPolicy