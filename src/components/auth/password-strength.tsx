"use client";

import { type PasswordStrength as PasswordStrengthLevel } from "@/lib/validations";

interface PasswordStrengthProps {
  strength: PasswordStrengthLevel;
}

const strengthConfig: Record<
  PasswordStrengthLevel,
  { label: string; bars: number; color: string }
> = {
  weak: { label: "弱", bars: 1, color: "bg-red-500" },
  medium: { label: "中", bars: 2, color: "bg-yellow-500" },
  strong: { label: "强", bars: 3, color: "bg-blue-500" },
  "very-strong": { label: "非常强", bars: 4, color: "bg-green-500" },
};

export function PasswordStrength({ strength }: PasswordStrengthProps) {
  const config = strengthConfig[strength];

  return (
    <div className="space-y-1" aria-label={`密码强度: ${config.label}`}>
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < config.bars ? config.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        密码强度: <span className="font-medium">{config.label}</span>
      </p>
    </div>
  );
}
