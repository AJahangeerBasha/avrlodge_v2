import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Users } from "lucide-react";

const rooms = [
  {
    name: "Couple’s Cove",
    price: "₹1,200/night",
    image: "/images/rooms/couplecove.jpeg",
    description:
      "Ideal for couples or solo travelers seeking comfort and privacy.",
    // Cozy, well-appointed rooms made for relaxation. A quiet escape surrounded by nature.",
    pax: 2,
    amenities: [
      "King Size Bed",
      "Private Balcony",
      "Premium Bathroom",
      "Complimentary WiFi",
    ],
  },
  {
    name: "Family Nest",
    price: "₹2,200/night",
    image: "/images/rooms/familynest.jpeg",
    description: "Designed for families, friends and small groups.",
    //  Comfortably sized with warm interiors, these rooms offer a perfect base for bonding and exploration. Ideal for longer stays or quick breaks with loved ones.",
    pax: 4,
    amenities: [
      "Queen Size Bed",
      "Garden View",
      "Work Desk",
      "Mini Refrigerator",
    ],
  },
  {
    name: "Riders' Haven",
    price: "₹3,000/night",
    image: "/images/rooms/ridershaven.jpeg",
    description:
      "Perfect for groups of bikers, backpackers, or friends on a road trip.",
    //  Spacious and casual, this stay is designed for adventure seekers who travel together. Secure parking and group-friendly sleeping arrangements..",
    pax: 6,
    amenities: [
      "Separate Living Area",
      "Traditional Decor",
      "Jacuzzi Bathroom",
      "Butler Service",
    ],
  },
  {
    name: "Dormitory Stay",
    price: "₹350/night",
    image: "/images/rooms/dormitory.jpeg",
    description:
      "Great for budget travelers, trekking groups and yoga students.",
    //  Talk to us—we’ll try to accommodate you nearby arrange a shared stay that fits your needs.",
    pax: 1,
    amenities: [
      "Double Bed",
      "Air Conditioning",
      "Cable TV",
      "24hr Room Service",
    ],
  },
];

export default function RoomsSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section id="rooms" className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Accommodations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Each room at AVR Lodge is a sanctuary of comfort, thoughtfully
            designed to immerse you in the natural beauty of KolliHills.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {rooms.map((room, index) => (
            <motion.div
              key={room.name}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: index * 0.1,
              }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl mb-6 h-64 ">
                <img
                  src={room.image}
                  alt={room.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="flex relative z-20 justify-between p-2">
                  <div className="flex items-center text-white px-3 py-1 rounded-full text-sm dark:text-gray-400 bg-black bg-opacity-70">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{room.pax}</span>
                  </div>
                  <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                    {room.price}
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-serif font-bold mb-3">
                {room.name}
              </h3>
              <p className="text-gray-600 mb-4">{room.description}</p>
              {/* <ul className="text-sm text-gray-600 space-y-1">
                {room.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center">
                    <Check className="w-4 h-4 text-black mr-2" />
                    {amenity}
                  </li>
                ))}
              </ul> */}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
