import * as React from "react"
import { cn } from "@/lib/utils"

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: number | string
  onChange?: (value: number | undefined) => void
  allowDecimals?: boolean
  allowNegative?: boolean
  formatOnBlur?: boolean
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({
    className,
    value,
    onChange,
    allowDecimals = true,
    allowNegative = false,
    formatOnBlur = false,
    onBlur,
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
      if (formatOnBlur && internalValue !== '') {
        // Clean up the display value on blur
        const numericValue = allowDecimals ? parseFloat(internalValue) : parseInt(internalValue, 10)
        if (!isNaN(numericValue)) {
          setInternalValue(String(numericValue))
        }
      }
      onBlur?.(e)
    }

    return (
      <input
        type="text"
        inputMode="numeric"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        ref={ref}
        {...props}
      />
    )
  }
)

NumberInput.displayName = "NumberInput"

export { NumberInput }