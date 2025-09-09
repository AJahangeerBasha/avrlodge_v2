

import { motion } from 'framer-motion';
// import Image from 'next/image';

const GettingToKolliHills = () => {
  const transportationOptions = [
    {
      title: 'By Road',
      subtitle: 'Most Recommended',
      icon: '🚗',
      description: 'Kolli Hills is well connected by road with the famous 70 hairpin bends making it a favorite route for bikers and adventure seekers.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center',
      routes: [
        { from: 'Chennai', distance: '~360 km', time: '~7 hours', via: 'NH 38' },
        { from: 'Bangalore', distance: '~280 km', time: '~6 hours', via: 'Salem' },
        { from: 'Trichy', distance: '~90 km', time: '~2 hours', via: 'Direct' },
        { from: 'Salem', distance: '~85 km', time: '~2 hours', via: 'Direct' }
      ],
      tips: 'Private cars, taxis, or bike rides are the best way to reach the hilltop.'
    },
    {
      title: 'By Train',
      subtitle: 'Railway Connections',
      icon: '🚂',
      description: 'Convenient rail connections from major cities with easy onward travel to Kolli Hills.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center',
      stations: [
        { name: 'Namakkal', distance: '50 km', type: 'Nearest Railway Station' },
        { name: 'Salem Junction', distance: '90 km', type: 'Major Junction' }
      ],
      tips: 'From the station, you can hire a taxi or take a bus to Kolli Hills.'
    },
    {
      title: 'By Bus',
      subtitle: 'Public Transport',
      icon: '🚌',
      description: 'Regular bus services operated by TNSTC provide affordable and reliable transportation.',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&crop=center',
      routes: [
        { from: 'Namakkal', to: 'Semmedu', frequency: 'Regular' },
        { from: 'Salem', to: 'Semmedu', frequency: 'Regular' },
        { from: 'Rasipuram', to: 'Semmedu', frequency: 'Regular' }
      ],
      tips: 'From the bus stand, auto-rickshaws and taxis are available to reach resorts and viewpoints.'
    },
    {
      title: 'By Air',
      subtitle: 'Airport Connections',
      icon: '✈️',
      description: 'Fly into the nearest international airport and enjoy a scenic drive to Kolli Hills.',
      image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=400&fit=crop&crop=center',
      airport: {
        name: 'Trichy International Airport',
        distance: '105 km',
        type: 'Nearest Airport'
      },
      tips: 'Taxis can be arranged in advance to bring guests directly to our resort.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section id="getting-to-kolli-hills" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How to Reach Kolli Hills
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kolli Hills is nestled in the Eastern Ghats of Tamil Nadu and is known for its 70 thrilling hairpin bends,
            cool weather, and scenic views. It is well connected by road, rail, and air from major cities.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-8 mb-16"
        >
          {transportationOptions.map((option, index) => (
            <motion.div
              key={option.title}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={option.image}
                  alt={`${option.title} to Kolli Hills`}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 hover:bg-opacity-20 transition-all duration-300" />
                {/* <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
                  {index + 1}
                </div> */}
                <div className="absolute bottom-4 right-4 text-4xl">
                  {option.icon}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {option.title}
                  </h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {option.subtitle}
                  </span>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {option.description}
                </p>

                {option.routes && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Routes:</h4>
                    <div className="space-y-2">
                      {option.routes.map((route, routeIndex) => (
                        <motion.div
                          key={routeIndex}
                          variants={cardVariants}
                          className="bg-gray-50 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{route.from}</span>
                            <div className="text-right">
                              {'distance' in route ? (
                                <>
                                  <div className="text-sm font-semibold text-gray-700">{route.distance}</div>
                                  <div className="text-xs text-gray-500">{route.time}</div>
                                </>
                              ) : (
                                <div className="text-sm font-semibold text-gray-700">{route.frequency}</div>
                              )}
                            </div>
                          </div>
                          {'via' in route && route.via && (
                            <div className="text-xs text-gray-500 mt-1">via {route.via}</div>
                          )}
                          {'to' in route && (
                            <div className="text-xs text-gray-500 mt-1">to {route.to}</div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {option.stations && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Stations:</h4>
                    <div className="space-y-2">
                      {option.stations.map((station, stationIndex) => (
                        <motion.div
                          key={stationIndex}
                          variants={cardVariants}
                          className="bg-gray-50 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">{station.name}</div>
                              <div className="text-xs text-gray-500">{station.type}</div>
                            </div>
                            <div className="text-sm font-semibold text-gray-700">{station.distance}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {option.airport && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Airport:</h4>
                    <motion.div
                      variants={cardVariants}
                      className="bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{option.airport.name}</div>
                          <div className="text-xs text-gray-500">{option.airport.type}</div>
                        </div>
                        <div className="text-sm font-semibold text-gray-700">{option.airport.distance}</div>
                      </div>
                    </motion.div>
                  </div>
                )}

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    💡 {option.tips}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default GettingToKolliHills; 