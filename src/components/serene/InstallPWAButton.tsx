'use client';

import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Download} from 'lucide-react';

// A global variable to hold the install prompt event
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export const InstallPWAButton = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt = event as BeforeInstallPromptEvent;
      // The event is now saved. We can show the button.
      setIsReady(true);
    };

    // Listen for the install prompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also, check if the app is already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // Don't show the button if the app is already installed.
      setIsReady(false);
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        // We can only use the prompt once.
        deferredPrompt = null;
        // Hide the button after prompting.
        setIsReady(false);
      });
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleInstallClick}
      title="Install App"
    >
      <Download className="h-5 w-5" />
    </Button>
  );
};

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
