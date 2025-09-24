import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FileText, Calendar, ChevronDown, ChevronRight, Mail, Phone, ExternalLink } from 'lucide-react'

export const TermsOfService: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<number[]>([])

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const terms = [
    {
      title: "📅 Booking & Reservations",
      items: [
        "Subject to availability • Valid ID required",
        "Online/phone/third-party bookings accepted",
        "Advance payment may be required",
        "We reserve cancellation rights for non-payment"
      ]
    },
    {
      title: "🕐 Check-in & Check-out",
      items: [
        "Check-in: 12:00 noon onwards",
        "Check-out: 11:00 AM sharp",
        "Late checkout available (charges apply)",
        "Guests liable for property damage"
      ]
    },
    {
      title: "💳 Cancellation & Refunds",
      items: [
        "Terms vary by booking platform",
        "Refunds via original payment method",
        "No-shows may forfeit refunds",
        "Processing: 7-10 business days"
      ]
    },
    {
      title: "👥 Guest Conduct",
      items: [
        "Respect guests, staff, and property",
        "No illegal activities permitted",
        "Eviction without refund for violations",
        "Smoking in designated areas only"
      ]
    },
    {
      title: "💻 Website & Online Services",
      items: [
        "Provide accurate booking information",
        "No unauthorized website access",
        "Third-party links not our responsibility",
        "Account suspension for violations"
      ]
    },
    {
      title: "⚠️ Liability Limitations",
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Compact Header */}
        <motion.section
          className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-12 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>

          <div className="relative max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold">Terms of Service</h1>
                </div>
                <p className="text-slate-300 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Effective: 1st September 2025</span>
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Quick Intro */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-slate-700 leading-relaxed">
              Welcome to <span className="font-semibold text-slate-900">AVR Lodge, Kolli Hills</span>.
              By booking or staying with us, you agree to these terms.
              <span className="text-slate-600"> Tap sections below to expand details.</span>
            </p>
          </motion.div>

          {/* Accordion Terms */}
          <div className="space-y-4">
            {terms.map((section, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
                >
                  <h3 className="font-semibold text-slate-900">{section.title}</h3>
                  {expandedSections.includes(index) ?
                    <ChevronDown className="w-5 h-5 text-slate-600" /> :
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  }
                </button>

                {expandedSections.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-slate-100"
                  >
                    <div className="px-6 py-4 space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start space-x-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-slate-700 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <motion.div
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h4 className="font-semibold mb-2">🔒 Privacy & Data</h4>
              <p className="text-blue-100 text-sm mb-3">Your data is protected. Read our policies:</p>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => window.location.href = '/privacy-policy'}
                  className="text-left text-blue-100 hover:text-white text-sm flex items-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Privacy Policy</span>
                </button>
                <button
                  onClick={() => window.location.href = '/data-deletion-policy'}
                  className="text-left text-blue-100 hover:text-white text-sm flex items-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Data Deletion Policy</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-slate-500 to-slate-600 text-white rounded-2xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h4 className="font-semibold mb-2">⚖️ Legal Info</h4>
              <div className="text-slate-100 text-sm space-y-1">
                <p><span className="font-medium">Governed by:</span> Indian Law</p>
                <p><span className="font-medium">Jurisdiction:</span> Tamil Nadu Courts</p>
                <p className="text-slate-200 text-xs mt-2">Terms may be updated. Check this page for latest version.</p>
              </div>
            </motion.div>
          </div>

          {/* Contact Footer */}
          <motion.div
            className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl p-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <h4 className="font-semibold mb-4 text-center">Questions? Contact Us</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="tel:+918122369100"
                className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <Phone className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium">+91 81223 69100</div>
                  <div className="text-slate-400 text-sm">Call us directly</div>
                </div>
              </a>
              <a
                href="mailto:johneyresort@gmail.com"
                className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium">johneyresort@gmail.com</div>
                  <div className="text-slate-400 text-sm">Email support</div>
                </div>
              </a>
            </div>
            <p className="text-center text-slate-400 text-xs mt-4">
              By booking with us, you agree to these terms and conditions.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default TermsOfService