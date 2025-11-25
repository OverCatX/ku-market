import toast from "react-hot-toast";

// Track recent toast messages to prevent duplicates
const recentToasts = new Map<string, number>();
const DEDUPE_WINDOW = 5000; // 5 seconds
const MAX_TOASTS_PER_SECOND = 1; // Max 1 toast per second globally
let toastTimestamps: number[] = [];

// Clean up old entries periodically (only in browser)
if (typeof window !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    // Clean up old toast timestamps
    toastTimestamps = toastTimestamps.filter(ts => now - ts < 1000);
    // Clean up old message dedupe entries
    for (const [message, timestamp] of recentToasts.entries()) {
      if (now - timestamp > DEDUPE_WINDOW) {
        recentToasts.delete(message);
      }
    }
  }, 500);
}

/**
 * Check if we can show a toast (rate limiting)
 */
function canShowToast(): boolean {
  const now = Date.now();
  // Remove timestamps older than 1 second
  toastTimestamps = toastTimestamps.filter(ts => now - ts < 1000);
  // Check if we've exceeded the rate limit
  if (toastTimestamps.length >= MAX_TOASTS_PER_SECOND) {
    return false;
  }
  // Add current timestamp
  toastTimestamps.push(now);
  return true;
}

/**
 * Show a success toast with deduplication
 */
export function showSuccess(message: string, options?: Parameters<typeof toast.success>[1]) {
  // Global rate limiting - max 2 toasts per second
  if (!canShowToast()) {
    return;
  }

  const key = `success:${message}`;
  const now = Date.now();
  const lastShown = recentToasts.get(key);

  // Prevent duplicate toasts within the dedupe window
  if (lastShown && now - lastShown < DEDUPE_WINDOW) {
    return;
  }

  recentToasts.set(key, now);
  return toast.success(message, options);
}

/**
 * Show an error toast with deduplication and rate limiting
 */
export function showError(message: string, options?: Parameters<typeof toast.error>[1]) {
  // Global rate limiting - max 2 toasts per second
  if (!canShowToast()) {
    return;
  }

  const key = `error:${message}`;
  const now = Date.now();
  const lastShown = recentToasts.get(key);

  // Prevent duplicate toasts within the dedupe window
  if (lastShown && now - lastShown < DEDUPE_WINDOW) {
    return;
  }

  recentToasts.set(key, now);
  return toast.error(message, options);
}

/**
 * Show a loading toast
 */
export function showLoading(message: string, options?: Parameters<typeof toast.loading>[1]) {
  return toast.loading(message, options);
}

/**
 * Show a regular toast with deduplication
 */
export function showToast(message: string, options?: Parameters<typeof toast>[1]) {
  // Global rate limiting - max 2 toasts per second
  if (!canShowToast()) {
    return;
  }

  const key = `toast:${message}`;
  const now = Date.now();
  const lastShown = recentToasts.get(key);

  // Prevent duplicate toasts within the dedupe window
  if (lastShown && now - lastShown < DEDUPE_WINDOW) {
    return;
  }

  recentToasts.set(key, now);
  return toast(message, options);
}

/**
 * Dismiss a toast
 */
export function dismissToast(toastId?: string) {
  return toast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAll() {
  return toast.dismiss();
}

// Re-export toast for advanced usage
export { toast };

