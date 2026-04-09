import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetPortal = SheetPrimitive.Portal;

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-opacity duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

type SheetSide = 'top' | 'bottom' | 'left' | 'right';

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & { side?: SheetSide }
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 bg-white shadow-2xl outline-none transition-transform duration-300 will-change-transform',
        side === 'right' &&
          'inset-y-0 right-0 h-full w-full max-w-md border-l border-slate-100 translate-x-full data-[state=open]:translate-x-0',
        side === 'left' &&
          'inset-y-0 left-0 h-full w-full max-w-md border-r border-slate-100 -translate-x-full data-[state=open]:translate-x-0',
        side === 'top' &&
          'inset-x-0 top-0 w-full border-b border-slate-100 -translate-y-full data-[state=open]:translate-y-0',
        side === 'bottom' &&
          'inset-x-0 bottom-0 w-full border-t border-slate-100 translate-y-full data-[state=open]:translate-y-0',
        className,
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close
        className="absolute left-4 top-4 rounded-xl bg-slate-50 p-2 text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        aria-label="إغلاق"
      >
        <X size={18} />
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 border-b border-slate-100 p-4 sm:p-8', className)} {...props} />
);

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn('text-xl sm:text-2xl font-black', className)} {...props} />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
