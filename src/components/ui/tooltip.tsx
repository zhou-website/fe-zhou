"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextType | null>(null);

export interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

export interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: TooltipProps) {
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

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-flex">{children}</div>
    </TooltipContext.Provider>
  );
}

export interface TooltipTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const TooltipTrigger = React.forwardRef<
  HTMLButtonElement,
  TooltipTriggerProps
>(({ className, children, asChild = false, ...props }, ref) => {
  const context = React.useContext(TooltipContext);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

  const handleMouseEnter = () => {
    context?.setOpen(true);
  };

  const handleMouseLeave = () => {
    context?.setOpen(false);
  };

  const handleFocus = () => {
    context?.setOpen(true);
  };

  const handleBlur = () => {
    context?.setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      context?.setOpen(false);
    }
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onMouseEnter?: (e: React.MouseEvent) => void;
      onMouseLeave?: (e: React.MouseEvent) => void;
      onFocus?: (e: React.FocusEvent) => void;
      onBlur?: (e: React.FocusEvent) => void;
      onKeyDown?: (e: React.KeyboardEvent) => void;
      [key: string]: unknown;
    }>;

    return React.cloneElement(child, {
      onMouseEnter: (e: React.MouseEvent) => {
        child.props.onMouseEnter?.(e);
        handleMouseEnter();
      },
      onMouseLeave: (e: React.MouseEvent) => {
        child.props.onMouseLeave?.(e);
        handleMouseLeave();
      },
      onFocus: (e: React.FocusEvent) => {
        child.props.onFocus?.(e);
        handleFocus();
      },
      onBlur: (e: React.FocusEvent) => {
        child.props.onBlur?.(e);
        handleBlur();
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        child.props.onKeyDown?.(e);
        handleKeyDown(e);
      },
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn("inline-flex items-center", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </button>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  TooltipContentProps
>(({ className, side = "top", children, ...props }, ref) => {
  const context = React.useContext(TooltipContext);

  if (!context?.open) return null;

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      role="tooltip"
      ref={ref}
      className={cn(
        "absolute z-50 rounded-md bg-primary-dark px-3 py-1.5 text-xs text-white shadow-md border border-white/10 pointer-events-none whitespace-nowrap transition-all duration-150 animate-in fade-in-0 zoom-in-95",
        positionClasses[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TooltipContent.displayName = "TooltipContent";
