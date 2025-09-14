import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Clock, Users, UserCheck, Search } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import Select from 'react-select'
import statesDistrictsData from '@/data/states-districts.json'

interface LocationDatesFormProps {
  searchMethod: 'pincode' | 'state-district'
  pincode: string
  state: string
  town: string
  checkInDate: string
  checkOutDate: string
  guestCount: number
  guestType: string
  isEditMode?: boolean
  onSearchMethodChange: (method: 'pincode' | 'state-district') => void
  onPincodeChange: (pincode: string) => void
  onStateChange: (state: string) => void
  onTownChange: (town: string) => void
  onCheckInDateChange: (date: string) => void
  onCheckOutDateChange: (date: string) => void
  onGuestCountChange: (count: number) => void
  onGuestTypeChange: (type: string) => void
  onNext: () => void
  onBack: () => void
}

interface PincodeData {
  PostOffice: Array<{
    State: string
    District: string
  }>
}

export default function LocationDatesForm({
  searchMethod,
  pincode,
  state,
  town,
  checkInDate,
  checkOutDate,
  guestCount,
  guestType,
  isEditMode = false,
  onSearchMethodChange,
  onPincodeChange,
  onStateChange,
  onTownChange,
  onCheckInDateChange,
  onCheckOutDateChange,
  onGuestCountChange,
  onGuestTypeChange,
  onNext,
  onBack
}: LocationDatesFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoadingPincode, setIsLoadingPincode] = useState(false)

  const guestTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'couple', label: 'Couple' },
    { value: 'family', label: 'Family' },
    { value: 'friends', label: 'Friends' }
  ]

  // Get district options for react-select based on selected state
  const getDistrictOptions = (stateName: string) => {
    const stateData = statesDistrictsData.find(s => s.state === stateName)
    if (!stateData || stateData.district.length === 0) return []
    
    return stateData.district.map(district => ({
      value: district,
      label: district
    }))
  }

  const districtOptions = getDistrictOptions(state)
  const stateOptions = statesDistrictsData.map(s => ({
    value: s.state,
    label: s.state
  }))

  // Handle manual state selection
  const handleManualStateChange = (selectedOption: any) => {
    const selectedState = selectedOption?.value || ''
    onStateChange(selectedState)
    // Clear town when state changes
    onTownChange('')
  }

  // Handle manual district selection
  const handleManualDistrictChange = (selectedOption: any) => {
    const selectedDistrict = selectedOption?.value || ''
    onTownChange(selectedDistrict)
  }

  // Handle manual district text input (for Others state)
  const handleManualDistrictTextChange = (value: string) => {
    onTownChange(value)
  }

  // Handle search method change but preserve existing values
  const handleSearchMethodChange = (method: 'pincode' | 'state-district') => {
    onSearchMethodChange(method)
    setErrors({})
  }

  const fetchPincodeData = useCallback(async (pincodeValue: string) => {
    if (!pincodeValue || pincodeValue.length !== 6) return
    
    setIsLoadingPincode(true)
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincodeValue}`)
      const data = await response.json()
      
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.[0]) {
        const postOffice = data[0].PostOffice[0]
        onStateChange(postOffice.State || '')
        onTownChange(postOffice.District || '')
      }
    } catch (error) {
      console.error('Error fetching pincode data:', error)
    } finally {
      setIsLoadingPincode(false)
    }
  }, [onStateChange, onTownChange, setIsLoadingPincode])

  useEffect(() => {
    if (pincode.length === 6) {
      fetchPincodeData(pincode)
    }
  }, [pincode, fetchPincodeData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Skip location validation in edit mode
    if (!isEditMode) {
      // Location validation based on search method
      if (searchMethod === 'pincode') {
        if (!pincode.trim()) {
          newErrors.pincode = 'Pincode is required'
        } else if (pincode.length !== 6) {
          newErrors.pincode = 'Pincode must be 6 digits'
        }
      } else {
        // State/District validation
        if (!state.trim()) {
          newErrors.state = 'State is required'
        }
        if (!town.trim()) {
          newErrors.town = 'District is required'
        }
      }
    }

    if (!checkInDate) {
      newErrors.checkInDate = 'Check-in date is required'
    }

    if (!checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required'
    } else if (checkInDate && checkOutDate <= checkInDate) {
      newErrors.checkOutDate = 'Check-out date must be after check-in date'
    }

    if (guestCount < 1) {
      newErrors.guestCount = 'At least 1 guest is required'
    }

    if (!guestType) {
      newErrors.guestType = 'Guest type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const handleCheckInDateChange = (date: Date | null) => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd')
      onCheckInDateChange(dateString)
      // Clear checkout date when check-in changes to allow manual selection
      onCheckOutDateChange('')
    } else {
      onCheckInDateChange('')
      onCheckOutDateChange('')
    }
  }

  const totalNumberOfNights = checkInDate && checkOutDate
    ? Math.max(1, (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const handleCheckOutDateChange = (date: Date | null) => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd')
      onCheckOutDateChange(dateString)
    } else {
      onCheckOutDateChange('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Location Section - Hidden in edit mode */}
      {!isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-900 rounded-xl shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
              <p className="text-sm text-gray-600 mt-1">Tell us where you're traveling from</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
            <span>Step 2 of 4</span>
          </div>
        </div>

        {/* Enhanced Search Method Toggle */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <motion.button
              type="button"
              onClick={() => handleSearchMethodChange('pincode')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                searchMethod === 'pincode'
                  ? 'border-gray-900 bg-gray-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="text-center">
                <div className={`font-semibold text-sm ${searchMethod === 'pincode' ? 'text-blue-700' : 'text-gray-700'}`}>
                  Search by Pincode
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Quick & automatic location detection
                </div>
              </div>
            </motion.button>
            
            <motion.button
              type="button"
              onClick={() => handleSearchMethodChange('state-district')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                searchMethod === 'state-district'
                  ? 'border-gray-900 bg-gray-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="text-center">
                <div className={`font-semibold text-sm ${searchMethod === 'state-district' ? 'text-blue-700' : 'text-gray-700'}`}>
                  State & District
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Manual selection with search
                </div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Conditional Location Fields */}
        <motion.div
          key={searchMethod}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {searchMethod === 'pincode' ? (
            // Enhanced Pincode Search Section
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    Your Pincode *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={pincode}
                      onChange={(e) => onPincodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyPress={(e) => {
                        // Prevent non-numeric characters from being entered
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) {
                          e.preventDefault()
                        }
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-mono tracking-wider ${
                        errors.pincode 
                          ? 'border-red-300 bg-red-50' 
                          : pincode.length === 6 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      placeholder="000000"
                      maxLength={6}
                    />
                    {isLoadingPincode && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                      </motion.div>
                    )}
                    {pincode.length === 6 && !isLoadingPincode && state && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {pincode.length > 0 && pincode.length < 6 && (
                      <span className="text-orange-600">{6 - pincode.length} more digits needed</span>
                    )}
                  </div>
                  {errors.pincode && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-2 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.pincode}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <span className="w-5 h-5 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    State
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={state}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="Will be auto-filled"
                      readOnly
                    />
                    {state && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <span className="w-5 h-5 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    District
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={town}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="Will be auto-filled"
                      readOnly
                    />
                    {town && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Success message */}
              {pincode.length === 6 && state && town && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-green-900">Location Detected Successfully!</h3>
                      <p className="text-xs text-green-700 mt-1">
                        We found your location: <span className="font-medium">{town}, {state}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
        ) : (
          // Enhanced State & District Search Section
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <span className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Select State *
                </label>
                <div className="relative">
                  <Select
                    value={stateOptions.find(option => option.value === state)}
                    onChange={handleManualStateChange}
                    options={stateOptions}
                    placeholder="Choose your state..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isClearable
                    styles={{
                      control: (base, selectState) => ({
                        ...base,
                        padding: '8px 8px',
                        borderWidth: '2px',
                        borderRadius: '12px',
                        borderColor: errors.state ? '#f87171' : (selectState.isFocused ? '#6366f1' : '#d1d5db'),
                        boxShadow: selectState.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
                        '&:hover': {
                          borderColor: selectState.isFocused ? '#6366f1' : '#9ca3af'
                        }
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: '#9ca3af',
                        fontSize: '14px'
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: '14px',
                        fontWeight: '500'
                      })
                    }}
                  />
                  {state && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                    >
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </div>
                {errors.state && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm mt-2 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.state}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    state ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-white'
                  }`}>2</span>
                  {state === 'Tamil Nadu' || state === 'Pondicherry' ? 'Search District *' : 'Enter District *'}
                </label>
                
                {!state ? (
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center min-h-[48px]">
                    <span className="text-sm">Please select a state first</span>
                  </div>
                ) : (state === 'Tamil Nadu' || state === 'Pondicherry') ? (
                  <div className="relative">
                    <Select
                      value={districtOptions.find(option => option.value === town)}
                      onChange={handleManualDistrictChange}
                      options={districtOptions}
                      placeholder={`Search in ${districtOptions.length} districts...`}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                      isSearchable
                      noOptionsMessage={({ inputValue }) => 
                        inputValue ? `No districts found matching "${inputValue}"` : `No districts available`
                      }
                      styles={{
                        control: (base, selectState) => ({
                          ...base,
                          padding: '8px 8px',
                          borderWidth: '2px',
                          borderRadius: '12px',
                          borderColor: errors.town ? '#f87171' : (selectState.isFocused ? '#6366f1' : '#d1d5db'),
                          boxShadow: selectState.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
                          '&:hover': {
                            borderColor: selectState.isFocused ? '#6366f1' : '#9ca3af'
                          }
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: '#9ca3af',
                          fontSize: '14px'
                        }),
                        singleValue: (base) => ({
                          ...base,
                          fontSize: '14px',
                          fontWeight: '500'
                        })
                      }}
                    />
                    {town && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                      >
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={town}
                      onChange={(e) => handleManualDistrictTextChange(e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                        errors.town ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                      placeholder="Type your district name..."
                    />
                    {town && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
                
                {errors.town && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm mt-2 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.town}
                  </motion.p>
                )}

                {/* Helper text based on state */}
                {state && (
                  <div className="mt-2 text-xs text-gray-500">
                    {(state === 'Tamil Nadu' || state === 'Pondicherry') ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Start typing to search through {districtOptions.length} available districts
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Enter your district or city name manually
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Success message */}
            {state && town && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-green-900">Location Selected!</h3>
                    <p className="text-xs text-green-700 mt-1">
                      Your location: <span className="font-medium">{town}, {state}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
        </motion.div>
        </motion.div>
      )}

      {/* Dates Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Stay Details</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stay Dates *
          </label>
          <DateRangePicker
            checkInDate={checkInDate ? new Date(checkInDate) : null}
            checkOutDate={checkOutDate ? new Date(checkOutDate) : null}
            onCheckInChange={handleCheckInDateChange}
            onCheckOutChange={handleCheckOutDateChange}
            className="w-full"
          />
          {(errors.checkInDate || errors.checkOutDate) && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm mt-1"
            >
              {errors.checkInDate || errors.checkOutDate}
            </motion.p>
          )}
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>Check-in time: 12:00 PM</span>
            <span>Check-out time: 11:00 AM</span>
            <span>Number of nights: {totalNumberOfNights}</span>
          </div>
        </div>
      </motion.div>

      {/* Guest Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Guest Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Pax (Adults + Kids) *
            </label>
            <input
              type="number"
              value={guestCount}
              onChange={(e) => onGuestCountChange(parseInt(e.target.value) || 0)}
              min="1"
              max="50"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors ${
                errors.guestCount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter total number of guests"
            />
            {errors.guestCount && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm mt-1"
              >
                {errors.guestCount}
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guest Type *
            </label>
            <select
              value={guestType}
              onChange={(e) => onGuestTypeChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors ${
                errors.guestType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select guest type</option>
              {guestTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.guestType && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm mt-1"
              >
                {errors.guestType}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 sm:justify-between"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-full sm:w-auto px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium touch-manipulation"
        >
          ← Back: Guest Details
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md touch-manipulation font-medium"
        >
          Next: Room Allocation →
        </motion.button>
      </motion.div>
    </motion.div>
  )
} 