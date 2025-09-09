import { motion } from 'framer-motion'
import { Building, Users, DollarSign, Hash, Info } from 'lucide-react'

interface Room {
  id: string
  room_number: string
  room_type: string
  capacity: number
  tariff: number
}

interface RoomDetailsTableProps {
  rooms: Room[]
  className?: string
}

export default function RoomDetailsTable({ rooms, className = '' }: RoomDetailsTableProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-900 rounded-lg">
          <Building className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Room Details</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <motion.tr 
              variants={rowVariants}
              className="bg-gray-50 border-b border-gray-200"
            >
              <th className="border-r border-gray-200 p-4 text-left font-semibold text-gray-900 bg-gray-100">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  <span>Room Number</span>
                </div>
              </th>
              <th className="border-r border-gray-200 p-4 text-left font-semibold text-gray-900 bg-gray-100">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>Type</span>
                </div>
              </th>
              <th className="border-r border-gray-200 p-4 text-center font-semibold text-gray-900 bg-gray-100">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Capacity ({'{RC}'})</span>
                </div>
              </th>
              <th className="border-r border-gray-200 p-4 text-center font-semibold text-gray-900 bg-gray-100">
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Tariff</span>
                </div>
              </th>
            </motion.tr>
          </thead>
          <tbody>
            {rooms.map((room, index) => (
              <motion.tr 
                key={room.id} 
                variants={rowVariants}
                whileHover={{ backgroundColor: '#f9fafb' }}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="border-r border-gray-200 p-4 font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    <span className="font-mono text-sm">{room.room_number}</span>
                  </div>
                </td>
                <td className="border-r border-gray-200 p-4 text-gray-700">
                  <span className="text-sm">{room.room_type}</span>
                </td>
                <td className="border-r border-gray-200 p-4 text-center">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-lg font-bold text-sm"
                  >
                    {room.capacity}
                  </motion.div>
                </td>
                <td className="border-r border-gray-200 p-4 text-center">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center justify-center px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-sm"
                  >
                    ₹{room.tariff}
                  </motion.div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm text-gray-700">
            <p><strong>Total Rooms:</strong> {rooms.length} | <strong>Total Capacity:</strong> {rooms.reduce((sum, room) => sum + room.capacity, 0)} | <strong>Total Tariff:</strong> ₹{rooms.reduce((sum, room) => sum + room.tariff, 0)}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 