import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, MapPin, Star, Wifi, Snowflake, Car, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { useBooking } from '@/providers/booking-provider'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'

interface RoomDetailsModalProps {
  room: {
    id: string
    room_number: string
    room_type: string
    price_per_night: number
    max_guests: number
    floor_number: number
    status: string
    amenities?: string[]
    is_available: boolean
  }
  isOpen: boolean
  onClose: () => void
  checkInDate: Date | null
  checkOutDate: Date | null
  guestCount: number
}

export function RoomDetailsModal({
  room,
  isOpen,
  onClose,
  checkInDate,
  checkOutDate,
  guestCount
}: RoomDetailsModalProps) {
  // Use the passed dates directly - no state changes allowed
  const [selectedGuestCount, setSelectedGuestCount] = useState(guestCount)
  const [isLoading, setIsLoading] = useState(false)
  
  const { setRoom, setDates, setGuestCount } = useBooking()
  const { toast } = useToast()
  const navigate = useNavigate()

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-5 h-5" />
      case 'ac':
        return <Snowflake className="w-5 h-5" />
      case 'bike storage':
        return <Car className="w-5 h-5" />
      default:
        return <Star className="w-5 h-5" />
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

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0
    return Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    return room.price_per_night * nights
  }

  const handleGuestCountChange = (increment: boolean) => {
    const newCount = increment ? selectedGuestCount + 1 : selectedGuestCount - 1
    if (newCount >= 1 && newCount <= room.max_guests) {
      setSelectedGuestCount(newCount)
    }
  }

  const handleProceedToCheckout = () => {
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Missing Dates",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      })
      return
    }

    if (checkInDate >= checkOutDate) {
      toast({
        title: "Invalid Dates",
        description: "Check-out date must be after check-in date",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Set booking details
    setRoom(room)
    setDates(checkInDate, checkOutDate)
    setGuestCount(selectedGuestCount)

    // Navigate to checkout
    navigate('/checkout')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Room Details
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Room Info */}
                <div>
                  {/* Room Image */}
                  <div className="relative h-64 rounded-lg overflow-hidden mb-6">
                    <img
                      src={getRoomImage(room.room_type)}
                      alt={room.room_type}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="text-white text-xl font-bold">Room {room.room_number}</span>
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {room.room_type}
                      </h3>
                      <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Floor {room.floor_number}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Up to {room.max_guests} guests</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Amenities
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {room.amenities.map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                            >
                              {getAmenityIcon(amenity)}
                              <span>{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Room Description */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        About this room
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Experience comfort and tranquility in our {room.room_type.toLowerCase()}. 
                        This well-appointed room offers modern amenities and stunning views, 
                        perfect for your stay at AVR Lodge.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Booking Form */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Book This Room
                    </h4>

                    {/* Date Selection - Read Only */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Check-in & Check-out
                      </label>
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                            <span className="text-gray-900 dark:text-white font-medium">
                              {checkInDate ? checkInDate.toLocaleDateString() : 'Not selected'}
                            </span>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">to</div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                            <span className="text-gray-900 dark:text-white font-medium">
                              {checkOutDate ? checkOutDate.toLocaleDateString() : 'Not selected'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Guest Count */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Guests
                      </label>
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGuestCountChange(false)}
                          disabled={selectedGuestCount <= 1}
                          className="w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <div className="flex items-center mx-4">
                          <Users className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                          <span className="text-gray-900 dark:text-white font-medium">
                            {selectedGuestCount} {selectedGuestCount === 1 ? 'Guest' : 'Guests'}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGuestCountChange(true)}
                          disabled={selectedGuestCount >= room.max_guests}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          ₹{room.price_per_night.toLocaleString()} × {calculateNights()} nights
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          ₹{calculateTotal().toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            Total
                          </span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{calculateTotal().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Proceed Button */}
                    <Button
                      onClick={handleProceedToCheckout}
                      disabled={!checkInDate || !checkOutDate || isLoading}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 py-3"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Proceed to Checkout'
                      )}
                    </Button>

                    {/* Additional Info */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      <p>Free cancellation up to 24 hours before check-in</p>
                      <p>No prepayment required</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 