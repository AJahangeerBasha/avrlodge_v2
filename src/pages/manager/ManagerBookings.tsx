import React from 'react';
import { SharedBookings } from '@/components/shared';

const ManagerBookings: React.FC = () => {
  return <SharedBookings role="manager" />;
};

export { ManagerBookings };
export default ManagerBookings;