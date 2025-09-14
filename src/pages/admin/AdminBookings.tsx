import React from 'react';
import { BookingsProvider } from '@/contexts/BookingsContext';
import { BookingModalManager } from '@/components/bookings/BookingModalManager';
import FirebaseBookingsPageLayout from '../../components/common/FirebaseBookingsPageLayout';

export const AdminBookings: React.FC = () => {
  return (
    <BookingsProvider>
      <FirebaseBookingsPageLayout role="admin" />
      <BookingModalManager />
    </BookingsProvider>
  );
};