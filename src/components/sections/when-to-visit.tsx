import { motion } from 'framer-motion';

const WhenToVisit = () => {
  const seasons = [
    {
      title: 'Summer Escape',
      period: 'March – May',
      temperature: '18°C to 25°C',
      description: 'Clear skies and perfect visibility for sightseeing and bike rides',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center'
    },
    {
      title: 'Monsoon Magic',
      period: 'June – September',
      temperature: '14°C to 22°C',
      description: 'Lush greenery and misty mountain views. Waterfalls in full flow — perfect for nature lovers and photographers. Occasional rain showers',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center'
    },
    {
      title: 'Cool & Crisp',
      period: 'October – February',
      temperature: '13°C to 20°C',
      description: 'Chilly mornings and cozy campfire nights',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center&sat=-50&brightness=-20'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
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
  return (
    <section id="when-to-visit" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            When to Visit
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kolli Hills offers a refreshing climate year-round, thanks to its elevation and lush greenery.
            Here's what you can expect across the seasons:
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {seasons.map((season) => (
            <motion.div
              key={season.title}
              variants={itemVariants}
              className="bg-gray-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <motion.div
                className="relative h-64 bg-gray-200 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={season.image}
                  alt={`${season.title} in Kolli Hills`}
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700 w-full h-full"
                />
                <motion.div
                  className="absolute inset-0 bg-black bg-opacity-20"
                  whileHover={{ opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {season.title}
                </h3>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {season.period}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Temperature: {season.temperature}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {season.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default WhenToVisit; 