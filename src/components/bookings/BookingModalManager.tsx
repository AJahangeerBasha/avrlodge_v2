import { useBookings } from '@/contexts/BookingsContext'
import { FirebasePaymentModal } from './FirebasePaymentModal'
import RoomCheckInModal from './RoomCheckInModal'
import RoomCheckOutModal from './RoomCheckOutModal'
import RoomChangeModal from './RoomChangeModal'

export function BookingModalManager() {
  const { paymentModal, checkInModal, checkOutModal, roomChangeModal, actions } = useBookings()

  return (
    <>
      {/* Payment Modal */}
      {paymentModal.booking && (
        <FirebasePaymentModal
          booking={paymentModal.booking}
          isOpen={paymentModal.isOpen}
          onClose={actions.closePaymentModal}
          onPaymentComplete={() => {
            actions.closePaymentModal()
            actions.refreshBookings()
          }}
        />
      )}

      {/* Room Check-In Modal */}
      {checkInModal.booking && checkInModal.room && (
        <RoomCheckInModal
          booking={checkInModal.booking}
          room={checkInModal.room}
          isOpen={checkInModal.isOpen}
          onClose={actions.closeCheckInModal}
          onCheckInComplete={() => {
            actions.closeCheckInModal()
            actions.refreshBookings()
          }}
        />
      )}

      {/* Room Check-Out Modal */}
      {checkOutModal.booking && checkOutModal.room && (
        <RoomCheckOutModal
          booking={checkOutModal.booking}
          room={checkOutModal.room}
          isOpen={checkOutModal.isOpen}
          onClose={actions.closeCheckOutModal}
          onCheckOutComplete={() => {
            actions.closeCheckOutModal()
            actions.refreshBookings()
          }}
        />
      )}

      {/* Room Change Modal */}
      {roomChangeModal.booking && roomChangeModal.room && (
        <RoomChangeModal
          booking={roomChangeModal.booking}
          room={roomChangeModal.room}
          isOpen={roomChangeModal.isOpen}
          onClose={actions.closeRoomChangeModal}
          onSuccess={() => {
            actions.closeRoomChangeModal()
            actions.refreshBookings()
          }}
        />
      )}
    </>
  )
}