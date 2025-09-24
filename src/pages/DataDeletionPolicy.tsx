import React from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Trash2, Mail, Phone, Clock, Shield, Facebook, ExternalLink } from 'lucide-react'

export const DataDeletionPolicy: React.FC = () => {
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

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50">
        {/* Compact Header */}
        <motion.section
          className="bg-gradient-to-r from-rose-600 to-red-600 text-white py-12 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>

          <div className="relative max-w-6xl mx-auto px-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold">Data Deletion Policy</h1>
                <p className="text-rose-100 text-sm">Your right to delete personal information</p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Alert Notice */}
          <motion.div
            className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-2xl p-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Important Notice</p>
                <p className="text-amber-700">
                  If you used Facebook Login or interacted via Meta platforms (Facebook, Instagram, WhatsApp),
                  you can request data deletion at any time.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3-Step Process */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Mail className="w-5 h-5 text-red-500" />
              <span>How to Request Data Deletion</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                <h3 className="font-semibold text-gray-900 mb-1">Send Email</h3>
                <p className="text-xs text-gray-600">Subject: "Data Deletion Request"</p>
              </div>

              <div className="bg-red-50 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                <h3 className="font-semibold text-gray-900 mb-1">Include Details</h3>
                <p className="text-xs text-gray-600">Account or booking information</p>
              </div>

              <div className="bg-red-50 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                <h3 className="font-semibold text-gray-900 mb-1">Processing</h3>
                <p className="text-xs text-gray-600">Completed within 7 business days</p>
              </div>
            </div>
          </motion.div>

          {/* Facebook Option */}
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Facebook className="w-6 h-6" />
              <h3 className="font-semibold">Facebook Users</h3>
            </div>
            <p className="text-blue-100 text-sm">
              Remove AVR Lodge access directly: <strong>Facebook Settings → Apps and Websites → AVR Lodge → Remove</strong>
            </p>
          </motion.div>

          {/* Legal Exceptions */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-yellow-500" />
              <span>Legal Compliance</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-2">✓ Can be deleted</h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Marketing preferences</li>
                  <li>• Social login data</li>
                  <li>• Non-essential details</li>
                </ul>
              </div>

              <div className="bg-orange-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-orange-800 mb-2">⚠️ Must be retained</h4>
                <ul className="text-xs text-orange-700 space-y-1">
                  <li>• Government ID records</li>
                  <li>• Financial transactions</li>
                  <li>• Legal compliance data</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-600">
                <Clock className="w-3 h-3 inline mr-1" />
                Some records must be retained per Indian regulations until legally permissible to delete.
              </p>
            </div>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.a
              href="mailto:johneyresort@gmail.com?subject=Data Deletion Request"
              className="bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-2xl p-6 block hover:from-slate-700 hover:to-slate-800 transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Mail className="w-6 h-6 mb-3" />
              <h3 className="font-semibold mb-1">Email Request</h3>
              <p className="text-slate-300 text-sm">johneyresort@gmail.com</p>
              <p className="text-slate-400 text-xs mt-1">Subject: "Data Deletion Request"</p>
            </motion.a>

            <motion.a
              href="tel:+918122369100"
              className="bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-2xl p-6 block hover:from-slate-700 hover:to-slate-800 transition-all"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Phone className="w-6 h-6 mb-3" />
              <h3 className="font-semibold mb-1">Phone Support</h3>
              <p className="text-slate-300 text-sm">+91 81223 69100</p>
              <p className="text-slate-400 text-xs mt-1">Business hours only</p>
            </motion.a>
          </div>

          {/* Related Links */}
          <motion.div
            className="bg-gray-100 rounded-2xl p-4 mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-gray-600 text-sm mb-2">Related Policies</p>
            <div className="flex justify-center space-x-4 text-xs">
              <button
                onClick={() => window.location.href = '/privacy-policy'}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Privacy Policy</span>
              </button>
              <button
                onClick={() => window.location.href = '/terms-of-service'}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Terms of Service</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default DataDeletionPolicy