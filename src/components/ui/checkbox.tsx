import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/icons";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex items-start gap-2.5">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "peer h-4 w-4 shrink-0 appearance-none rounded border border-primary-light bg-white checked:bg-primary checked:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer",
              className
            )}
            {...props}
          />
          <CheckIcon className="pointer-events-none absolute text-[10px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {(label || description) && (
          <div className="grid gap-0.5 leading-none select-none">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  "text-sm font-medium text-text cursor-pointer",
                  disabled && "cursor-not-allowed opacity-70"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-text-secondary leading-normal">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
