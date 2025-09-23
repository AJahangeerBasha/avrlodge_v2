import React from 'react';
import { AdminCalendar } from '@/pages/admin/AdminCalendar';

interface SharedCalendarProps {
  role: 'admin' | 'manager' | 'agent'
}

export const SharedCalendar: React.FC<SharedCalendarProps> = ({ role }) => {
  // Admin, manager, and agent all use the same calendar functionality
  // The AdminCalendar component already handles role-based permissions internally
  return <AdminCalendar />;
};