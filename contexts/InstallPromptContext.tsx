// contexts/InstallPromptContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interfaz para el evento BeforeInstallPromptEvent (puede que necesites instalar @types/wicg-before-install-prompt o definirla así)
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallPromptContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  triggerInstallPrompt: () => void;
}

const InstallPromptContext = createContext<InstallPromptContextType | undefined>(undefined);

export const InstallPromptProvider = ({ children }: { children: ReactNode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevenir que el mini-infobar aparezca en móviles
      e.preventDefault();
      // Guardar el evento para que pueda ser disparado después.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log("'beforeinstallprompt' event was fired and captured.");
    };

    window.addEventListener('beforeinstallprompt', handler);
    console.log("Event listener for 'beforeinstallprompt' added.");

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      // Limpiar el deferredPrompt ya que no se puede usar de nuevo
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleAppInstalled);
      console.log("Event listener for 'beforeinstallprompt' and 'appinstalled' removed.");
    };
  }, []);

  const triggerInstallPrompt = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      // Esperar a que el usuario responda al prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        // El prompt solo se puede usar una vez, así que lo limpiamos
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <InstallPromptContext.Provider value={{ deferredPrompt, triggerInstallPrompt }}>
      {children}
    </InstallPromptContext.Provider>
  );
};

export const useInstallPrompt = () => {
  const context = useContext(InstallPromptContext);
  if (context === undefined) {
    throw new Error('useInstallPrompt must be used within an InstallPromptProvider');
  }
  return context;
};