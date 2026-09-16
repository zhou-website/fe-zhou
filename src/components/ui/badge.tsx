import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white",
        secondary: "bg-primary-light text-primary",
        silver: "bg-silver/25 text-text border border-silver/50",
        success: "bg-success/15 text-success border border-success/30",
        error: "bg-error/15 text-error border border-error/30",
        outline: "border border-silver text-text-secondary bg-transparent",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs leading-[18px]",
        sm: "px-2 py-0.25 text-[11px] leading-[16px]",
        lg: "px-3 py-1 text-xs leading-[18px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "mr-1.5 h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "error" && "bg-error",
            variant === "primary" && "bg-white",
            variant === "secondary" && "bg-primary",
            variant === "silver" && "bg-primary",
            variant === "outline" && "bg-text-secondary"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };

