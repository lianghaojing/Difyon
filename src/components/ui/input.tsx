"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, success, className = "", ...props }, ref) => {
    const baseClasses =
      "block h-12 w-full rounded-[8px] border bg-white px-4 text-sm font-medium text-[#1a1e26] transition-colors placeholder:text-[#a6b0c4] focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

    const stateClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
      : success
        ? "border-green-500 focus:border-green-500 focus:ring-green-200"
        : "border-[#ecedf3] focus:border-[#f953c6] focus:ring-[#f953c6]/20";

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${stateClasses} ${className}`}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
