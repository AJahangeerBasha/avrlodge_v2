import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: number | string
  onChange?: (value: number | undefined) => void
  allowDecimals?: boolean
  allowNegative?: boolean
  formatOnBlur?: boolean
  min?: number
  max?: number
  step?: number
  showButtons?: boolean
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({
    className,
    value,
    onChange,
    allowDecimals = true,
    allowNegative = false,
    formatOnBlur = false,
    min,
    max,
    step = 1,
    showButtons = false,
    onBlur,
    disabled,
    ...props
  }, ref) => {
    // Internal string state to allow clearing
    const [internalValue, setInternalValue] = React.useState<string>(() => {
      if (value === undefined || value === null) return ''
      return String(value)
    })

    // Update internal value when external value changes
    React.useEffect(() => {
      if (value === undefined || value === null) {
        setInternalValue('')
      } else {
        setInternalValue(String(value))
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value

      // Allow empty string for clearing
      if (inputValue === '') {
        setInternalValue('')
        onChange?.(undefined)
        return
      }

      // Validate input based on options
      let validValue = inputValue

      // Remove non-numeric characters (except decimal point and minus sign)
      if (!allowDecimals) {
        validValue = validValue.replace(/[^-?\d]/g, '')
      } else {
        validValue = validValue.replace(/[^-?\d.]/g, '')
      }

      // Handle negative sign
      if (!allowNegative) {
        validValue = validValue.replace(/-/g, '')
      } else {
        // Only allow one minus sign at the beginning
        const minusCount = (validValue.match(/-/g) || []).length
        if (minusCount > 1) {
          validValue = validValue.replace(/-/g, '')
          if (inputValue.startsWith('-')) {
            validValue = '-' + validValue
          }
        } else if (validValue.includes('-') && !validValue.startsWith('-')) {
          validValue = validValue.replace(/-/g, '')
        }
      }

      // Handle decimal points
      if (allowDecimals) {
        const decimalCount = (validValue.match(/\./g) || []).length
        if (decimalCount > 1) {
          // Remove extra decimal points (keep the first one)
          const firstDecimalIndex = validValue.indexOf('.')
          validValue = validValue.substring(0, firstDecimalIndex + 1) +
                      validValue.substring(firstDecimalIndex + 1).replace(/\./g, '')
        }
      }

      setInternalValue(validValue)

      // Convert to number for callback
      if (validValue === '' || validValue === '-' || validValue === '.') {
        onChange?.(undefined)
      } else {
        const numericValue = allowDecimals ? parseFloat(validValue) : parseInt(validValue, 10)
        if (!isNaN(numericValue)) {
          onChange?.(numericValue)
        } else {
          onChange?.(undefined)
        }
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      let finalValue = internalValue

      if (formatOnBlur && internalValue !== '') {
        // Clean up the display value on blur
        const numericValue = allowDecimals ? parseFloat(internalValue) : parseInt(internalValue, 10)
        if (!isNaN(numericValue)) {
          let clampedValue = numericValue

          // Apply min/max constraints
          if (min !== undefined && clampedValue < min) clampedValue = min
          if (max !== undefined && clampedValue > max) clampedValue = max

          finalValue = String(clampedValue)
          setInternalValue(finalValue)
          onChange?.(clampedValue)
        }
      } else if (internalValue !== '') {
        // Apply min/max on blur even without formatOnBlur
        const numericValue = allowDecimals ? parseFloat(internalValue) : parseInt(internalValue, 10)
        if (!isNaN(numericValue)) {
          let clampedValue = numericValue
          if (min !== undefined && clampedValue < min) clampedValue = min
          if (max !== undefined && clampedValue > max) clampedValue = max

          if (clampedValue !== numericValue) {
            setInternalValue(String(clampedValue))
            onChange?.(clampedValue)
          }
        }
      }

      onBlur?.(e)
    }

    const handleIncrement = () => {
      const currentValue = value ? Number(value) : (min ?? 0)
      let newValue = currentValue + step

      if (max !== undefined && newValue > max) {
        newValue = max
      }

      setInternalValue(String(newValue))
      onChange?.(newValue)
    }

    const handleDecrement = () => {
      const currentValue = value ? Number(value) : (min ?? 0)
      let newValue = currentValue - step

      if (min !== undefined && newValue < min) {
        newValue = min
      }

      setInternalValue(String(newValue))
      onChange?.(newValue)
    }

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (disabled) return
      e.preventDefault()

      if (e.deltaY < 0) {
        handleIncrement()
      } else {
        handleDecrement()
      }
    }

    const currentValue = value ? Number(value) : (min ?? 0)
    const isMinReached = min !== undefined && currentValue <= min
    const isMaxReached = max !== undefined && currentValue >= max

    if (showButtons) {
      return (
        <div className={cn("flex items-center gap-1", className)}>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || isMinReached}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease value"
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          <input
            type="text"
            inputMode={allowDecimals ? "decimal" : "numeric"}
            className={cn(
              "flex h-8 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            )}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onWheel={handleWheel}
            disabled={disabled}
            ref={ref}
            {...props}
          />

          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || isMaxReached}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Increase value"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      )
    }

    return (
      <input
        type="text"
        inputMode={allowDecimals ? "decimal" : "numeric"}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onWheel={handleWheel}
        disabled={disabled}
        ref={ref}
        {...props}
      />
    )
  }
)

NumberInput.displayName = "NumberInput"

export { NumberInput }