import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex items-start gap-2.5">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="radio"
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "peer h-4 w-4 shrink-0 appearance-none rounded-full border border-primary-light bg-white checked:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer",
              className
            )}
            {...props}
          />
          <span className="pointer-events-none absolute h-2 w-2 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
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
Radio.displayName = "Radio";

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface RadioGroupContextType {
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextType>({});

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      name,
      value,
      defaultValue,
      onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    const [currentValue, setCurrentValue] = React.useState(defaultValue || "");
    const isControlled = value !== undefined;
    const activeValue = isControlled ? value : currentValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setCurrentValue(e.target.value);
      }
      onValueChange?.(e.target.value);
    };

    return (
      <RadioGroupContext.Provider
        value={{ name, value: activeValue, onChange: handleChange }}
      >
        <div
          ref={ref}
          role="radiogroup"
          className={cn("grid gap-3", className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

export type RadioGroupItemProps = RadioProps;

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ name, onChange, checked, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const isChecked =
      checked !== undefined ? checked : context.value === value;

    return (
      <Radio
        ref={ref}
        name={name || context.name}
        value={value}
        checked={isChecked}
        onChange={(e) => {
          onChange?.(e);
          context.onChange?.(e);
        }}
        {...props}
      />
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { Radio, RadioGroup, RadioGroupItem };
