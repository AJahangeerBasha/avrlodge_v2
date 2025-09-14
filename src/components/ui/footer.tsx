export default function Footer() {
  
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4">AVR Lodge</h3>
            <p className="text-gray-400 mb-4">
              Your gateway to serenity in the pristine hills of Tamil Nadu.
            </p>
            {/* <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <Icon
                  key={index}
                  className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors duration-200"
                />
              ))}
            </div> */}
          </div>

          {/* <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              {["home", "about", "rooms", "amenities", "contact"].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item)}
                    className="hover:text-white transition-colors duration-200 capitalize"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div> */}

          {/* <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Room Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Spa & Wellness</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Adventure Tours</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Event Hosting</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Airport Transfer</a></li>
            </ul>
          </div> */}

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li>KolliHills, Tamil Nadu</li>
              <li><a href="tel:+918122369100" className="flex items-center hover:underline">
                +91 81223 69100</a></li>
                <li><a href="tel:+917200099647" className="flex items-center hover:underline">
                +91 72000 99647</a></li>
              <li><a
                href="mailto:johneyresort@gmail.com" className="flex items-center hover:underline">
                johneyresort@gmail.com
              </a></li>
              <li><a
                href="https://www.avrlodge.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline"
              >www.avrlodge.com</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 AVR Lodge. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  )
}