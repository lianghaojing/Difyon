type ActionMessageProps = {
  error?: string;
  success?: string;
};

export function ActionMessage({ error, success }: ActionMessageProps) {
  if (!error && !success) return null;

  return (
    <div
      className={`rounded-md p-3 text-sm ${
        error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
      }`}
      role="status"
      aria-live="polite"
    >
      {error || success}
    </div>
  );
}

