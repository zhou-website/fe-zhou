import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold leading-[18px] transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
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
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
