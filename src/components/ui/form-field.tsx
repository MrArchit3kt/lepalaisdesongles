import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField({
  label,
  name,
  error,
  hint,
  required,
  icon,
  className,
  ...inputProps
}: FormFieldProps) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-[#33262A]"
      >
        {label}

        {required ? (
          <span className="ml-1 text-[#B8899A]">
            *
          </span>
        ) : null}
      </label>

      <div className="relative">
        {icon ? (
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#8A747C]">
            {icon}
          </div>
        ) : null}

        <input
          id={name}
          name={name}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? errorId
              : hint
                ? hintId
                : undefined
          }
          className={cn(
            "h-12 w-full rounded-2xl border bg-white px-4 text-sm text-[#241A1D]",
            "placeholder:text-[#9E8E93]",
            "transition focus:outline-none focus:ring-4",
            icon && "pl-11",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-[#241A1D]/12 focus:border-[#B8899A] focus:ring-[#B8899A]/12",
            className,
          )}
          {...inputProps}
        />
      </div>

      {error ? (
        <p
          id={errorId}
          className="text-sm text-red-600"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={hintId}
          className="text-xs text-[#7A6870]"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
