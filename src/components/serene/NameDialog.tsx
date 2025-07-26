
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

// Ugly patch but it will do for now
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideCloseButton?: boolean }
>(({ className, children, hideCloseButton, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
        className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        )}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {!hideCloseButton && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName;
