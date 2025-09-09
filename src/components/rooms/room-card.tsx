import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Users, Star, MapPin, Wifi, Snowflake, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoomCardProps {
  room: {
    id: string
    room_number: string
    room_type: string
    price_per_night: number
    max_guests: number
    floor_number: number
    status: string
    amenities?: string[]
    image?: string
  }
  onBookNow: (roomId: string) => void
  isAvailable: boolean
}

const RoomCard = memo(({ room, onBookNow, isAvailable }: RoomCardProps) => {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />
      case 'ac':
        return <Snowflake className="w-4 h-4" />
      case 'bike storage':
        return <Car className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  const getRoomImage = (roomType: string) => {
    switch (roomType.toLowerCase()) {
      case "couple's cove":
        return '/images/rooms/couplecove.jpeg'
      case 'family nest':
        return '/images/rooms/familynest.jpeg'
      case "riders' haven":
        return '/images/rooms/ridershaven.jpeg'
      case 'dormitory stay':
        return '/images/rooms/dormitory.jpeg'
      default:
        return '/images/rooms/couplecove.jpeg'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 group transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Image Section */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={getRoomImage(room.room_type)}
          alt={room.room_type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${isAvailable 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }
          `}>
            {isAvailable ? 'Available' : 'Occupied'}
          </span>
        </div>

        {/* Room Number */}
        <div className="absolute bottom-4 left-4">
          <span className="text-white text-lg font-bold">Room {room.room_number}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-6">
        {/* Room Type and Rating */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0 mb-3">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
              {room.room_type}
            </h3>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">Floor {room.floor_number}</span>
            </div>
          </div>
          <div className="flex items-center self-start sm:self-auto">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-900 dark:text-white ml-1">4.8</span>
          </div>
        </div>

        {/* Guest Capacity */}
        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm">Up to {room.max_guests} guests</span>
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-700 dark:text-gray-300"
                >
                  {getAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </div>
              ))}
              {room.amenities.length > 4 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{room.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price and Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              ₹{room.price_per_night.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">/night</span>
          </div>
          
          <Button
            onClick={() => onBookNow(room.id)}
            disabled={!isAvailable}
            className={`
              w-full sm:w-auto min-h-[44px] touch-manipulation font-semibold transition-all duration-200 shadow-md hover:shadow-lg
              ${isAvailable 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform hover:scale-105 active:scale-95' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              }
            `}
          >
            {isAvailable ? 'Book Now' : 'Not Available'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
})

RoomCard.displayName = 'RoomCard'

export { RoomCard } 