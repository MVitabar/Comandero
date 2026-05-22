import { useEffect, useState } from 'react';

export const useNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      // Usa la API nativa del navegador para el permiso
      const status = Notification.permission;
      setIsSubscribed(status === 'granted');
      
      // OneSignal has been removed - userId is no longer available
      setUserId(null);
    };

    checkSubscription();
  }, []);

  const sendNotification = async (data: {
    title: string;
    message: string;
    url?: string;
  }) => {
    try {
      // OneSignal has been removed - using browser notification API as fallback
      if (Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/icon.png',
          data: { url: data.url }
        });
      }
    } catch (error) {
      // Silently fail - notifications are optional
    }
  };

  return {
    isSubscribed,
    userId,
    sendNotification
  };
};