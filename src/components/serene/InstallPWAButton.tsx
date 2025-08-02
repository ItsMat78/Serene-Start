'use client';

import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export const InstallPWAButton = () => {
  const { installPrompt, triggerInstall } = usePWAInstall();

  if (!installPrompt) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={triggerInstall}
      title="Install App"
    >
      <Download className="h-5 w-5" />
    </Button>
  );
};
