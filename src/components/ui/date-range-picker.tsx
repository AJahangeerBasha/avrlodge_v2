import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDate?: string;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const today = new Date();
  const minSelectableDate = minDate ? new Date(minDate) : today;

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Parse date parts to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-based in JS
    console.log('📅 formatDisplayDate: Input:', dateStr, 'Date object:', date, 'Formatted:', date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }));
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const handleDateSelect = (date: Date) => {
    // Create date string in local timezone to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    console.log('📅 DateRangePicker: Selected date:', date, 'Local date string:', dateStr);

    if (selectingStart || !startDate) {
      console.log('📅 Setting start date:', dateStr);
      onStartDateChange(dateStr);
      setSelectingStart(false);
    } else {
      // Parse start date properly to avoid timezone issues
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
      const startDateObj = new Date(startYear, startMonth - 1, startDay);
      console.log('📅 Current start date:', startDate, 'Selected date:', dateStr);
      if (date >= startDateObj) {
        console.log('📅 Setting end date:', dateStr);
        onEndDateChange(dateStr);
        setIsOpen(false);
        setSelectingStart(true);
      } else {
        console.log('📅 Resetting to new start date:', dateStr);
        onStartDateChange(dateStr);
        onEndDateChange('');
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    // Parse dates properly to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    return date >= start && date <= end;
  };

  const isDateSelected = (date: Date) => {
    // Create date string in local timezone to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return dateStr === startDate || dateStr === endDate;
  };

  const isDateDisabled = (date: Date) => {
    return date < minSelectableDate;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const handleClearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartDateChange('');
    onEndDateChange('');
    setSelectingStart(true);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start text-left font-normal bg-white hover:bg-gray-50 rounded-xl border border-gray-300 focus:border-gray-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarDays className="mr-2 h-4 w-4" />
        <span className="flex-1">
          {startDate && endDate
            ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
            : startDate
              ? `${formatDisplayDate(startDate)} - Select check-out`
              : 'Select check-in and check-out dates'
          }
        </span>
        {(startDate || endDate) && (
          <X 
            className="ml-2 h-4 w-4 text-gray-400 hover:text-gray-600" 
            onClick={handleClearDates}
          />
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 z-50"
          >
            <Card className="w-80 bg-white shadow-lg border border-gray-200">
              <CardContent className="p-4 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-sm font-semibold">{monthYear}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-xs text-center text-gray-600">
                    {selectingStart ? 'Select check-in date' : 'Select check-out date'}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="p-2 text-xs font-medium text-center text-gray-500">
                        {day}
                      </div>
                    ))}

                    {days.map((date, index) => {
                      if (!date) {
                        return <div key={index} className="p-2" />;
                      }

                      const disabled = isDateDisabled(date);
                      const selected = isDateSelected(date);
                      const inRange = isDateInRange(date);

                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={disabled}
                          onClick={() => !disabled && handleDateSelect(date)}
                          className={`p-2 text-xs rounded-md transition-colors duration-150 ${
                            disabled 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'hover:bg-gray-100 cursor-pointer'
                          } ${
                            selected 
                              ? 'bg-black text-white hover:bg-gray-800' 
                              : ''
                          } ${
                            inRange && !selected 
                              ? 'bg-gray-100 text-gray-900' 
                              : ''
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onStartDateChange('');
                        onEndDateChange('');
                        setSelectingStart(true);
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};