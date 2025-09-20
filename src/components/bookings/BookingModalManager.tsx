import { useBookingsModals, useBookingsActions } from '@/stores/bookingsStore'
import { PaymentModal } from './PaymentModal'
import RoomCheckInModal from './RoomCheckInModal'
import RoomCheckOutModal from './RoomCheckOutModal'
import RoomChangeModal from './RoomChangeModal'

export function BookingModalManager() {
  const { modals, openPaymentModal, closePaymentModal, openCheckInModal, closeCheckInModal, openCheckOutModal, closeCheckOutModal, openRoomChangeModal, closeRoomChangeModal } = useBookingsModals()
  const { refreshBookings } = useBookingsActions()

  return (
    <>
      {/* Payment Modal */}
      {modals.payment.booking && modals.payment.isOpen && (
        <PaymentModal
          booking={modals.payment.booking}
          isOpen={modals.payment.isOpen}
          onClose={closePaymentModal}
          onPaymentComplete={() => {
            closePaymentModal()
            refreshBookings()
          }}
        />
      )}

      {/* Room Check-In Modal */}
      {modals.checkIn.booking && modals.checkIn.room && modals.checkIn.isOpen && (
        <RoomCheckInModal
          booking={modals.checkIn.booking}
          room={modals.checkIn.room}
          isOpen={modals.checkIn.isOpen}
          onClose={closeCheckInModal}
          onCheckInComplete={() => {
            closeCheckInModal()
            refreshBookings()
          }}
        />
      )}

      {/* Room Check-Out Modal */}
      {modals.checkOut.booking && modals.checkOut.room && modals.checkOut.isOpen && (
        <RoomCheckOutModal
          booking={modals.checkOut.booking}
          room={modals.checkOut.room}
          isOpen={modals.checkOut.isOpen}
          onClose={closeCheckOutModal}
          onCheckOutComplete={() => {
            closeCheckOutModal()
            refreshBookings()
          }}
        />
      )}

      {/* Room Change Modal */}
      {modals.roomChange.booking && modals.roomChange.room && modals.roomChange.isOpen && (
        <RoomChangeModal
          booking={modals.roomChange.booking}
          room={modals.roomChange.room}
          isOpen={modals.roomChange.isOpen}
          onClose={closeRoomChangeModal}
          onSuccess={() => {
            closeRoomChangeModal()
            refreshBookings()
          }}
        />
      )}
    </>
  )
}