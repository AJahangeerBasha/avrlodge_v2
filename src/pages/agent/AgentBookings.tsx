import React from 'react';
import { SharedBookings } from '@/components/shared';

const AgentBookings: React.FC = () => {
  return <SharedBookings role="agent" />;
};

export { AgentBookings };
export default AgentBookings;