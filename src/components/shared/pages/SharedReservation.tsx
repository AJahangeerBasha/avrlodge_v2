import React from 'react';
import { AdminReservation } from '@/pages/admin/AdminReservation';

interface SharedReservationProps {
  role: 'admin' | 'manager'
}

export const SharedReservation: React.FC<SharedReservationProps> = ({ role }) => {
  // Both admin and manager use the same reservation functionality
  // The AdminReservation component already handles role-based permissions internally
  return <AdminReservation />;
};