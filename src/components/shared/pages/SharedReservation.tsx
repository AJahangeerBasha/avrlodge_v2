import React from 'react';
import { AdminReservation } from '@/pages/admin/AdminReservation';

interface SharedReservationProps {
  role: 'admin' | 'manager' | 'agent'
}

export const SharedReservation: React.FC<SharedReservationProps> = ({ role }) => {
  // Admin, manager, and agent all use the same reservation functionality
  // The AdminReservation component already handles role-based permissions internally
  return <AdminReservation />;
};