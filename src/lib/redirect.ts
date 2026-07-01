const DEFAULT_CALLBACK_URL = "/";

export function sanitizeCallbackUrl(callbackUrl?: string | null): string {
  if (!callbackUrl) return DEFAULT_CALLBACK_URL;

  const value = callbackUrl.trim();
  if (!value) return DEFAULT_CALLBACK_URL;

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(value)
  ) {
    return DEFAULT_CALLBACK_URL;
  }

  return value;
}
