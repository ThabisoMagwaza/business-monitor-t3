'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault?.();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handler as EventListener
      );
    };
  }, []);

  const onInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    try {
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } catch {}
  };

  if (!isInstallable) return null;

  return (
    <Button size="sm" variant="default" onClick={onInstallClick}>
      Install app
    </Button>
  );
}
