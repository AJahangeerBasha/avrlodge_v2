import React from 'react';
import { BookingModalManager } from '@/components/bookings/BookingModalManager';
import BookingsPageLayoutV2 from '@/components/common/BookingsPageLayoutV2';

interface SharedBookingsProps {
  role: 'admin' | 'manager'
}

export const SharedBookings: React.FC<SharedBookingsProps> = ({ role }) => {
  return (
    <>
      <BookingsPageLayoutV2 role={role} />
      <BookingModalManager />
    </>
  );
};