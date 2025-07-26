
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

type NameDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NameDialog({ open, onOpenChange }: NameDialogProps) {
  const { name, setName } = useTheme();
  const [localName, setLocalName] = useState('');
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  const handleSave = () => {
    if (localName.trim()) {
      setName(localName.trim());
      onOpenChange(false);
    }
  };

  // Track if the dialog has been opened to prevent animation on subsequent re-renders
  if (open && !hasBeenOpened) {
    setHasBeenOpened(true);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
            "sm:max-w-[425px]",
            // Prevent closing by clicking outside
            "data-[state=open]:pointer-events-auto"
        )}
        onInteractOutside={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle>Welcome to Serene Start!</DialogTitle>
          <DialogDescription>
            What should I call you? This will be used to personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            id="name"
            placeholder="Enter your name..."
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    handleSave();
                }
            }}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Save Name
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add hideCloseButton prop to DialogContent
declare module '@radix-ui/react-dialog' {
    interface DialogContentProps {
        hideCloseButton?: boolean;
    }
}
