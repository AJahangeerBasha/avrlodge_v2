

import { motion } from 'framer-motion';
// import Image from 'next/image';

const KolliHillsTop25Attractions = () => {
  const categories = [
    {
      title: 'Nature & Scenic Beauty',
      attractions: [
        {
          name: 'Agaya Gangai Waterfalls',
          description: '300 ft fall, reached by 1200 steps',
          image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=400&fit=crop&crop=center'
        },
        {
          name: 'Masila Falls',
          description: 'Gentle, easy-access waterfall',
          image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=400&fit=crop&crop=center&sat=-30'
        },
        {
          name: 'Namma Aruvi',
          description: 'Local waterfall and natural beauty',
          image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=400&fit=crop&crop=center&sat=-40'
        },
        {
          name: 'Mini Falls',
          description: 'Smaller, seasonal waterfall',
          image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=400&fit=crop&crop=center&sat=-50'
        },
        {
          name: 'Seekuparai Viewpoint',
          description: 'Panoramic valley and sunrise view',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center'
        },
        {
          name: 'Selur Viewpoint',
          description: 'Serene, less crowded alternative',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center&sat=-20'
        },
        {
          name: 'Botanical Garden',
          description: 'Rare herbs, greenery, and kids\' play area',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&crop=center'
        },
        {
          name: 'Vasalurpatty Boat House',
          description: 'Paddle boats and lakeside views',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center&sat=-60'
        },
        {
          name: 'Sunrise Viewpoint (Hidden)',
          description: 'Best experienced with locals',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center&sat=-30'
        },
        {
          name: 'Sunset Spot (Hidden)',
          description: 'Quiet and magical end to the day',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center&sat=-40'
        }
      ]
    },
    {
      title: 'Culture & Heritage',
      attractions: [
        {
          name: 'Arapaleeswarar Temple',
          description: 'Ancient Shiva temple',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center'
        },
        {
          name: 'Kolli Pavai Statue',
          description: 'Cultural landmark tied to local legends',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center&sat=-30'
        },
        {
          name: 'Ettukai Amman Temple',
          description: 'Sacred hilltop shrine',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center&sat=-40'
        },
        {
          name: 'Siddhar Caves',
          description: 'Meditation caves of ancient mystics',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center&sat=-50'
        },
        {
          name: 'Local Tribal Villages',
          description: 'Authentic lifestyle and architecture',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center&sat=-60'
        },
        {
          name: 'Local Festivals Area',
          description: 'Traditional events, music & rituals',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center&sat=-70'
        },
        {
          name: 'Hilltop Shrines',
          description: 'Scattered small temples on hill routes',
          image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center&sat=-80'
        }
      ]
    },
    {
      title: 'Trekking & Adventure',
      attractions: [
        {
          name: 'Forest Trek Routes',
          description: 'Popular with bikers & hikers',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&crop=center'
        },
        {
          name: 'Hairpin Bend Drive (70 Bends)',
          description: 'Iconic biking trail',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center&sat=-30'
        },
        {
          name: 'Trek Circuit: Falls + Temple + Caves',
          description: 'Half-day combo trek',
          image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&crop=center&sat=-40'
        }
      ]
    },
    {
      title: 'Local Food & Markets',
      attractions: [
        {
          name: 'Semmedu Market',
          description: 'Fresh produce, snacks & handmade items',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&crop=center'
        },
        {
          name: 'Traditional Cuisine Point',
          description: 'Local foods: millet, herbs, etc.',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&crop=center&sat=-30'
        },
        {
          name: 'Firewood & Herbal Product Shops',
          description: 'Unique, local items',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&crop=center&sat=-40'
        }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const categoryVariants = {
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

  const attractionVariants = {
    hidden: { opacity: 0, scale: 0.9 },
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
    <section id="attractions" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Top 25 Attractions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the hidden gems and must-visit destinations that make Kolli Hills a paradise for nature lovers, 
            adventure seekers, and culture enthusiasts.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-16"
        >
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              variants={categoryVariants}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {category.title}
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.attractions.map((attraction, attractionIndex) => (
                  <motion.div
                    key={attraction.name}
                    variants={attractionVariants}
                    className="group cursor-pointer"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={attraction.image}
                          alt={attraction.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-10 transition-all duration-300" />
                        <div className="absolute top-4 left-4 bg-white bg-opacity-90 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                          {categoryIndex * 10 + attractionIndex + 1}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                          {attraction.name}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {attraction.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

      
      </div>
    </section>
  );
};

export default KolliHillsTop25Attractions; 