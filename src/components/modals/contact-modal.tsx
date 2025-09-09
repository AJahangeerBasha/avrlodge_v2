import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  MessageCircle,
  ExternalLink
} from 'lucide-react'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Location',
      value: 'KolliHills, Namakkal District, Tamil Nadu 637411',
      action: 'View on Map',
      href: 'https://maps.google.com/?q=KolliHills,Namakkal,TamilNadu'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 81223 69100',
      action: 'Call Now',
      href: 'tel:+919444456789'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'reservations@avrlodge.com',
      action: 'Send Email',
      href: 'mailto:reservations@avrlodge.com'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: '24/7 - Always Available',
      action: null,
      href: null
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white dark:text-gray-900" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Contact Us
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get in touch with us for reservations, inquiries, or any assistance you need.
              </p>

              <div className="space-y-3">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                        <info.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {info.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {info.value}
                        </p>
                        {info.action && info.href && (
                          <a
                            href={info.href}
                            target={info.href.startsWith('http') ? '_blank' : '_self'}
                            rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            {info.action}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open('tel:+919444456789', '_self')}
                    className="flex items-center justify-center gap-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    Call Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open('mailto:reservations@avrlodge.com', '_self')}
                    className="flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </motion.button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Need Immediate Assistance?
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-200">
                  Our team is available 24/7 to help with your reservations and inquiries.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 