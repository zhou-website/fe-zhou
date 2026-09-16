import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/icons";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-primary-light bg-white px-3.5 py-2 pr-10 text-sm text-text transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-error focus-visible:border-error focus-visible:ring-error",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-secondary text-xs">
          <ChevronDownIcon />
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
