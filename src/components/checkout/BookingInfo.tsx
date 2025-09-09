interface BookingInfoProps {
  booking: any
}

export default function BookingInfo({ booking }: BookingInfoProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Reference:</span>
          <p className="text-gray-900">{booking.reference_number}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Guest:</span>
          <p className="text-gray-900">{booking.guest_name}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Room:</span>
          <p className="text-gray-900">{booking.room_numbers?.join(', ') || 'N/A'}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Check-out Date:</span>
          <p className="text-gray-900">{new Date(booking.check_out_date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}