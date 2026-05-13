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
      "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    const variantClasses = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600",
      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:outline-gray-500",
      outline:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-gray-500",
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
