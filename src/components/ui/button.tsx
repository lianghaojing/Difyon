"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "./spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading = false, disabled, variant = "primary", className = "", ...props }, ref) => {
    const isDisabled = disabled || loading;

    const baseClasses =
      "inline-flex h-[42px] items-center justify-center rounded-[8px] px-5 text-sm font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-[#ecedf3] disabled:text-[#a6b0c4]";

    const variantClasses = {
      primary:
        "bg-[#f953c6] text-white hover:bg-[#ec3abb] focus-visible:outline-[#f953c6]",
      secondary:
        "bg-[#f4f5f8] text-[#1a1e26] hover:bg-[#ecedf3] focus-visible:outline-[#55637f]",
      outline:
        "border border-[#ecedf3] bg-white text-[#55637f] hover:bg-[#f9fafb] focus-visible:outline-[#55637f]",
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span className="sr-only">加载中</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
