"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/icons";

interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | null>(null);

export interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  // Close on Escape key and lock body scroll
  React.useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  DialogTriggerProps
>(({ className, children, asChild = false, onClick, ...props }, ref) => {
  const context = React.useContext(DialogContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    context?.setOpen(true);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent<HTMLElement>) => void;
      [key: string]: unknown;
    }>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(e);
        context?.setOpen(true);
      },
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});
DialogTrigger.displayName = "DialogTrigger";

export function DialogPortal({ children }: { children: React.ReactNode }) {
  const context = React.useContext(DialogContext);
  if (!context?.open) return null;
  return <>{children}</>;
}

export const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(DialogContext);
  return (
    <div
      ref={ref}
      onClick={() => context?.setOpen(false)}
      className={cn(
        "fixed inset-0 z-50 bg-primary-dark/60 backdrop-blur-md transition-opacity duration-200 animate-in fade-in",
        className
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = "DialogOverlay";

export interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  hideCloseButton?: boolean;
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(({ className, children, hideCloseButton = false, ...props }, ref) => {
  const context = React.useContext(DialogContext);

  if (!context?.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <DialogOverlay />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-50 w-full max-w-lg rounded-lg border border-primary-light bg-white p-6 shadow-xl transition-all duration-200 animate-in fade-in zoom-in-95",
          className
        )}
        {...props}
      >
        {!hideCloseButton && (
          <button
            type="button"
            onClick={() => context?.setOpen(false)}
            className="absolute right-4 top-4 rounded-sm text-text-secondary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 p-1 cursor-pointer"
            aria-label="Tutup dialog"
          >
            <CloseIcon className="text-base" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
});
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-left mb-4", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-primary-light mt-6",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-modal-heading font-bold text-primary tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-modal-body text-text-secondary leading-relaxed",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export interface DialogCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DialogClose = React.forwardRef<
  HTMLButtonElement,
  DialogCloseProps
>(({ className, children, asChild = false, onClick, ...props }, ref) => {
  const context = React.useContext(DialogContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    context?.setOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent<HTMLElement>) => void;
      [key: string]: unknown;
    }>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(e);
        context?.setOpen(false);
      },
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});
DialogClose.displayName = "DialogClose";
