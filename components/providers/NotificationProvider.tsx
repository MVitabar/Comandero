import { ReactNode } from 'react';

export const NotificationProvider = ({ 
  children 
}: { 
  children: ReactNode 
}) => {
  // OneSignal has been removed - no longer needed
  return <>{children}</>;
};