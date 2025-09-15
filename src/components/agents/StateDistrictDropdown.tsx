import { useState, useEffect } from 'react'
import Select from 'react-select'
import statesDistrictsData from '@/data/states-districts.json'

interface StateDistrictDropdownProps {
  selectedState: string
  selectedDistrict: string
  onStateChange: (state: string) => void
  onDistrictChange: (district: string) => void
  className?: string
  disabled?: boolean
}

interface SelectOption {
  value: string
  label: string
}

export const StateDistrictDropdown = ({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  className = '',
  disabled = false
}: StateDistrictDropdownProps) => {
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([])

  // State options from the JSON data
  const stateOptions: SelectOption[] = statesDistrictsData.map(stateData => ({
    value: stateData.state,
    label: stateData.state
  }))

  // Update district options when state changes
  useEffect(() => {
    if (selectedState) {
      const stateData = statesDistrictsData.find(s => s.state === selectedState)
      if (stateData && stateData.district.length > 0) {
        const options = stateData.district.map(district => ({
          value: district,
          label: district
        }))
        setDistrictOptions(options)
      } else {
        setDistrictOptions([])
      }
    } else {
      setDistrictOptions([])
    }
  }, [selectedState])

  // Handle state selection
  const handleStateChange = (selectedOption: SelectOption | null) => {
    const newState = selectedOption?.value || ''
    onStateChange(newState)

    // Clear district when state changes
    if (selectedDistrict) {
      onDistrictChange('')
    }
  }

  // Handle district selection
  const handleDistrictChange = (selectedOption: SelectOption | null) => {
    const newDistrict = selectedOption?.value || ''
    onDistrictChange(newDistrict)
  }

  // Custom styles for react-select to match the design
  const customStyles = {
    control: (provided: Record<string, any>, state: { isFocused: boolean }) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(4px)',
      borderColor: state.isFocused ? '#000000' : 'rgba(0, 0, 0, 0.2)',
      borderWidth: '1px',
      borderRadius: '6px',
      boxShadow: state.isFocused ? '0 0 0 1px #000000' : 'none',
      '&:hover': {
        borderColor: 'rgba(0, 0, 0, 0.3)'
      },
      minHeight: '40px'
    }),
    option: (provided: Record<string, any>, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#000000'
        : state.isFocused
        ? '#f5f5f5'
        : 'white',
      color: state.isSelected ? 'white' : '#000000',
      '&:hover': {
        backgroundColor: state.isSelected ? '#000000' : '#f5f5f5'
      }
    }),
    menu: (provided: Record<string, any>) => ({
      ...provided,
      backgroundColor: 'white',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 50
    }),
    placeholder: (provided: Record<string, any>) => ({
      ...provided,
      color: '#6b7280'
    }),
    singleValue: (provided: Record<string, any>) => ({
      ...provided,
      color: '#000000'
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* State Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State *
        </label>
        <Select
          value={stateOptions.find(option => option.value === selectedState) || null}
          onChange={handleStateChange}
          options={stateOptions}
          placeholder="Select State"
          isSearchable
          isClearable
          isDisabled={disabled}
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* District Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          District *
        </label>
        <Select
          value={districtOptions.find(option => option.value === selectedDistrict) || null}
          onChange={handleDistrictChange}
          options={districtOptions}
          placeholder={selectedState ? "Select District" : "Select State first"}
          isSearchable
          isClearable
          isDisabled={disabled || !selectedState || districtOptions.length === 0}
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
    </div>
  )
}

export default StateDistrictDropdown