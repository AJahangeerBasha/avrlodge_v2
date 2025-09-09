import { motion } from "framer-motion";

const KolliHillsTop25AttractionsDesign2 = () => {
  const categories = [
    {
      title: "Nature & Scenic Beauty",
      icon: "🌿",
      attractions: [
        {
          name: "Agaya Gangai Waterfalls",
          description: "300 ft fall, reached by 1200 steps",
          image:
            "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop&crop=center",
        },
        {
          name: "Masila Falls",
          description: "Gentle, easy-access waterfall",
          image:
            "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop&crop=center&sat=-30",
        },
        {
          name: "Namma Aruvi",
          description: "Local waterfall and natural beauty",
          image:
            "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop&crop=center&sat=-40",
        },
        {
          name: "Mini Falls",
          description: "Smaller, seasonal waterfall",
          image:
            "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop&crop=center&sat=-50",
        },
        {
          name: "Seekuparai Viewpoint",
          description: "Panoramic valley and sunrise view",
          image:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center",
        },
        {
          name: "Selur Viewpoint",
          description: "Serene, less crowded alternative",
          image:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center&sat=-20",
        },
        {
          name: "Botanical Garden",
          description: "Rare herbs, greenery, and kids' play area",
          image:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center",
        },
        {
          name: "Vasalurpatty Boat House",
          description: "Paddle boats and lakeside views",
          image:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center&sat=-60",
        },
        {
          name: "Sunrise and Sunset Viewpoint (Hidden)",
          description: "Best experienced with locals",
          image:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center&sat=-30",
        },
      ],
    },
    {
      title: "Culture & Heritage",
      icon: "🏛️",
      attractions: [
        {
          name: "Arapaleeswarar Temple",
          description: "Ancient Shiva temple",
          image:
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&crop=center",
        },
        {
          name: "Kolli Pavai Statue",
          description: "Cultural landmark tied to local legends",
          image:
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&crop=center&sat=-30",
        },
        {
          name: "Ettukai Amman Temple",
          description: "Sacred hilltop shrine",
          image:
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&crop=center&sat=-40",
        },
        {
          name: "Siddhar Caves",
          description: "Meditation caves of ancient mystics",
          image:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center&sat=-50",
        },
        {
          name: "Local Festivals Area",
          description: "Traditional events, music & rituals",
          image:
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&crop=center&sat=-70",
        },
        {
          name: "Hilltop Shrines",
          description: "Scattered small temples on hill routes",
          image:
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&crop=center&sat=-80",
        },
      ],
    },
    {
      title: "Trekking & Adventure",
      icon: "🏔️",
      attractions: [
        {
          name: "Forest Trek Routes",
          description: "Popular with bikers & hikers",
          image:
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center",
        },
        {
          name: "Hairpin Bend Drive (70 Bends)",
          description: "Iconic biking trail",
          image:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center&sat=-30",
        },
      ],
    },
    {
      title: "Local Food & Markets",
      icon: "🛍️",
      attractions: [
        {
          name: "Semmedu Market",
          description: "Fresh produce, snacks & handmade items",
          image:
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center",
        },
        {
          name: "Traditional Cuisine Point",
          description: "Local foods: millet, herbs, etc.",
          image:
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center&sat=-30",
        },
        {
          name: "Firewood & Herbal Product Shops",
          description: "Unique, local items",
          image:
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center&sat=-40",
        },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const categoryVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const attractionVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  let counter = 1; // 👈 This is the fix

  return (
    <section id="attractions" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Top Attractions in Kolli Hills
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the hidden gems and must-visit destinations that make Kolli
            Hills a paradise for nature lovers, adventure seekers, and culture
            enthusiasts.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-12"
        >
          {categories.map((category) => (
            <motion.div
              key={category.title}
              variants={categoryVariants}
              className="bg-gray-50 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{category.icon}</span>
                <h3 className="text-2xl font-bold text-gray-900">
                  {category.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {category.attractions.map((attraction) => {
                  const currentIndex = counter++;

                  return (
                    <motion.div
                      key={attraction.name}
                      variants={attractionVariants}
                      className="group cursor-pointer"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-white rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={attraction.image}
                            alt={attraction.name}
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-400 w-full h-full"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
                          <div className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                            {currentIndex}
                          </div>
                        </div>

                        <div className="p-3">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                            {attraction.name}
                          </h4>
                          <p className="text-xs text-gray-600 leading-tight line-clamp-2">
                            {attraction.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default KolliHillsTop25AttractionsDesign2;
