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

  const content = [
    "Advance payment is required to confirm a booking. A valid government-issued photo ID proof with address is mandatory at check-in. Payments once made are non-refundable unless otherwise stated. Room tariff must be fully paid at the time of check-in.",

    "Standard check-in time is 12:00 noon, and standard check-out time is 11:00 AM. Early check-in and late check-out are subject to availability and may incur additional charges. Fixed timings ensure smooth operations and proper room preparation.",

    "Free cancellation or modification of bookings (guests/rooms) is allowed up to 48 hours before check-in. Cancellations within 24 hours of check-in may incur a one-night charge. No-shows will be charged for the entire stay.",

    "Guests must respect property rules, maintain decorum, and avoid disturbing other guests. Any damage, loss, or violation of house rules will attract penalties. Management reserves the right to deny accommodation or evict guests who misbehave or disturb others. Noise must be minimized after 12:00 midnight.",

    "Only registered guests are allowed inside rooms. Visitors may be permitted in common areas with prior approval. Extra guests will be charged as per the applicable tariff.",

    "Bed linen will be changed upon request or after two nights of stay. Guests are requested to switch off lights, fans, and air conditioning when leaving rooms.",

    "Smoking inside rooms is strictly prohibited. Alcohol consumption in reception areas and corridors is not allowed. The use of illegal substances, weapons, or hazardous materials is strictly prohibited. Pets may be allowed only in designated rooms upon prior confirmation.",

    "Guests are requested to dispose of trash only in provided bins. Throwing waste in neighboring lands, farms, or open areas is strictly prohibited. Guests must respect the surrounding farms, nature, and workers while staying at AVR.",

    "AVR Lodge is not responsible for loss or damage of personal belongings. Parking is at the owner's risk where provided. Main gates close at 11:00 PM for guest safety. Temporary outages of electricity, water, Wi-Fi, or other amenities are not the responsibility of AVR Lodge.",

    "The premises are under CCTV surveillance for guest safety and compliance with legal/police requirements. Guests are expected to treat staff and fellow guests with respect. Any harassment, abuse, or misconduct towards staff or other guests may result in cancellation of stay and legal action if required.",

    "Guests must provide accurate booking information and comply with all terms outlined in this agreement. Unauthorized access to AVR Lodge's website or systems is prohibited. AVR Lodge is not responsible for third-party website links or services.",

    "AVR Lodge is not liable for events beyond its reasonable control, including natural disasters, strikes, or other force majeure events. Guests are responsible for arranging their own travel, health, and property insurance, as AVR Lodge does not provide or include any insurance coverage. No refunds or compensation will be provided in such events.",

    "Liability for any loss, damage, or destruction of property caused by the guest, their visitors, or belongings rests entirely with the guest. AVR Lodge is not responsible for compensating guests for such damages, and guests may be charged for repair or replacement costs as necessary.",

    "Guests must provide truthful information when making bookings and following lodge policies. Management reserves the right to refuse service or accommodation to guests who appear intoxicated, engage in illegal activities, or behave in a manner that poses a risk to staff, property, or other guests.",

    "Guests may appear in lodge photographs or promotional materials. By staying at AVR Lodge, consent is assumed for use of non-sensitive imagery for marketing purposes unless explicitly communicated otherwise.",

    "Guests are expected to follow safety instructions and comply with all local laws. Any violation of laws, lodge rules, or regulations may result in eviction and legal action if necessary.",

    "Liability for any personal injury, theft, or loss of property during your stay at AVR Lodge is the responsibility of the guest.",

    "AVR Lodge is not liable for such incidents, and guests are strongly encouraged to arrange their own travel, health, and property insurance for protection.",

    "All disputes arising from bookings, stay, or related activities will be governed by Indian law. Courts in Tamil Nadu shall have exclusive jurisdiction.",

    "Payment methods accepted include cash, UPI, and certified card payment gateways. All transactions are processed securely, and guests are responsible for safeguarding their own payment credentials."
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
        <div className="bg-black text-white py-6">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                Terms of Service - AVR Lodge, Kolli Hills
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
                    href="/privacy-policy"
                    className="text-gray-300 hover:text-white text-xs transition-colors underline"
                  >
                    Privacy Policy
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

export default TermsOfService