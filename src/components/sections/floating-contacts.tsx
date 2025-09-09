import { useState } from "react";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaTelegramPlane,
  FaMapMarkerAlt,
} from "react-icons/fa";

const FloatingContactButtons = () => {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = "+919945425577";
  const whatsappNumber = "9945425577";
  const telegramUsername = "yourtelegramusername";
  const googleMapsUrl = "https://maps.app.goo.gl/1pQjetHWrJi3g7VC8";

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const contactButtons = [
    {
      icon: FaPhoneAlt,
      label: "Call",
      href: `tel:${phoneNumber}`,
      bgColor: "bg-gradient-to-br from-green-400 to-green-600",
      hoverColor: "hover:from-green-500 hover:to-green-700",
      shadowColor: "shadow-green-400/30",
      hoverShadow: "hover:shadow-green-500/50",
    },
    {
      icon: FaWhatsapp,
      label: "WhatsApp",
      href: `https://wa.me/${whatsappNumber}`,
      bgColor: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      hoverColor: "hover:from-emerald-500 hover:to-emerald-700",
      shadowColor: "shadow-emerald-400/30",
      hoverShadow: "hover:shadow-emerald-500/50",
      target: "_blank",
    },
    {
      icon: FaTelegramPlane,
      label: "Telegram",
      href: `https://t.me/${telegramUsername}`,
      bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
      hoverColor: "hover:from-blue-500 hover:to-blue-700",
      shadowColor: "shadow-blue-400/30",
      hoverShadow: "hover:shadow-blue-500/50",
      target: "_blank",
    },
    {
      icon: FaMapMarkerAlt,
      label: "Location",
      href: googleMapsUrl,
      bgColor: "bg-gradient-to-br from-red-400 to-red-600",
      hoverColor: "hover:from-red-500 hover:to-red-700",
      shadowColor: "shadow-red-400/30",
      hoverShadow: "hover:shadow-red-500/50",
      target: "_blank",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end gap-4 mb-6">
        {contactButtons.map((button, index) => {
          const Icon = button.icon;
          return (
            <div
              key={index}
              className={`transform transition-all duration-500 ease-out ${
                isOpen
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-12 opacity-0 scale-90 pointer-events-none"
              }`}
              style={{
                transitionDelay: isOpen
                  ? `${index * 100}ms`
                  : `${(contactButtons.length - 1 - index) * 50}ms`,
              }}
            >
              <div className="group relative">
                <div className="absolute right-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out scale-95 group-hover:scale-100 pointer-events-none">
                  <div className="bg-gray-900/95 backdrop-blur-sm text-white text-sm py-2 px-4 rounded-xl shadow-2xl whitespace-nowrap border border-gray-700">
                    {button.label}
                    <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-gray-900/95"></div>
                  </div>
                </div>

                <a
                  href={button.href}
                  target={button.target}
                  rel={button.target ? "noopener noreferrer" : undefined}
                  className={`
                    ${button.bgColor} ${button.hoverColor} ${button.shadowColor} ${button.hoverShadow}
                    flex items-center justify-center w-12 h-12 rounded-xl text-white 
                    shadow-lg transform transition-all duration-300 ease-out
                    hover:scale-110 hover:shadow-xl hover:-translate-y-1 active:scale-95
                    border border-white/20 backdrop-blur-sm
                  `}
                  aria-label={button.label}
                >
                  <Icon size={16} className="drop-shadow-sm" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative">
        <button
          onClick={handleToggle}
          className={`
            relative overflow-hidden bg-gradient-to-br from-black to-gray-800
             
            w-14 h-14 rounded-xl flex items-center justify-center text-white
            shadow-2xl transform transition-all duration-300 ease-out
            hover:scale-110 hover:shadow-2xl hover:-translate-y-1 active:scale-95
            border border-white/20 backdrop-blur-sm
          `}
          aria-label={isOpen ? "Close contact menu" : "Open contact menu"}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <div className="relative">
            <div
              className={`transform transition-all duration-300 ease-out ${
                isOpen
                  ? "rotate-45 opacity-0 scale-0"
                  : "rotate-0 opacity-100 scale-100"
              }`}
            >
              <span className="text-2xl">+</span>
            </div>
            <div
              className={`absolute inset-0 flex items-center justify-center transform transition-all duration-300 ease-out ${
                isOpen
                  ? "rotate-0 opacity-100 scale-100"
                  : "rotate-45 opacity-0 scale-0"
              }`}
            >
              <span className="text-2xl">×</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default FloatingContactButtons;
