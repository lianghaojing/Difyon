"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, success, className = "", ...props }, ref) => {
    const baseClasses =
      "block w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

    const stateClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
      : success
        ? "border-green-500 focus:border-green-500 focus:ring-green-200"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200";

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
