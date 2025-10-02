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
        <div className="bg-black text-white py-6">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                Data Deletion Policy - AVR Lodge, Kolli Hills
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <p>• At AVR Lodge, guests have the right to request deletion of their personal data. This includes any personal information collected during bookings, stays, or interactions with our services.</p>

                  <p>• Guests who used Facebook Login or interacted with AVR Lodge via Meta platforms, including Facebook, Instagram, or WhatsApp, may request deletion of related data at any time.</p>

                  <p>• To request deletion, guests must send an email with the subject line 'Data Deletion Request' to the official AVR Lodge contact email. The request should include sufficient information to identify the guest account or booking details.</p>

                  <p>• All valid data deletion requests will be processed and completed within seven business days of receipt.</p>

                  <p>• Facebook users may also remove AVR Lodge access directly through their Facebook account by navigating to Facebook Settings, then Apps and Websites, selecting AVR Lodge, and choosing Remove.</p>

                  <p>• The types of data that <strong>can be deleted</strong> upon request include marketing preferences, social login data, and any non-essential details not required for legal or operational purposes.</p>

                  <p>• Certain data <strong>must be retained</strong> to comply with Indian regulations, including government-issued ID records, financial transaction history, and other information necessary for legal compliance. Such records will be held only as long as legally required and deleted when permissible.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="py-6 bg-black text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-lg font-bold text-white mb-4">Contact for Data Deletion</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white mb-2">Email</h3>
                  <a
                    href="mailto:johneyresort@gmail.com?subject=Data Deletion Request"
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    johneyresort@gmail.com
                  </a>
                  <p className="text-gray-400 text-xs mt-1">Subject: "Data Deletion Request"</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-white mb-2">Phone</h3>
                  <a
                    href="tel:+918122369100"
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    +91 81223 69100
                  </a>
                  <p className="text-gray-400 text-xs mt-1">Business hours only</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-gray-400 text-xs mb-2">Related Policies</p>
                <div className="space-x-4">
                  <a
                    href="/privacy-policy"
                    className="text-gray-300 hover:text-white text-xs transition-colors underline"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="/terms-of-service"
                    className="text-gray-300 hover:text-white text-xs transition-colors underline"
                  >
                    Terms of Service
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

export default DataDeletionPolicy