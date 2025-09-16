import React from 'react';
import { AdminCalendar } from '@/pages/admin/AdminCalendar';

interface SharedCalendarProps {
  role: 'admin' | 'manager'
}

export const SharedCalendar: React.FC<SharedCalendarProps> = ({ role }) => {
  // Both admin and manager use the same calendar functionality
  // The AdminCalendar component already handles role-based permissions internally
  return <AdminCalendar />;
};