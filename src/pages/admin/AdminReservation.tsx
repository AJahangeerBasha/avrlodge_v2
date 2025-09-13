import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CheckCircle, UserPlus, Calendar, Users, BedDouble, CreditCard, Plus, Trash2, X, MapPin, DollarSign } from 'lucide-react';
import { useReservationStore, type RoomAllocation, type SpecialCharge } from '../../stores/reservationStore';
import { validatePhoneNumber, formatPhoneNumber, getPhoneValidationError } from '../../utils/phoneValidation';
import { DateRangePicker } from '../../components/ui/date-range-picker';
import { SearchableDropdown } from '../../components/ui/searchable-dropdown';
import statesDistrictsData from '../../data/states-districts.json';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  getAllReservations,
  createReservation, 
  updateReservation, 
  getReservationById,
  deleteReservation
} from '../../lib/reservations';
import {
  getGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestsByReservationId
} from '../../lib/guests';
import {
  getAllRooms,
  updateRoomStatus
} from '../../lib/rooms';
import {
  getAllRoomTypes
} from '../../lib/roomTypes';
import {
  getAllSpecialCharges
} from '../../lib/specialCharges';
import {
  getAvailableRoomsForDateRange,
  getAvailableRoomsExcludingSelected
} from '../../lib/utils/roomAvailability';
import { 
  generateReferenceNumber 
} from '../../lib/utils/referenceNumber';

export const AdminReservation: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Zustand store
  const {
    currentStep,
    primaryGuest,
    secondaryGuests,
    selectedState,
    selectedDistrict,
    checkInDate,
    checkOutDate,
    guestCount,
    guestType,
    roomAllocations,
    specialCharges,
    discountType,
    discountValue,
    isSubmitting,
    error,
    
    // Actions
    setCurrentStep,
    updatePrimaryGuestField,
    addSecondaryGuest,
    removeSecondaryGuest,
    updateSecondaryGuest,
    setSelectedState,
    setSelectedDistrict,
    setCheckInDate,
    setCheckOutDate,
    setGuestCount,
    setGuestType,
    addRoomAllocation,
    removeRoomAllocation,
    updateRoomAllocation,
    setRoomAllocations,
    addSpecialCharge,
    removeSpecialCharge,
    setSpecialCharges,
    setDiscountType,
    setDiscountValue,
    setIsSubmitting,
    setError,
    resetForm,
    calculateTotalAmount,
    calculateNumberOfNights,
  } = useReservationStore();
  
  // Parse search params for edit mode
  const searchParams = new URLSearchParams(location.search);
  const editReservationId = searchParams.get('edit');
  const isEditMode = !!editReservationId;
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);
  const totalSteps = 4;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    referenceNumber: string;
    totalAmount: number;
    primaryGuest: any;
    secondaryGuests: any[];
    checkInDate: string;
    checkOutDate: string;
    roomAllocations: any[];
    guestCount: number;
  } | null>(null);

  // Available data
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [specialChargesMaster, setSpecialChargesMaster] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  
  // Track original data for edit mode to detect deletions
  const [originalSecondaryGuests, setOriginalSecondaryGuests] = useState<any[]>([]);
  const [originalRoomAllocations, setOriginalRoomAllocations] = useState<any[]>([]);
  const [originalSpecialCharges, setOriginalSpecialCharges] = useState<any[]>([]);
  
  // Payment method selection
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Ensure we always start at step 1
  useEffect(() => {
    setCurrentStep(1);
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Load existing reservation data in edit mode
  useEffect(() => {
    if (isEditMode && editReservationId) {
      loadReservationForEdit(editReservationId);
    }
  }, [isEditMode, editReservationId]);

  // Focus on guest name input when on step 1
  useEffect(() => {
    if (currentStep === 1) {
      const guestNameInput = document.getElementById('primaryName');
      if (guestNameInput) {
        setTimeout(() => guestNameInput.focus(), 100);
      }
    }
  }, [currentStep]);

  // Load available rooms when dates change (without room allocations dependency to avoid circular updates)
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      loadAvailableRooms();
    }
  }, [checkInDate, checkOutDate]);

  const loadInitialData = async () => {
    try {
      console.log('Loading initial data...');
      const [roomTypesData, roomsData, specialChargesData] = await Promise.all([
        getAllRoomTypes(),
        getAllRooms(),
        getAllSpecialCharges({ isActive: true }) // Only get active charges
      ]);
      
      console.log('Loaded room types:', roomTypesData.length);
      console.log('Loaded rooms:', roomsData.length);
      console.log('Loaded special charges data:', specialChargesData);
      console.log('Active special charges count:', specialChargesData.length);
      
      setRoomTypes(roomTypesData);
      setRooms(roomsData);
      setSpecialChargesMaster(specialChargesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load initial data');
    }
  };

  const loadAvailableRooms = async () => {
    if (!checkInDate || !checkOutDate) {
      setAvailableRooms([]);
      return;
    }

    try {
      // Get all available rooms for the date range (without pre-filtering by current selections)
      // Filtering by current selections will be done at the dropdown level for better UX
      const availableRoomsData = await getAvailableRoomsForDateRange(
        checkInDate,
        checkOutDate,
        isEditMode ? editReservationId : undefined
      );
      
      setAvailableRooms(availableRoomsData);
    } catch (error) {
      console.error('Error loading available rooms:', error);
      setError('Failed to load available rooms');
    }
  };

  const loadReservationForEdit = async (reservationId: string) => {
    setIsLoadingReservation(true);
    try {
      // Get reservation basic data
      const reservation = await getReservationById(reservationId);
      
      if (!reservation) {
        setError('The reservation you\'re trying to edit could not be found.');
        navigate('/admin/bookings');
        return;
      }

      // Get related guests data
      const reservationGuests = await getGuestsByReservationId(reservationId);
      
      // Set primary guest data
      const primaryGuestData = reservationGuests?.find(g => g.isPrimaryGuest);
      if (primaryGuestData || reservation) {
        setPrimaryGuest({
          id: primaryGuestData?.id || '1',
          name: reservation.guestName || '',
          phone: reservation.guestPhone || '',
          whatsapp: primaryGuestData?.whatsapp || '',
          telegram: primaryGuestData?.telegram || ''
        });
      }

      // Set secondary guests
      const secondaryGuestsData = reservationGuests?.filter(g => !g.isPrimaryGuest) || [];
      const mappedSecondaryGuests = secondaryGuestsData.map(g => ({
        id: g.id,
        name: g.name,
        phone: g.phone || '',
        whatsapp: g.whatsapp || '',
        telegram: g.telegram || ''
      }));
      setSecondaryGuests(mappedSecondaryGuests);
      setOriginalSecondaryGuests([...mappedSecondaryGuests]);

      // Set dates and location data
      setCheckInDate(reservation.checkInDate || '');
      setCheckOutDate(reservation.checkOutDate || '');
      setGuestCount(reservation.guestCount || 1);

      // Set location data
      const primaryGuestLocation = reservationGuests?.find(g => g.isPrimaryGuest);
      if (primaryGuestLocation) {
        setSelectedState(primaryGuestLocation.state || '');
        setSelectedDistrict(primaryGuestLocation.district || '');
      }

      // Set guest type
      setGuestType(reservation.guestType || '');

      // Load room allocations, special charges, etc.
      console.log('Reservation loaded successfully for editing');
      
    } catch (error) {
      console.error('Error loading reservation for edit:', error);
      setError('Failed to load reservation data');
      navigate('/admin/bookings');
    } finally {
      setIsLoadingReservation(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 3) {
      // Validate guest count tallies for room allocations
      const totalRoomGuests = roomAllocations.reduce((sum, allocation) => sum + allocation.guestCount, 0);
      if (totalRoomGuests !== guestCount) {
        setError(`Guest count mismatch: Room allocations total ${totalRoomGuests} guests, but overall guest count is ${guestCount}. Please adjust the guest counts in room allocations to match.`);
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = async () => {
    if (!currentUser) {
      setError('Please log in to create/update a reservation.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Generate reference number for new reservations
      const referenceNumber = isEditMode ? '' : await generateReferenceNumber();
      
      // Convert guest type to expected format
      const normalizedGuestType = (() => {
        switch (guestType.toLowerCase()) {
          case 'individual':
            return 'individual';
          case 'couple':
            return 'couple';
          case 'family':
            return 'family';
          case 'friends':
            return 'group';
          default:
            return 'individual';
        }
      })();

      // Log discount values for debugging
      console.log('Discount type:', discountType);
      console.log('Discount value:', discountValue);
      console.log('Calculated discounts - percentage:', discountType === 'percentage' ? discountValue : 0, 'fixed:', discountType === 'amount' ? discountValue : 0);

      // Calculate room tariff total for the old interface compatibility
      const roomTariffTotal = roomAllocations.reduce((total, room) => {
        const numberOfNights = calculateNumberOfNights();
        return total + (room.tariff * numberOfNights);
      }, 0);

      // For the new system, we need to create a reservation using the new format
      const reservationData = {
        // Required fields for compatibility with old interface
        roomId: roomAllocations.length > 0 ? roomAllocations[0].roomId : 'temp-room-id',
        totalQuote: calculateTotalAmount(),
        roomTariff: roomTariffTotal,
        
        // New system fields
        guestName: primaryGuest.name,
        guestEmail: '', // Not captured in this form
        guestPhone: primaryGuest.phone,
        guestType: normalizedGuestType,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        guestCount: guestCount,
        totalPrice: calculateTotalAmount(),
        percentageDiscount: discountType === 'percentage' ? discountValue : 0,
        fixedDiscount: discountType === 'amount' ? discountValue : 0,
        status: 'reservation' as const,
        paymentStatus: 'pending' as const
      };

      console.log('Final reservation data:', reservationData);

      let savedReservation;
      
      if (isEditMode && editReservationId) {
        // Update existing reservation
        savedReservation = await updateReservation(editReservationId, reservationData);
        
        setError('');
        console.log('Reservation updated successfully');
        navigate('/admin/bookings');
        return;
      } else {
        // Create new reservation with the simplified data
        savedReservation = await createReservation(reservationData, currentUser.uid);
        const newReservationId = savedReservation.id;
        
        // Create primary guest with state/district
        await createGuest({
          reservationId: newReservationId,
          name: primaryGuest.name,
          phone: primaryGuest.phone,
          whatsapp: primaryGuest.whatsapp || undefined,
          telegram: primaryGuest.telegram || undefined,
          state: selectedState,
          district: selectedDistrict,
          isPrimaryGuest: true
        }, currentUser.uid);

        // Create secondary guests with state/district
        if (secondaryGuests.length > 0) {
          for (const guest of secondaryGuests) {
            await createGuest({
              reservationId: newReservationId,
              name: guest.name,
              phone: guest.phone,
              whatsapp: guest.whatsapp || undefined,
              telegram: guest.telegram || undefined,
              state: selectedState,
              district: selectedDistrict,
              isPrimaryGuest: false
            }, currentUser.uid);
          }
        }

        // Create reservation rooms for each room allocation
        if (roomAllocations.length > 0) {
          console.log('Creating reservation rooms:', roomAllocations);
          const { createReservationRoom } = await import('../../lib/reservationRooms');
          for (const roomAllocation of roomAllocations) {
            console.log('Creating room allocation:', roomAllocation);
            const roomData = {
              reservationId: newReservationId,
              roomId: roomAllocation.roomId,
              roomNumber: roomAllocation.roomNumber,
              roomType: roomAllocation.roomType,
              guestCount: roomAllocation.guestCount,
              tariffPerNight: roomAllocation.tariff,
              roomStatus: 'pending' as const
            };
            console.log('Creating reservation room with data:', roomData);
            const roomId = await createReservationRoom(roomData, currentUser.uid);
            console.log('Successfully created reservation room:', roomId);
          }
        }

        // Create special charges linked to this reservation
        if (specialCharges.length > 0) {
          console.log('Creating special charges:', specialCharges);
          const { createReservationSpecialCharge } = await import('../../lib/reservationSpecialCharges');
          for (const charge of specialCharges) {
            console.log('Processing charge:', charge);
            if (!charge.masterId) {
              console.error('Missing masterId for charge:', charge);
              continue;
            }
            try {
              const chargeData = {
                reservationId: newReservationId,
                specialChargeId: charge.masterId,
                quantity: charge.quantity || 1,
                customRate: charge.amount,
                customDescription: charge.description,
                totalAmount: charge.amount * (charge.quantity || 1)
              };
              console.log('Creating charge with data:', chargeData);
              const chargeId = await createReservationSpecialCharge(chargeData, currentUser.uid);
              console.log('Successfully created charge:', chargeId);
            } catch (chargeError) {
              console.error('Error creating individual charge:', chargeError);
              // Continue with other charges even if one fails
            }
          }
        }
        
        // Show success modal
        setSuccessData({
          referenceNumber: savedReservation.referenceNumber || referenceNumber,
          totalAmount: calculateTotalAmount(),
          primaryGuest: { ...primaryGuest },
          secondaryGuests: [...secondaryGuests],
          checkInDate,
          checkOutDate,
          roomAllocations: [...roomAllocations],
          guestCount
        });
        setShowSuccessModal(true);
        
        // Reset form
        resetForm();
      }
      
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} reservation:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} reservation`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderGuestDetailsForm();
      case 2:
        return renderLocationDatesForm();
      case 3:
        return renderRoomAllocationForm();
      case 4:
        return renderPaymentConfirmationForm();
      default:
        return null;
    }
  };

  const renderGuestDetailsForm = () => {
    // Only show validation errors after user has interacted with the field
    const primaryPhoneError = primaryGuest.phone ? getPhoneValidationError(primaryGuest.phone) : null;
    const primaryWhatsappError = primaryGuest.whatsapp && !primaryGuest.usePhoneForWhatsapp 
      ? getPhoneValidationError(primaryGuest.whatsapp) 
      : null;
    const primaryTelegramError = primaryGuest.telegram 
      ? getPhoneValidationError(primaryGuest.telegram) 
      : null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-black">Guest Details</h3>
          <p className="text-gray-600">Enter primary guest and additional guests information</p>
        </div>

        {/* Primary Guest */}
        <motion.div
          whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Primary Guest</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryName" className="text-sm font-medium text-gray-700 mb-2 block">Full Name *</Label>
                <input
                  id="primaryName"
                  type="text"
                  value={primaryGuest.name}
                  onChange={(e) => updatePrimaryGuestField('name', e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="primaryPhone" className="text-sm font-medium text-gray-700 mb-2 block">Phone Number *</Label>
                <input
                  id="primaryPhone"
                  type="tel"
                  value={primaryGuest.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    updatePrimaryGuestField('phone', formatted);
                  }}
                  placeholder="Enter 10-digit phone number starting with 6-9"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none transition-colors ${
                    primaryPhoneError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-400'
                  }`}
                  required
                />
                {primaryPhoneError && (
                  <p className="text-sm text-red-600 mt-1">{primaryPhoneError}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="primaryWhatsapp" className="text-sm font-medium text-gray-700 mb-2 block">WhatsApp (Optional)</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sameAsPhone"
                      checked={primaryGuest.usePhoneForWhatsapp}
                      onChange={(e) => {
                        updatePrimaryGuestField('usePhoneForWhatsapp', e.target.checked);
                        if (e.target.checked) {
                          updatePrimaryGuestField('whatsapp', primaryGuest.phone);
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor="sameAsPhone" className="text-sm text-gray-600">
                      Same as phone number
                    </Label>
                  </div>
                  
                  {!primaryGuest.usePhoneForWhatsapp && (
                    <div>
                      <input
                        id="primaryWhatsapp"
                        type="tel"
                        value={primaryGuest.whatsapp}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          updatePrimaryGuestField('whatsapp', formatted);
                        }}
                        placeholder="Enter 10-digit WhatsApp number starting with 6-9"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none transition-colors ${
                          primaryWhatsappError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-400'
                        }`}
                      />
                      {primaryWhatsappError && (
                        <p className="text-sm text-red-600 mt-1">{primaryWhatsappError}</p>
                      )}
                    </div>
                  )}
                  
                  {primaryGuest.usePhoneForWhatsapp && primaryGuest.phone && (
                    <p className="text-sm text-gray-600">WhatsApp: {primaryGuest.phone}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="primaryTelegram" className="text-sm font-medium text-gray-700 mb-2 block">Telegram (Optional)</Label>
                <input
                  id="primaryTelegram"
                  type="tel"
                  value={primaryGuest.telegram}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    updatePrimaryGuestField('telegram', formatted);
                  }}
                  placeholder="Enter 10-digit Telegram number starting with 6-9"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none transition-colors ${
                    primaryTelegramError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-400'
                  }`}
                />
                {primaryTelegramError && (
                  <p className="text-sm text-red-600 mt-1">{primaryTelegramError}</p>
                )}
              </div>
            </div>
          </CardContent>
          </Card>
        </motion.div>

        {/* Additional Guests */}
        <motion.div
          whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Additional Guests</span>
                <Badge variant="outline">{secondaryGuests.length}</Badge>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addSecondaryGuest}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Guest</span>
              </Button>
            </CardTitle>
          </CardHeader>
          
          {secondaryGuests.length > 0 && (
            <CardContent className="space-y-4">
              {secondaryGuests.map((guest, index) => {
                const phoneError = guest.phone ? getPhoneValidationError(guest.phone) : null;
                const whatsappError = guest.whatsapp && !guest.usePhoneForWhatsapp 
                  ? getPhoneValidationError(guest.whatsapp) 
                  : null;
                const telegramError = guest.telegram 
                  ? getPhoneValidationError(guest.telegram) 
                  : null;

                return (
                  <div key={guest.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Guest {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSecondaryGuest(guest.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Full Name *</Label>
                        <input
                          type="text"
                          value={guest.name}
                          onChange={(e) => updateSecondaryGuest(guest.id, { name: e.target.value })}
                          placeholder="Enter full name"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number *</Label>
                        <input
                          type="tel"
                          value={guest.phone}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            updateSecondaryGuest(guest.id, { phone: formatted });
                          }}
                          placeholder="Enter 10-digit phone number starting with 6-9"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none transition-colors ${
                            phoneError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-400'
                          }`}
                          required
                        />
                        {phoneError && (
                          <p className="text-sm text-red-600 mt-1">{phoneError}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">WhatsApp (Optional)</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`sameAsPhone-${guest.id}`}
                              checked={guest.usePhoneForWhatsapp}
                              onChange={(e) => {
                                const updates = { 
                                  usePhoneForWhatsapp: e.target.checked,
                                  ...(e.target.checked ? { whatsapp: guest.phone } : {})
                                };
                                updateSecondaryGuest(guest.id, updates);
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`sameAsPhone-${guest.id}`} className="text-sm text-gray-600">
                              Same as phone
                            </Label>
                          </div>
                          
                          {!guest.usePhoneForWhatsapp && (
                            <div>
                              <input
                                type="tel"
                                value={guest.whatsapp}
                                onChange={(e) => {
                                  const formatted = formatPhoneNumber(e.target.value);
                                  updateSecondaryGuest(guest.id, { whatsapp: formatted });
                                }}
                                placeholder="Enter 10-digit WhatsApp number starting with 6-9"
                                maxLength={10}
                                pattern="[0-9]{10}"
                                className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none transition-colors ${
                                  whatsappError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-400'
                                }`}
                              />
                              {whatsappError && (
                                <p className="text-sm text-red-600 mt-1">{whatsappError}</p>
                              )}
                            </div>
                          )}
                          
                          {guest.usePhoneForWhatsapp && guest.phone && (
                            <p className="text-sm text-gray-600">WhatsApp: {guest.phone}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Telegram (Optional)</Label>
                        <input
                          type="tel"
                          value={guest.telegram}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            updateSecondaryGuest(guest.id, { telegram: formatted });
                          }}
                          placeholder="Enter 10-digit Telegram number starting with 6-9"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none transition-colors ${
                            telegramError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-400'
                          }`}
                        />
                        {telegramError && (
                          <p className="text-sm text-red-600 mt-1">{telegramError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          )}
          
          {secondaryGuests.length === 0 && (
            <CardContent className="text-center py-8 text-gray-500">
              <p>No additional guests added yet.</p>
              <p className="text-sm mt-1">Click "Add Guest" to add more guests to the reservation.</p>
            </CardContent>
          )}
          </Card>
        </motion.div>

        {/* Enhanced Action Buttons */}
        <motion.div 
          className="flex justify-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleNext} 
              disabled={
                !primaryGuest.name || 
                !validatePhoneNumber(primaryGuest.phone) ||
                (primaryGuest.whatsapp && !primaryGuest.usePhoneForWhatsapp && !validatePhoneNumber(primaryGuest.whatsapp)) ||
                (primaryGuest.telegram && !validatePhoneNumber(primaryGuest.telegram)) ||
                secondaryGuests.some(guest => 
                  !guest.name || 
                  !validatePhoneNumber(guest.phone) ||
                  (guest.whatsapp && !guest.usePhoneForWhatsapp && !validatePhoneNumber(guest.whatsapp)) ||
                  (guest.telegram && !validatePhoneNumber(guest.telegram))
                )
              }
              className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg"
            >
              Next: Location & Dates →
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  };

  const renderLocationDatesForm = () => {
    // Get districts for selected state
    const selectedStateData = statesDistrictsData.find(s => s.state === selectedState);
    const districts = selectedStateData ? selectedStateData.district : [];
    const numberOfNights = calculateNumberOfNights();

    return (
      <div className="space-y-6">
        {/* Stay Details Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span>Stay Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Stay Dates *</Label>
              <div className="relative">
                <DateRangePicker
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  onStartDateChange={setCheckInDate}
                  onEndDateChange={setCheckOutDate}
                  minDate={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
                {checkInDate && checkOutDate && (
                  <div className="absolute right-3 top-3 text-xs text-gray-500 pointer-events-none">
                    <X className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
            
            {checkInDate && checkOutDate && (
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm text-gray-600">
                <div>
                  <span className="block">Check-in time:</span>
                  <span className="font-medium text-gray-900">12:00 PM</span>
                </div>
                <div>
                  <span className="block">Check-out time:</span>
                  <span className="font-medium text-gray-900">11:00 AM</span>
                </div>
                <div>
                  <span className="block">Number of nights:</span>
                  <span className="font-medium text-gray-900">{numberOfNights}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Information Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span>Guest Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">State *</Label>
                <SearchableDropdown
                  options={statesDistrictsData.map(s => s.state)}
                  value={selectedState}
                  onChange={setSelectedState}
                  placeholder="Select state"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">District *</Label>
                <SearchableDropdown
                  options={districts}
                  value={selectedDistrict}
                  onChange={setSelectedDistrict}
                  placeholder={selectedState ? "Select district" : "Select state first"}
                  disabled={!selectedState || districts.length === 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest Information Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span>Guest Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestCount" className="text-sm font-medium text-gray-700 mb-2 block">
                  Number of Pax (Adults + Kids) *
                </Label>
                <input
                  id="guestCount"
                  type="number"
                  min="1"
                  max="20"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="guestType" className="text-sm font-medium text-gray-700 mb-2 block">
                  Guest Type *
                </Label>
                <select 
                  id="guestType"
                  value={guestType}
                  onChange={(e) => setGuestType(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                  required
                >
                  <option value="">Select guest type</option>
                  <option value="Individual">Individual</option>
                  <option value="Couple">Couple</option>
                  <option value="Family">Family</option>
                  <option value="Friends">Friends</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            className="px-6 py-3 border-gray-300 hover:bg-gray-50"
          >
            ← Back: Guest Details
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!checkInDate || !checkOutDate || !selectedState || !selectedDistrict || !guestType}
            className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg"
          >
            Next: Room Allocation →
          </Button>
        </div>
      </div>
    );
  };

  const renderRoomAllocationForm = () => {
    const totalCost = calculateTotalAmount();

    const addNewRoom = () => {
      // Check if dates are selected
      if (!checkInDate || !checkOutDate) {
        setError('Please select check-in and check-out dates first');
        return;
      }

      // Get already selected room IDs to exclude them
      const selectedRoomIds = roomAllocations
        .map(allocation => allocation.roomId)
        .filter(roomId => roomId); // Filter out undefined/null room IDs
      
      // Get first available room that hasn't been selected yet
      const availableRoom = availableRooms.find(room => 
        room.status === 'available' && 
        room.isActive &&
        !selectedRoomIds.includes(room.id)
      );
      
      if (!availableRoom) {
        setError('No more available rooms found for the selected dates');
        return;
      }

      // Get room type info to get pricing
      const roomType = roomTypes.find(rt => rt.id === availableRoom.roomTypeId);
      if (!roomType) {
        setError('Room type information not found');
        return;
      }

      const newAllocation: RoomAllocation = {
        id: crypto.randomUUID(),
        roomId: availableRoom.id,
        roomNumber: availableRoom.roomNumber,
        roomType: roomType.name,
        capacity: roomType.maxGuests,
        tariff: roomType.pricePerNight,
        guestCount: 1
      };
      addRoomAllocation(newAllocation);
    };

    return (
      <div className="space-y-6">
        {/* Manual Room Allocation Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Manual Room Allocation</span>
              <Button 
                onClick={addNewRoom}
                className="bg-black hover:bg-gray-800 text-white"
                disabled={!checkInDate || !checkOutDate || (() => {
                  // Check if there are any available rooms not already selected
                  const selectedRoomIds = roomAllocations
                    .map(allocation => allocation.roomId)
                    .filter(roomId => roomId);
                  const unselectedRooms = availableRooms.filter(room => 
                    room.status === 'available' && 
                    room.isActive &&
                    !selectedRoomIds.includes(room.id)
                  );
                  return unselectedRooms.length === 0;
                })()}
              >
                Add Room
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {roomAllocations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No rooms allocated yet.</p>
                {!checkInDate || !checkOutDate ? (
                  <p className="text-sm mt-1 text-amber-600">Please select check-in and check-out dates first.</p>
                ) : availableRooms.length === 0 ? (
                  <p className="text-sm mt-1 text-red-600">No rooms available for the selected dates.</p>
                ) : (
                  <p className="text-sm mt-1">Click "Add Room" to allocate rooms for guests.</p>
                )}
              </div>
            ) : (
              roomAllocations.map((allocation, index) => {
                // Get already selected room IDs from other allocations (excluding current one)
                const otherSelectedRoomIds = roomAllocations
                  .filter(otherAllocation => otherAllocation.id !== allocation.id)
                  .map(otherAllocation => otherAllocation.roomId)
                  .filter(roomId => roomId); // Filter out undefined/null room IDs
                
                // Show all available rooms, excluding those already selected in other allocations
                // Include the currently selected room for this allocation to allow it to stay selected
                const availableRoomsForThisAllocation = availableRooms.filter(room => {
                  // Always include the currently selected room for this allocation
                  if (room.id === allocation.roomId) {
                    return true;
                  }
                  // Exclude rooms that are selected in other allocations
                  return !otherSelectedRoomIds.includes(room.id);
                });

                return (
                  <div key={allocation.id} className="p-6 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Room {index + 1}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeRoomAllocation(allocation.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Room Number Dropdown */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Room Number</Label>
                        <select
                          value={allocation.roomNumber}
                          onChange={(e) => {
                            const selectedRoom = availableRoomsForThisAllocation.find(r => r.roomNumber === e.target.value);
                            if (selectedRoom) {
                              // Find the room type to get the correct tariff
                              const selectedRoomType = roomTypes.find(rt => rt.id === selectedRoom.roomTypeId);
                              const roomTariff = selectedRoomType ? selectedRoomType.pricePerNight : allocation.tariff;
                              
                              updateRoomAllocation(allocation.id, {
                                roomId: selectedRoom.id,
                                roomNumber: selectedRoom.roomNumber,
                                tariff: roomTariff,
                                roomType: selectedRoomType ? selectedRoomType.name : allocation.roomType,
                                capacity: selectedRoomType ? selectedRoomType.maxGuests : allocation.capacity
                              });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                        >
                          {availableRoomsForThisAllocation.map((room) => {
                            // Get the room type for this specific room to show correct pricing
                            const roomTypeForThisRoom = roomTypes.find(rt => rt.id === room.roomTypeId);
                            const roomTariff = roomTypeForThisRoom ? roomTypeForThisRoom.pricePerNight : 0;
                            
                            return (
                              <option key={room.id} value={room.roomNumber}>
                                {room.roomNumber} - ₹{roomTariff}/night
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Guest Count */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Pax Count</Label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={allocation.guestCount}
                          onChange={(e) => updateRoomAllocation(allocation.id, {
                            guestCount: parseInt(e.target.value) || 1
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Capacity Warning */}
                    {allocation.guestCount > allocation.capacity && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700">
                          Can exceed room capacity. Extra guests will incur additional charges.
                        </p>
                      </div>
                    )}

                    {/* Room Info */}
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="block">Capacity:</span>
                        <span className="font-medium text-gray-900">{allocation.capacity} guests</span>
                      </div>
                      <div className="text-right">
                        <span className="block">Tariff:</span>
                        <span className="font-medium text-gray-900">₹{allocation.tariff}/night</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Guest Count Validation */}
        {(() => {
          const totalRoomGuests = roomAllocations.reduce((sum, allocation) => sum + allocation.guestCount, 0);
          const isValid = totalRoomGuests === guestCount;
          
          if (roomAllocations.length > 0 && !isValid) {
            return (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  <strong>Guest count mismatch:</strong> Room allocations total <strong>{totalRoomGuests} guests</strong>, but overall guest count is <strong>{guestCount}</strong>. Please adjust the guest counts in room allocations to match.
                </AlertDescription>
              </Alert>
            );
          }
          return null;
        })()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            className="px-6 py-3 border-gray-300 hover:bg-gray-50"
          >
            Back: Location & Dates
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={(() => {
              const totalRoomGuests = roomAllocations.reduce((sum, allocation) => sum + allocation.guestCount, 0);
              return roomAllocations.length === 0 || totalRoomGuests !== guestCount;
            })()}
            className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg"
          >
            Next: Payment & Confirm
          </Button>
        </div>
      </div>
    );
  };

  // Auto-manage Extra Person charges when guest count vs room capacity changes
  useEffect(() => {
    if (currentStep === 4 && specialChargesMaster.length > 0 && roomAllocations.length > 0) {
      const totalRoomCapacity = roomAllocations.reduce((total, room) => total + room.capacity, 0);
      const extraPersonsNeeded = Math.max(0, guestCount - totalRoomCapacity);
      
      // Find Extra Person charge in master charges
      const extraPersonCharge = specialChargesMaster.find(charge => 
        charge.chargeName.toLowerCase().includes('extra person') || 
        charge.chargeName.toLowerCase().includes('extra') && charge.chargeName.toLowerCase().includes('person')
      );
      
      if (!extraPersonCharge) return;
      
      const existingAutoCharge = specialCharges.find(sc => 
        sc.masterId === extraPersonCharge.id && 
        sc.description && sc.description.includes('extra person(s) required')
      );
      
      if (extraPersonsNeeded > 0) {
        if (!existingAutoCharge) {
          // Auto-add Extra Person charge
          const newCharge: SpecialCharge = {
            id: crypto.randomUUID(),
            masterId: extraPersonCharge.id,
            name: extraPersonCharge.chargeName,
            amount: extraPersonCharge.defaultRate,
            quantity: extraPersonsNeeded,
            description: `${extraPersonsNeeded} extra person(s) required`
          };
          addSpecialCharge(newCharge);
        } else if (existingAutoCharge.quantity !== extraPersonsNeeded) {
          // Update quantity if different
          const updatedCharges = specialCharges.map(c =>
            c.id === existingAutoCharge.id
              ? { ...c, quantity: extraPersonsNeeded, description: `${extraPersonsNeeded} extra person(s) required` }
              : c
          );
          setSpecialCharges(updatedCharges);
        }
      } else {
        // Remove auto-selected Extra Person charge when capacity exceeds guest count
        if (existingAutoCharge) {
          const updatedCharges = specialCharges.filter(c => c.id !== existingAutoCharge.id);
          setSpecialCharges(updatedCharges);
        }
      }
    }
  }, [currentStep, guestCount, roomAllocations, specialChargesMaster, specialCharges, addSpecialCharge, setSpecialCharges]);

  // Reset district when state changes
  useEffect(() => {
    if (selectedState) {
      const stateData = statesDistrictsData.find(s => s.state === selectedState);
      if (stateData && !stateData.district.includes(selectedDistrict)) {
        setSelectedDistrict('');
      }
    } else {
      setSelectedDistrict('');
    }
  }, [selectedState, selectedDistrict, setSelectedDistrict]);

  const renderPaymentConfirmationForm = () => {
    const numberOfNights = calculateNumberOfNights();
    
    // Calculate extra persons needed (for UI display logic)
    const totalRoomCapacity = roomAllocations.reduce((total, room) => total + room.capacity, 0);
    const extraPersonsNeeded = Math.max(0, guestCount - totalRoomCapacity);
    
    // Calculate room tariff total
    const roomTariffTotal = roomAllocations.reduce((total, room) => {
      return total + (room.tariff * numberOfNights);
    }, 0);

    // Calculate special charges total
    const specialChargesTotal = specialCharges.reduce((total, charge) => {
      return total + (charge.amount * (charge.quantity || 1));
    }, 0);

    const subtotal = roomTariffTotal + specialChargesTotal;
    
    let discount = 0;
    if (discountType === 'percentage') {
      discount = (subtotal * discountValue) / 100;
    } else if (discountType === 'amount') {
      discount = discountValue;
    }
    
    const finalTotal = subtotal - discount;

    const addCustomCharge = () => {
      const newCharge: SpecialCharge = {
        id: crypto.randomUUID(),
        masterId: crypto.randomUUID(),
        name: 'Custom Charge',
        amount: 0,
        quantity: 1,
        description: 'Custom charge'
      };
      addSpecialCharge(newCharge);
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-black">Payment & Confirmation</h3>
          <p className="text-gray-600">Review details and confirm the reservation</p>
        </div>

        {/* Room Tariff Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
              </div>
              <span>Room Tariff Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomAllocations.map((room, index) => (
              <div key={room.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{room.roomNumber} - {room.roomType}</div>
                  <div className="text-sm text-gray-600">{room.guestCount} guests</div>
                  <div className="text-sm text-gray-600">Capacity: {room.capacity}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">₹{room.tariff}/night</div>
                </div>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Room Tariff</span>
                <div className="text-right">
                  <div className="font-bold text-xl text-black">₹{roomTariffTotal.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{numberOfNights} night{numberOfNights !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Charges Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Special Charges</span>
              </div>
              <Button 
                onClick={addCustomCharge}
                className="bg-black hover:bg-gray-800 text-white"
              >
                Add Custom Charge
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Debug info */}
            {console.log('Rendering special charges, specialChargesMaster:', specialChargesMaster)}
            {specialChargesMaster.length === 0 && (
              <div className="text-center py-4 text-red-600 bg-red-50 rounded-lg">
                <p>No special charges available. Please check if data is loaded properly.</p>
                <p className="text-sm mt-1">specialChargesMaster length: {specialChargesMaster.length}</p>
              </div>
            )}
            
            {/* Master Special Charges - Single Line Layout */}
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2" style={{scrollbarWidth: 'thin'}}>
              {specialChargesMaster.map((masterCharge) => {
                const isSelected = specialCharges.some(sc => sc.masterId === masterCharge.id);
                const isExtraPersonCharge = masterCharge.chargeName.toLowerCase().includes('extra person') || 
                  (masterCharge.chargeName.toLowerCase().includes('extra') && masterCharge.chargeName.toLowerCase().includes('person'));
                const isAutoSelected = isExtraPersonCharge && extraPersonsNeeded > 0;
                
                return (
                  <div 
                    key={masterCharge.id} 
                    className={`flex flex-col items-center p-4 rounded-lg transition-colors cursor-pointer min-w-[140px] ${
                      isSelected 
                        ? isAutoSelected 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'bg-gray-100 border border-gray-300' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    } ${isAutoSelected ? 'opacity-90' : ''}`}
                    onClick={() => {
                      // Check if this is an Extra Person charge
                      const isExtraPersonCharge = masterCharge.chargeName.toLowerCase().includes('extra person') || 
                        (masterCharge.chargeName.toLowerCase().includes('extra') && masterCharge.chargeName.toLowerCase().includes('person'));
                      
                      if (isExtraPersonCharge) {
                        // For Extra Person charges, always allow adding new manual records
                        const newCharge: SpecialCharge = {
                          id: crypto.randomUUID(),
                          masterId: masterCharge.id,
                          name: masterCharge.chargeName,
                          amount: masterCharge.defaultRate,
                          quantity: 1,
                          description: 'Manual selection'
                        };
                        addSpecialCharge(newCharge);
                        return;
                      }
                      
                      if (isSelected) {
                        // Remove charge
                        const chargeToRemove = specialCharges.find(sc => sc.masterId === masterCharge.id);
                        if (chargeToRemove) {
                          removeSpecialCharge(chargeToRemove.id);
                        }
                      } else {
                        // Add charge or increment quantity if already exists
                        const existingCharge = specialCharges.find(sc => sc.masterId === masterCharge.id);
                        if (existingCharge) {
                          // Increment quantity
                          const updatedCharges = specialCharges.map(c =>
                            c.masterId === masterCharge.id
                              ? { ...c, quantity: (c.quantity || 1) + 1 }
                              : c
                          );
                          setSpecialCharges(updatedCharges);
                        } else {
                          // Add new charge
                          const newCharge: SpecialCharge = {
                            id: crypto.randomUUID(),
                            masterId: masterCharge.id,
                            name: masterCharge.chargeName,
                            amount: masterCharge.defaultRate,
                            quantity: 1,
                            description: masterCharge.description
                          };
                          addSpecialCharge(newCharge);
                        }
                      }
                    }}
                  >
                    <div className="font-medium text-gray-900 text-center mb-1">{masterCharge.chargeName}</div>
                    <div className="text-sm font-semibold text-blue-600">₹{masterCharge.defaultRate}</div>
                  </div>
                );
              })}
            </div>

            {/* Selected Charges - Vertical Layout (one below another) */}
            {specialCharges.length > 0 && (
              <div className="space-y-3">
                {specialCharges.map((charge) => (
                  <div key={charge.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{charge.name}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="number"
                          value={charge.amount}
                          onChange={(e) => {
                            // Update charge amount
                            const updatedCharges = specialCharges.map(c => 
                              c.id === charge.id 
                                ? { ...c, amount: parseFloat(e.target.value) || 0 }
                                : c
                            );
                            setSpecialCharges(updatedCharges);
                          }}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center text-sm bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                          min="0"
                        />
                        <input 
                          type="number"
                          value={charge.quantity || 1}
                          onChange={(e) => {
                            // Update charge quantity
                            const updatedCharges = specialCharges.map(c => 
                              c.id === charge.id 
                                ? { ...c, quantity: parseInt(e.target.value) || 1 }
                                : c
                            );
                            setSpecialCharges(updatedCharges);
                          }}
                          className="w-16 px-3 py-2 border border-gray-300 rounded-md text-center text-sm bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                          min="1"
                        />
                      </div>
                      <div className="font-semibold text-gray-900 min-w-[80px] text-right">
                        ₹{((charge.amount || 0) * (charge.quantity || 1)).toLocaleString()}
                      </div>
                      {(() => {
                        const masterCharge = specialChargesMaster.find(mc => mc.id === charge.masterId);
                        const isExtraPersonCharge = masterCharge && (masterCharge.chargeName.toLowerCase().includes('extra person') || 
                          (masterCharge.chargeName.toLowerCase().includes('extra') && masterCharge.chargeName.toLowerCase().includes('person')));
                        // Auto-selected charges have specific description indicating they are required
                        const isAutoSelected = isExtraPersonCharge && charge.description && charge.description.includes('extra person(s) required');
                        
                        return (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (!isAutoSelected) {
                                removeSpecialCharge(charge.id);
                              }
                            }}
                            disabled={isAutoSelected}
                            className={`${
                              isAutoSelected 
                                ? 'text-gray-400 cursor-not-allowed opacity-50' 
                                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                            }`}
                          >
                            {isAutoSelected ? 'Required' : 'Remove'}
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Special Charges</span>
                <span className="font-bold text-xl text-black">₹{specialChargesTotal.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discount Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">%</span>
              </div>
              <span>Discount</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Discount Type</Label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="amount">Fixed Amount (₹)</option>
                </select>
              </div>
              
              {discountType !== 'none' && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Discount Amount
                  </Label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={discountType === 'percentage' ? 100 : subtotal}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md bg-white text-gray-900 focus:border-gray-400 focus:outline-none transition-colors"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm">
                      {discountType === 'percentage' ? '%' : '₹'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span>Payment Method</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                  selectedPaymentMethod === 'jubair' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPaymentMethod('jubair')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 rounded-full flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedPaymentMethod === 'jubair' ? 'bg-blue-500' : ''
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Jubair QR Code</div>
                    <div className="text-sm text-gray-600">Scan to pay via Jubair</div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                  selectedPaymentMethod === 'basha' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPaymentMethod('basha')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 rounded-full flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedPaymentMethod === 'basha' ? 'bg-blue-500' : ''
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Basha QR Code</div>
                    <div className="text-sm text-gray-600">Scan to pay via Basha</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Final Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Room Tariff</span>
                <span className="font-medium text-gray-900">₹{roomTariffTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Special Charges</span>
                <span className="font-medium text-gray-900">₹{specialChargesTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-t pt-4">
                <span className="font-medium text-gray-900">Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-2 text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t pt-4">
                <span className="text-xl font-bold text-black">Total Amount</span>
                <span className="text-xl font-bold text-black">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center pt-6">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            className="px-6 py-3 border-gray-300 hover:bg-gray-50"
          >
            Back: Room Allocation
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting} 
            className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg"
          >
            {isSubmitting ? 'Creating...' : isEditMode ? 'Update Reservation' : 'Confirm Reservation'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <motion.h1 
                className="text-3xl sm:text-4xl font-serif font-bold text-black tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {isEditMode ? 'Edit Reservation' : 'Create Reservation'}
              </motion.h1>
              <motion.p 
                className="text-gray-600 mt-2 text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {isEditMode ? 'Update the reservation details below' : 'Complete the form to create a new guest reservation'}
              </motion.p>
            </div>
            
            {/* Quick Stats */}
            <motion.div 
              className="hidden lg:flex items-center space-x-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{currentStep}</div>
                <div className="text-sm text-gray-500">Current Step</div>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹{calculateTotalAmount().toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Amount</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Enhanced Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-black to-gray-800"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
                
                {[1, 2, 3, 4].map((step, index) => {
                  const stepData = [
                    { title: 'Guest Details', icon: '👤', description: 'Personal information' },
                    { title: 'Location & Dates', icon: '📍', description: 'Travel details' },
                    { title: 'Room Allocation', icon: '🏠', description: 'Room selection' },
                    { title: 'Payment & Confirm', icon: '💳', description: 'Final review' }
                  ][index];
                  
                  return (
                    <motion.div 
                      key={step} 
                      className="flex flex-col items-center relative z-10"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-lg border-4 transition-all duration-300 ${
                          step <= currentStep 
                            ? 'bg-black text-white border-black shadow-lg' 
                            : step === currentStep + 1
                            ? 'bg-white border-gray-300 text-gray-600 shadow-md'
                            : 'bg-gray-100 border-gray-200 text-gray-400'
                        }`}
                        whileHover={step <= currentStep ? { y: -2 } : {}}
                      >
                        {step <= currentStep ? '✓' : step}
                      </motion.div>
                      
                      <div className="text-center mt-3 max-w-[120px]">
                        <span className={`text-sm font-medium block ${
                          step <= currentStep ? 'text-black' : 'text-gray-500'
                        }`}>
                          {stepData.title}
                        </span>
                        <span className="text-xs text-gray-400 mt-1 block">
                          {stepData.description}
                        </span>
                      </div>
                      
                      {step === currentStep && (
                        <motion.div 
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.4 
            }}
            className="relative"
          >
            {/* Content Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-gray-50/30 rounded-2xl blur-3xl transform scale-105" />
            
            <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl p-8">
              {/* Step Content Wrapper */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
          {isLoadingReservation ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">Loading reservation data...</p>
              </CardContent>
            </Card>
          ) : (
            renderCurrentStep()
          )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
        {showSuccessModal && successData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Reservation Created Successfully!
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Reference Number</p>
                    <p className="text-lg font-mono font-semibold text-gray-900">
                      {successData.referenceNumber}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{successData.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  You can view this reservation in the bookings section.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      navigate('/admin/bookings');
                    }}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Go to Bookings
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

      </div>
    </div>
  );
};