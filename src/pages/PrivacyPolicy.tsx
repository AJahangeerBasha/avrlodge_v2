import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Shield, Mail, Phone, ChevronDown, ChevronRight, User, Lock, Eye, FileText, Globe, Scale, ExternalLink, Calendar } from 'lucide-react'

export const PrivacyPolicy: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<number[]>([])

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const sections = [
    {
      title: "📋 Information We Collect",
      items: [
        "Personal details: Name, phone, email, address",
        "Government ID (required under Indian law)",
        "Booking information: Dates, preferences, payments",
        "Communication data: Emails, calls, messages",
        "Website data: IP address, browser, cookies"
      ]
    },
    {
      title: "🎯 How We Use Your Information",
      items: [
        "Managing and confirming reservations",
        "Legal compliance for guest registration",
        "Processing payments securely",
        "Communication and customer service",
        "Improving services and user experience"
      ]
    },
    {
      title: "🔗 Information Sharing",
      items: [
        "Government authorities (legal compliance)",
        "Trusted service providers (payment processors)",
        "Third-party booking platforms",
        "Legal protection when required by law"
      ]
    },
    {
      title: "🍪 Cookies & Website Usage",
      items: [
        "Cookies enhance browsing experience",
        "Remember preferences and analyze traffic",
        "You can disable cookies (may affect features)",
        "Third-party links not our responsibility"
      ]
    },
    {
      title: "🔒 Data Security",
      items: [
        "Physical, technical, administrative safeguards",
        "Reasonable protection measures implemented",
        "No system is 100% secure",
        "Cannot guarantee absolute data protection"
      ]
    },
    {
      title: "⚖️ Your Rights",
      items: [
        "Request access to your data",
        "Request correction of inaccurate information",
        "Request data deletion (subject to legal requirements)",
        "Contact us to exercise these rights"
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

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
        {/* Compact Header */}
        <motion.section
          className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-12 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent"></div>

          <div className="relative max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold">Privacy Policy</h1>
                </div>
                <p className="text-green-100 flex items-center space-x-2">
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
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-green-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-green-700 leading-relaxed">
              At <span className="font-semibold text-green-900">AVR Lodge, Kolli Hills</span>,
              we respect your privacy and protect your personal information.
              <span className="text-green-600"> Tap sections below to learn more.</span>
            </p>
          </motion.div>

          {/* Accordion Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-green-50/80 transition-colors"
                >
                  <h3 className="font-semibold text-green-900">{section.title}</h3>
                  {expandedSections.includes(index) ?
                    <ChevronDown className="w-5 h-5 text-green-600" /> :
                    <ChevronRight className="w-5 h-5 text-green-600" />
                  }
                </button>

                {expandedSections.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-green-100"
                  >
                    <div className="px-6 py-4 space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start space-x-3">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-green-700 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Policy Updates */}
          <motion.div
            className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl p-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="w-6 h-6" />
              <h3 className="font-semibold">Policy Updates</h3>
            </div>
            <p className="text-teal-100 text-sm">
              We may update this policy periodically. Check this page for the latest version with updated effective dates.
            </p>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <motion.a
              href="tel:+918122369100"
              className="bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-2xl p-6 block hover:from-slate-700 hover:to-slate-800 transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Phone className="w-6 h-6 mb-3" />
              <h3 className="font-semibold mb-1">Phone Support</h3>
              <p className="text-slate-300 text-sm">+91 81223 69100</p>
              <p className="text-slate-400 text-xs mt-1">Business hours only</p>
            </motion.a>

            <motion.a
              href="mailto:johneyresort@gmail.com?subject=Privacy Policy Inquiry"
              className="bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-2xl p-6 block hover:from-slate-700 hover:to-slate-800 transition-all"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <Mail className="w-6 h-6 mb-3" />
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-slate-300 text-sm">johneyresort@gmail.com</p>
              <p className="text-slate-400 text-xs mt-1">Subject: "Privacy Policy Inquiry"</p>
            </motion.a>
          </div>

          {/* Related Links */}
          <motion.div
            className="bg-gray-100 rounded-2xl p-4 mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <p className="text-gray-600 text-sm mb-2">Related Policies</p>
            <div className="flex justify-center space-x-4 text-xs">
              <button
                onClick={() => window.location.href = '/terms-of-service'}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Terms of Service</span>
              </button>
              <button
                onClick={() => window.location.href = '/data-deletion-policy'}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Data Deletion Policy</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default PrivacyPolicy