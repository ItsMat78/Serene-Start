'use client';

import {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Download} from 'lucide-react';

export const InstallPWAButton = () => {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = () => {
    if (installEvent) {
      installEvent.prompt();
      installEvent.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallEvent(null);
      });
    }
  };

  if (!installEvent) {
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
