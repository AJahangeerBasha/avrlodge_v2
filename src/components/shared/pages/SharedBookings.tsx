import React from 'react';
import { BookingsProvider } from '@/contexts/BookingsContext';
import { BookingModalManager } from '@/components/bookings/BookingModalManager';
import BookingsPageLayout from '@/components/common/BookingsPageLayout';

interface SharedBookingsProps {
  role: 'admin' | 'manager'
}

export const SharedBookings: React.FC<SharedBookingsProps> = ({ role }) => {
  return (
    <BookingsProvider>
      <BookingsPageLayout role={role} />
      <BookingModalManager />
    </BookingsProvider>
  );
};