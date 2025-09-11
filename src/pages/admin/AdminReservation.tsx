import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CheckCircle, UserPlus, Calendar, Users, BedDouble, CreditCard, Plus, Trash2, X, MapPin } from 'lucide-react';
import { useReservationStore } from '../../stores/reservationStore';
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
  
  // Track original data for edit mode to detect deletions
  const [originalSecondaryGuests, setOriginalSecondaryGuests] = useState<any[]>([]);
  const [originalRoomAllocations, setOriginalRoomAllocations] = useState<any[]>([]);
  const [originalSpecialCharges, setOriginalSpecialCharges] = useState<any[]>([]);

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

  const loadInitialData = async () => {
    try {
      const [roomTypesData, roomsData, specialChargesData] = await Promise.all([
        getAllRoomTypes(),
        getAllRooms(),
        getAllSpecialCharges()
      ]);
      
      setRoomTypes(roomTypesData);
      setRooms(roomsData);
      setSpecialChargesMaster(specialChargesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load initial data');
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
        setPincode(primaryGuestLocation.pincode || '');
        setState(primaryGuestLocation.state || '');
        setDistrict(primaryGuestLocation.district || '');
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
      
      // Prepare reservation data
      const reservationData = {
        referenceNumber: isEditMode ? undefined : referenceNumber,
        guestName: primaryGuest.name,
        guestEmail: '', // Not captured in this form
        guestPhone: primaryGuest.phone,
        guestType: guestType,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        guestCount: guestCount,
        totalPrice: calculateTotalAmount(),
        status: 'reservation' as const,
        paymentStatus: 'pending' as const,
        isActive: true,
        createdBy: currentUser.uid,
        updatedBy: currentUser.uid
      };

      let savedReservation;
      
      if (isEditMode && editReservationId) {
        // Update existing reservation
        savedReservation = await updateReservation(editReservationId, reservationData, currentUser.uid);
        
        setError('');
        console.log('Reservation updated successfully');
        navigate('/admin/bookings');
        return;
      } else {
        // Create new reservation
        savedReservation = await createReservation(reservationData, currentUser.uid);
        
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
    const primaryPhoneError = getPhoneValidationError(primaryGuest.phone);
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Primary Guest</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryName">Full Name *</Label>
                <Input
                  id="primaryName"
                  value={primaryGuest.name}
                  onChange={(e) => updatePrimaryGuestField('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="primaryPhone">Phone Number *</Label>
                <Input
                  id="primaryPhone"
                  value={primaryGuest.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    updatePrimaryGuestField('phone', formatted);
                  }}
                  placeholder="Enter 10-digit phone number starting with 6-9"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className={primaryPhoneError ? 'border-red-500' : ''}
                  required
                />
                {primaryPhoneError && (
                  <p className="text-sm text-red-600 mt-1">{primaryPhoneError}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="primaryWhatsapp">WhatsApp (Optional)</Label>
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
                      <Input
                        id="primaryWhatsapp"
                        value={primaryGuest.whatsapp}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          updatePrimaryGuestField('whatsapp', formatted);
                        }}
                        placeholder="Enter 10-digit WhatsApp number starting with 6-9"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className={primaryWhatsappError ? 'border-red-500' : ''}
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
                <Label htmlFor="primaryTelegram">Telegram (Optional)</Label>
                <Input
                  id="primaryTelegram"
                  value={primaryGuest.telegram}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    updatePrimaryGuestField('telegram', formatted);
                  }}
                  placeholder="Enter 10-digit Telegram number starting with 6-9"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className={primaryTelegramError ? 'border-red-500' : ''}
                />
                {primaryTelegramError && (
                  <p className="text-sm text-red-600 mt-1">{primaryTelegramError}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Guests */}
        <Card>
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
                const phoneError = getPhoneValidationError(guest.phone);
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
                        <Label>Full Name *</Label>
                        <Input
                          value={guest.name}
                          onChange={(e) => updateSecondaryGuest(guest.id, { name: e.target.value })}
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label>Phone Number *</Label>
                        <Input
                          value={guest.phone}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            updateSecondaryGuest(guest.id, { phone: formatted });
                          }}
                          placeholder="Enter 10-digit phone number starting with 6-9"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          className={phoneError ? 'border-red-500' : ''}
                          required
                        />
                        {phoneError && (
                          <p className="text-sm text-red-600 mt-1">{phoneError}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>WhatsApp (Optional)</Label>
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
                              <Input
                                value={guest.whatsapp}
                                onChange={(e) => {
                                  const formatted = formatPhoneNumber(e.target.value);
                                  updateSecondaryGuest(guest.id, { whatsapp: formatted });
                                }}
                                placeholder="Enter 10-digit WhatsApp number starting with 6-9"
                                maxLength={10}
                                pattern="[0-9]{10}"
                                className={whatsappError ? 'border-red-500' : ''}
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
                        <Label>Telegram (Optional)</Label>
                        <Input
                          value={guest.telegram}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            updateSecondaryGuest(guest.id, { telegram: formatted });
                          }}
                          placeholder="Enter 10-digit Telegram number starting with 6-9"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          className={telegramError ? 'border-red-500' : ''}
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

        {/* Action Buttons */}
        <div className="flex justify-end">
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
          >
            Next: Location & Dates
          </Button>
        </div>
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
        {/* Header with Step Indicator */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-black">Tell us where you're traveling from</h3>
            <p className="text-gray-600 mt-1">Provide guest location and stay details</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Step 2 of 4</div>
            <div className="text-xs text-gray-500">Location & Dates</div>
          </div>
        </div>

        {/* Location Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Location Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                  Select State *
                </Label>
                <select
                  id="state"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  required
                >
                  {statesDistrictsData.map((stateData) => (
                    <option key={stateData.id} value={stateData.state}>
                      {stateData.state}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="district" className="text-sm font-medium text-gray-700">
                  Search District *
                </Label>
                <SearchableDropdown
                  options={districts}
                  value={selectedDistrict}
                  onChange={setSelectedDistrict}
                  placeholder="Search and select district"
                  disabled={!selectedState}
                  required
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stay Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Stay Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Stay Dates *</Label>
              <p className="text-xs text-gray-500 mb-2">Select Check In & Check Out</p>
              <DateRangePicker
                startDate={checkInDate}
                endDate={checkOutDate}
                onStartDateChange={setCheckInDate}
                onEndDateChange={setCheckOutDate}
                minDate={new Date().toISOString().split('T')[0]}
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-gray-500">Check-in time</div>
                <div className="font-semibold text-gray-900">12:00 PM</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Check-out time</div>
                <div className="font-semibold text-gray-900">11:00 AM</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Number of nights</div>
                <div className="font-semibold text-blue-600 text-lg">{numberOfNights}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Guest Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestCount" className="text-sm font-medium text-gray-700">
                  Number of Pax (Adults + Kids) *
                </Label>
                <Input
                  id="guestCount"
                  type="number"
                  min="1"
                  max="20"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  className="p-3 text-lg font-semibold"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="guestType" className="text-sm font-medium text-gray-700">
                  Guest Type *
                </Label>
                <select 
                  id="guestType"
                  value={guestType}
                  onChange={(e) => setGuestType(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
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
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} className="px-6">
            Back: Guest Details
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!selectedState || !selectedDistrict || !checkInDate || !checkOutDate || !guestType}
            className="px-6"
          >
            Next: Room Allocation
          </Button>
        </div>
      </div>
    );
  };

  const renderRoomAllocationForm = () => {
    const totalCost = calculateTotalAmount();

    const addNewRoom = () => {
      // Get already selected room IDs to exclude them
      const selectedRoomIds = roomAllocations.map(allocation => allocation.roomId);
      
      // Get first available room that hasn't been selected yet
      const availableRoom = rooms.find(room => 
        room.status === 'available' && 
        room.isActive && 
        !selectedRoomIds.includes(room.id)
      );
      
      if (!availableRoom) {
        setError('No more available rooms found');
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
        {/* Header with Total Cost */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-black">Room Allocation</h3>
            <p className="text-gray-600 mt-1">Select rooms and allocate guests</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Guests: {guestCount}</div>
            <div className="text-lg font-bold text-black">Total Cost: ₹{totalCost.toLocaleString()}</div>
          </div>
        </div>

        {/* Room Allocation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Room Allocation</span>
              <Button 
                onClick={addNewRoom}
                className="flex items-center space-x-2"
                disabled={rooms.filter(r => 
                  r.status === 'available' && 
                  r.isActive && 
                  !roomAllocations.map(allocation => allocation.roomId).includes(r.id)
                ).length === 0}
              >
                <Plus className="h-4 w-4" />
                <span>Add Room</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomAllocations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No rooms allocated yet.</p>
                <p className="text-sm mt-1">Click "Add Room" to allocate rooms for guests.</p>
              </div>
            ) : (
              roomAllocations.map((allocation, index) => {
                // Get available rooms for this room type, excluding already selected rooms (except current one)
                const roomType = roomTypes.find(rt => rt.name === allocation.roomType);
                const otherSelectedRoomIds = roomAllocations
                  .filter(otherAllocation => otherAllocation.id !== allocation.id)
                  .map(otherAllocation => otherAllocation.roomId);
                
                const availableRooms = rooms.filter(room => 
                  room.roomTypeId === roomType?.id && 
                  room.status === 'available' && 
                  room.isActive &&
                  (!otherSelectedRoomIds.includes(room.id) || room.id === allocation.roomId)
                );

                return (
                  <div key={allocation.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Room {index + 1}</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeRoomAllocation(allocation.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Room Number Dropdown */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Room Number</Label>
                        <select
                          value={allocation.roomNumber}
                          onChange={(e) => {
                            const selectedRoom = availableRooms.find(r => r.roomNumber === e.target.value);
                            if (selectedRoom) {
                              updateRoomAllocation(allocation.id, {
                                roomId: selectedRoom.id,
                                roomNumber: selectedRoom.roomNumber
                              });
                            }
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
                        >
                          {availableRooms.map((room) => (
                            <option key={room.id} value={room.roomNumber}>
                              {room.roomNumber} - ₹{allocation.tariff}/night
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Guest Count */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Guest Count</Label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={allocation.guestCount}
                          onChange={(e) => updateRoomAllocation(allocation.id, {
                            guestCount: parseInt(e.target.value) || 1
                          })}
                          className="p-3 text-lg font-semibold"
                        />
                      </div>
                    </div>

                    {/* Capacity Warning */}
                    <div className="mt-3 text-sm text-gray-600">
                      {allocation.guestCount > allocation.capacity && (
                        <p className="text-amber-600 font-medium">
                          ⚠️ Can exceed room capacity. Extra guests will incur additional charges.
                        </p>
                      )}
                    </div>

                    {/* Room Info */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white rounded-lg">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Capacity</div>
                        <div className="font-semibold text-gray-900">{allocation.capacity} guests</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Tariff</div>
                        <div className="font-semibold text-gray-900">₹{allocation.tariff}/night</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} className="px-6">
            Back: Location & Dates
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={roomAllocations.length === 0}
            className="px-6"
          >
            Next: Payment & Confirm
          </Button>
        </div>
      </div>
    );
  };

  const renderPaymentConfirmationForm = () => {
    const numberOfNights = calculateNumberOfNights();
    
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Room Tariff Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomAllocations.map((room, index) => (
              <div key={room.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{room.roomNumber} - {room.roomType}</div>
                    <div className="text-sm text-gray-600">{room.guestCount} guests</div>
                    <div className="text-sm text-gray-600">₹{room.tariff}/night</div>
                    <div className="text-sm text-gray-600">Capacity: {room.capacity}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Room Tariff</span>
                <div className="text-right">
                  <div className="font-bold text-lg text-black">₹{roomTariffTotal.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{numberOfNights} night{numberOfNights !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Charges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Special Charges</span>
              <Button 
                onClick={addCustomCharge}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Custom Charge</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Master Special Charges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialChargesMaster.map((masterCharge) => {
                const isSelected = specialCharges.some(sc => sc.masterId === masterCharge.id);
                
                return (
                  <div 
                    key={masterCharge.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        // Remove charge
                        const chargeToRemove = specialCharges.find(sc => sc.masterId === masterCharge.id);
                        if (chargeToRemove) {
                          removeSpecialCharge(chargeToRemove.id);
                        }
                      } else {
                        // Add charge
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
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{masterCharge.chargeName}</span>
                      <span className="font-bold">₹{masterCharge.defaultRate}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Charges */}
            {specialCharges.length > 0 && (
              <div className="space-y-2 mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Selected Charges:</h4>
                {specialCharges.map((charge) => (
                  <div key={charge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{charge.name}</div>
                      {charge.quantity && charge.quantity > 1 && (
                        <div className="text-sm text-gray-600">Qty: {charge.quantity}</div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">₹{charge.amount * (charge.quantity || 1)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeSpecialCharge(charge.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total Special Charges</span>
                <span className="font-bold text-lg text-black">₹{specialChargesTotal.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discount Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Discount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Discount Type</Label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="amount">Fixed Amount</option>
                </select>
              </div>
              
              {discountType !== 'none' && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={discountType === 'percentage' ? 100 : subtotal}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="p-3"
                    placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Final Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Final Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Room Tariff</span>
                <span className="font-medium">₹{roomTariffTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Special Charges</span>
                <span className="font-medium">₹{specialChargesTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-medium">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 text-xl font-bold text-black">
                <span>Total Amount</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} className="px-6">
            Back: Room Allocation
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting} className="px-6">
            {isSubmitting ? 'Creating...' : isEditMode ? 'Update Reservation' : 'Create Reservation'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-white min-h-screen">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h2 className="text-3xl font-serif font-bold text-black">
            {isEditMode ? 'Edit Reservation' : 'Create Reservation'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isEditMode ? 'Update the reservation details below' : 'Complete the form to create a new guest reservation'}
          </p>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  step <= currentStep ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 text-sm ${
                  step <= currentStep ? 'text-black font-medium' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Guest Details'}
                  {step === 2 && 'Dates & Location'}
                  {step === 3 && 'Room Allocation'}
                  {step === 4 && 'Confirmation'}
                </span>
                {step < 4 && <div className="w-8 h-px bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
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
  );
};