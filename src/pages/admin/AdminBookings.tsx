import React from 'react';
import { SharedBookings } from '@/components/shared';

const AdminBookings: React.FC = () => {
  return <SharedBookings role="admin" />;
};

export { AdminBookings };
export default AdminBookings;