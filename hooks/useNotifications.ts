import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

export const useNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      const status = await OneSignal.getNotificationPermission();
      setIsSubscribed(status === 'granted');
      
      const id = await OneSignal.getUserId();
      setUserId(id);
    };

    checkSubscription();
  }, []);

  const sendNotification = async (data: {
    title: string;
    message: string;
    url?: string;
  }) => {
    try {
      await OneSignal.sendSelfNotification(
        data.title,
        data.message,
        data.url || window.location.origin,
        '/icon.png'
      );
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return {
    isSubscribed,
    userId,
    sendNotification
  };
};