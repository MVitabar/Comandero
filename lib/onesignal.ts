import OneSignal from 'react-onesignal';

export const initializeOneSignal = async () => {
  try {
    await OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: true,
        size: 'medium',
        position: 'bottom-right',
      },
      promptOptions: {
        slidedown: {
          enabled: true,
          actionMessage: "¿Deseas recibir notificaciones de pedidos?",
          acceptButton: "Permitir",
          cancelButton: "Cancelar"
        }
      }
    });
  } catch (error) {
    console.error('Error initializing OneSignal:', error);
  }
};