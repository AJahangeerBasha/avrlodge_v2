import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Book Your Stay</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ready to experience the magic of Kolli Hills? Book your stay with us and create memories that will last a lifetime.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h3>
                <p className="text-gray-600 mb-6">
                  Have questions about your stay? We're here to help you plan the perfect getaway.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Kolli Hills, Tamil Nadu, India</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">+91 81223 69100</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">+91 72000 99647</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">johneyresort@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">24/7 Support Available</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-2">Why Choose AVR Lodge?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Prime location in Kolli Hills</li>
                  <li>• Comfortable accommodations</li>
                  <li>• Local expertise and guidance</li>
                  <li>• Flexible booking options</li>
                </ul>
              </div>
            </motion.div>

            {/* Booking Form */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gray-50 rounded-lg p-6"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkin">Check-in Date</Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={formData.checkin}
                      onChange={(e) => handleInputChange('checkin', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout">Check-out Date</Label>
                    <Input
                      id="checkout"
                      type="date"
                      value={formData.checkout}
                      onChange={(e) => handleInputChange('checkout', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.guests}
                    onChange={(e) => handleInputChange('guests', e.target.value)}
                    required
                    placeholder="Number of guests"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Special Requests</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Any special requests or preferences..."
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Sending Request...' : 'Send Reservation Request'}
                </Button>
              </form>
            </motion.div> */}
          </div>
        </div>
      </div>
    </section>
  )
}