type ActionMessageProps = {
  error?: string;
  success?: string;
};

export function ActionMessage({ error, success }: ActionMessageProps) {
  if (!error && !success) return null;

  return (
    <div
      className={`rounded-[8px] border p-3 text-sm ${
        error
          ? "border-[#ffd5ec] bg-[#fff8fb] text-[#ff4337]"
          : "border-[#d8f1e4] bg-[#f4fbf7] text-[#247a4d]"
      }`}
      role="status"
      aria-live="polite"
    >
      {error || success}
    </div>
  );
}
