import {
  type ButtonHTMLAttributes,
  forwardRef,
} from "react";

import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type ButtonSize =
  | "sm"
  | "md"
  | "lg";

export type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
  };

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#241A1D] text-white shadow-lg shadow-black/10 hover:bg-[#3B292F]",

  secondary:
    "bg-[#B8899A] text-white shadow-lg shadow-[#B8899A]/20 hover:bg-[#A57587]",

  outline:
    "border border-[#241A1D]/15 bg-white text-[#241A1D] hover:bg-[#FFF4F3]",

  ghost:
    "bg-transparent text-[#241A1D] hover:bg-[#241A1D]/5",

  danger:
    "bg-red-600 text-white hover:bg-red-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8899A] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden="true"
          />

          <span>Chargement...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});
