import { motion } from 'framer-motion'
import { usePaymentCalculation } from '@/hooks/usePaymentCalculation'
import { SpecialCharge, RoomAllocation } from '@/services/payment.service'
import RoomTariffSummary from '@/components/payment/RoomTariffSummary'
import SpecialChargesSection from '@/components/payment/SpecialChargesSection'
import DiscountSection from '@/components/payment/DiscountSection'
import PaymentMethodSection from '@/components/payment/PaymentMethodSection'
import PaymentSummary from '@/components/payment/PaymentSummary'

interface PaymentConfirmationFormRefactoredProps {
  roomAllocations: RoomAllocation[]
  specialCharges: SpecialCharge[]
  discountType: 'percentage' | 'amount' | 'none'
  discountValue: number
  checkInDate: string
  checkOutDate: string
  onSpecialChargesChange: (charges: SpecialCharge[]) => void
  onDiscountTypeChange: (type: 'percentage' | 'amount' | 'none') => void
  onDiscountValueChange: (value: number) => void
  onConfirm: () => void
  onBack: () => void
  isSubmitting?: boolean
}

export default function PaymentConfirmationFormRefactored({
  roomAllocations,
  specialCharges,
  discountType,
  discountValue,
  checkInDate,
  checkOutDate,
  onSpecialChargesChange,
  onDiscountTypeChange,
  onDiscountValueChange,
  onConfirm,
  onBack,
  isSubmitting = false
}: PaymentConfirmationFormRefactoredProps) {
  const payment = usePaymentCalculation(
    roomAllocations,
    checkInDate,
    checkOutDate,
    specialCharges,
    discountType,
    discountValue
  )

  // Sync external state changes
  if (payment.discountType !== discountType) {
    payment.setDiscountType(discountType)
  }
  if (payment.discountValue !== discountValue) {
    payment.setDiscountValue(discountValue)
  }

  const handleConfirm = () => {
    if (payment.validateForm()) {
      onConfirm()
    }
  }

  const handleSpecialChargesChange = (charges: SpecialCharge[]) => {
    onSpecialChargesChange(charges)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Room Tariff Summary */}
      <RoomTariffSummary
        roomAllocations={roomAllocations}
        totalTariff={payment.calculation.roomTariff}
        numberOfDays={payment.calculation.numberOfDays}
      />

      {/* Special Charges */}
      <SpecialChargesSection
        specialCharges={payment.specialCharges}
        totalAmount={payment.calculation.specialChargesTotal}
        onAddCustomCharge={payment.addCustomCharge}
        onAddDefaultCharge={payment.addDefaultCharge}
        onUpdateCharge={(id, field, value) => {
          payment.updateCharge(id, field, value)
          handleSpecialChargesChange(payment.specialCharges)
        }}
        onRemoveCharge={(id) => {
          payment.removeCharge(id)
          handleSpecialChargesChange(payment.specialCharges)
        }}
      />

      {/* Discount Section */}
      <DiscountSection
        discountType={payment.discountType}
        discountValue={payment.discountValue}
        onDiscountTypeChange={(type) => {
          payment.setDiscountType(type)
          onDiscountTypeChange(type)
        }}
        onDiscountValueChange={(value) => {
          payment.setDiscountValue(value)
          onDiscountValueChange(value)
        }}
      />

      {/* Payment Method */}
      <PaymentMethodSection
        selectedPaymentMethod={payment.selectedPaymentMethod}
        errors={payment.errors}
        onPaymentMethodChange={payment.setSelectedPaymentMethod}
      />

      {/* Final Summary */}
      <PaymentSummary
        calculation={payment.calculation}
        discountType={payment.discountType}
      />

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-between"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Back: Room Allocation
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`px-8 py-3 rounded-lg transition-colors font-medium ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating Reservation...
            </div>
          ) : (
            'Confirm Reservation'
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}