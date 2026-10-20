"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, CheckIcon } from "@/components/icons";

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  options?: SelectOption[];
  children?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onChange,
      options: directOptions,
      children,
      className,
      triggerClassName,
      contentClassName,
      itemClassName,
      placeholder,
      disabled,
      error,
      name,
      id,
      required,
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(
      defaultValue !== undefined ? String(defaultValue) : ""
    );
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? String(controlledValue) : uncontrolledValue;

    // Parse options from direct props or option children
    const parsedOptions = React.useMemo<SelectOption[]>(() => {
      if (directOptions && directOptions.length > 0) {
        return directOptions;
      }
      const extracted: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (!child || !React.isValidElement(child)) return;
        if (child.type === "option") {
          const val =
            child.props.value !== undefined
              ? String(child.props.value)
              : String(child.props.children || "");
          extracted.push({
            value: val,
            label: child.props.children || val,
            disabled: child.props.disabled,
          });
        } else if (child.type === "optgroup" && child.props.children) {
          React.Children.forEach(child.props.children, (subChild) => {
            if (
              React.isValidElement<{ value?: unknown; children?: React.ReactNode; disabled?: boolean }>(subChild) &&
              subChild.type === "option"
            ) {
              const val =
                subChild.props.value !== undefined
                  ? String(subChild.props.value)
                  : String(subChild.props.children || "");
              extracted.push({
                value: val,
                label: subChild.props.children || val,
                disabled: subChild.props.disabled,
              });
            }
          });
        }
      });
      return extracted;
    }, [directOptions, children]);

    // Outside click & Escape key handler
    React.useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      if (disabled) return;
      if (!isControlled) {
        setUncontrolledValue(optionValue);
      }
      if (onChange) {
        onChange({
          target: {
            value: optionValue,
            name: name,
          },
        });
      }
      setIsOpen(false);
    };

    const selectedOption = parsedOptions.find(
      (opt) => String(opt.value) === String(currentValue)
    );

    const displayLabel = selectedOption
      ? selectedOption.label
      : placeholder || (parsedOptions[0]?.label ?? "Pilih opsi");

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        className={cn("relative w-full", className)}
      >
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2.5 rounded-xl border border-primary-light bg-surface px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-white focus:bg-white focus:outline-none shadow-2xs disabled:cursor-not-allowed disabled:opacity-50 text-left",
            error && "border-error focus-visible:border-error",
            triggerClassName
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDownIcon
            className={cn(
              "text-[10px] text-text-muted transition-transform duration-200 shrink-0",
              isOpen && "rotate-180 text-primary"
            )}
          />
        </button>

        {/* Hidden input for standard form serialization */}
        <input
          type="hidden"
          name={name}
          value={currentValue}
          required={required}
        />

        {isOpen && (
          <div
            role="listbox"
            className={cn(
              "absolute top-full left-0 mt-1.5 w-full min-w-[160px] max-h-60 overflow-y-auto rounded-xl bg-white border border-primary-light py-1.5 px-1.5 shadow-xl text-text-primary z-50 animate-in fade-in slide-in-from-top-1 duration-150",
              contentClassName
            )}
          >
            <div className="space-y-0.5">
              {parsedOptions.map((opt) => {
                const isSelected = String(currentValue) === String(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-text-primary hover:text-primary hover:bg-surface",
                      itemClassName
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <CheckIcon className="text-primary text-[10px] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
