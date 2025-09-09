import { motion } from "framer-motion";

const GettingToKolliHillsDesign2 = () => {
  const transportationOptions = [
    {
      title: "By Road",
      subtitle: "Most Recommended",
      icon: "🚗",
      description:
        "Well connected by road with the famous 70 hairpin bends making it a favorite route for bikers and adventure seekers.",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop&crop=center",
      routes: [
        {
          from: "Chennai",
          distance: "~360 km",
          time: "~7 hours",
          via: "NH 38",
        },
        {
          from: "Bangalore",
          distance: "~280 km",
          time: "~6 hours",
          via: "Salem",
        },
        { from: "Trichy", distance: "~90 km", time: "~2 hours", via: "Direct" },
        { from: "Salem", distance: "~85 km", time: "~2 hours", via: "Direct" },
      ],
    },
    {
      title: "By Train",
      subtitle: "Railway Connections",
      icon: "🚂",
      description:
        "Convenient rail connections from major cities with easy onward travel to Kolli Hills.",
      image:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop&crop=center",
      stations: [
        {
          name: "Namakkal",
          distance: "50 km",
          type: "Nearest Railway Station",
        },
        { name: "Salem Junction", distance: "90 km", type: "Major Junction" },
      ],
    },
    {
      title: "By Bus",
      subtitle: "Public Transport",
      icon: "🚌",
      description:
        "Regular bus services operated by TNSTC provide affordable and reliable transportation.",
      image:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop&crop=center",
      routes: [
        { from: "Namakkal", to: "Semmedu", frequency: "Regular" },
        { from: "Salem", to: "Semmedu", frequency: "Regular" },
        { from: "Rasipuram", to: "Semmedu", frequency: "Regular" },
      ],
    },
    {
      title: "By Air",
      subtitle: "Airport Connections",
      icon: "✈️",
      description:
        "Fly into the nearest international airport and enjoy a scenic drive to Kolli Hills.",
      image:
        "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=500&h=300&fit=crop&crop=center",
      airport: {
        name: "Trichy International Airport",
        distance: "105 km",
        type: "Nearest Airport",
      },
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="getting-to-kolli-hills" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How to Reach Kolli Hills
          </h2>
          {/* <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kolli Hills is nestled in the Eastern Ghats of Tamil Nadu and is known for its 70 thrilling hairpin bends, 
            cool weather, and scenic views. It is well connected by road, rail, and air from major cities.
          </p> */}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {transportationOptions.map((option, index) => (
            <motion.div
              key={option.title}
              variants={itemVariants}
              className="group cursor-pointer"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={option.image}
                    alt={`${option.title} to Kolli Hills`}
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-400 w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
                  <div className="absolute top-3 left-3 bg-white bg-opacity-90 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="absolute bottom-3 right-3 text-2xl">
                    {option.icon}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {option.title}
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      {option.subtitle}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
                    {option.description}
                  </p>

                  {option.routes && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Routes:
                      </h4>
                      <div className="space-y-1">
                        {option.routes.slice(0, 2).map((route, routeIndex) => (
                          <motion.div
                            key={routeIndex}
                            variants={cardVariants}
                            className="bg-white rounded-md p-2 text-xs"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">
                                {route.from}
                              </span>
                              <div className="text-right">
                                {"distance" in route ? (
                                  <>
                                    <div className="font-semibold text-gray-700">
                                      {route.distance}
                                    </div>
                                    <div className="text-gray-500">
                                      {route.time}
                                    </div>
                                  </>
                                ) : (
                                  <div className="font-semibold text-gray-700">
                                    {route.frequency}
                                  </div>
                                )}
                              </div>
                            </div>
                            {"via" in route && route.via && (
                              <div className="text-gray-500 mt-1">
                                via {route.via}
                              </div>
                            )}
                            {"to" in route && (
                              <div className="text-gray-500 mt-1">
                                to {route.to}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {option.stations && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Stations:
                      </h4>
                      <div className="space-y-1">
                        {option.stations.map((station, stationIndex) => (
                          <motion.div
                            key={stationIndex}
                            variants={cardVariants}
                            className="bg-white rounded-md p-2 text-xs"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {station.name}
                                </div>
                                <div className="text-gray-500">
                                  {station.type}
                                </div>
                              </div>
                              <div className="font-semibold text-gray-700">
                                {station.distance}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {option.airport && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Airport:
                      </h4>
                      <motion.div
                        variants={cardVariants}
                        className="bg-white rounded-md p-2 text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              {option.airport.name}
                            </div>
                            <div className="text-gray-500">
                              {option.airport.type}
                            </div>
                          </div>
                          <div className="font-semibold text-gray-700">
                            {option.airport.distance}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GettingToKolliHillsDesign2;
