import toast from "react-hot-toast";

// Track recent toast messages to prevent duplicates
const recentToasts = new Map<string, number>();
const DEDUPE_WINDOW = 5000; // 5 seconds
const MAX_TOASTS_PER_SECOND = 1; // Max 1 toast per second globally
let toastTimestamps: number[] = [];
let activeToastIds: string[] = [];
const MAX_ACTIVE_TOASTS = 3;

// Clean up old entries periodically (only in browser) - use requestAnimationFrame for better performance
if (typeof window !== "undefined") {
  let lastCleanup = 0;
  const CLEANUP_INTERVAL = 1000; // Clean up every 1 second

  const cleanup = (now: number) => {
    if (now - lastCleanup < CLEANUP_INTERVAL) {
      requestAnimationFrame(cleanup);
      return;
    }
    lastCleanup = now;

    // Clean up old toast timestamps
    toastTimestamps = toastTimestamps.filter(ts => now - ts < 1000);
    
    // Clean up old message dedupe entries
    for (const [message, timestamp] of recentToasts.entries()) {
      if (now - timestamp > DEDUPE_WINDOW) {
        recentToasts.delete(message);
      }
    }

    // Auto-dismiss oldest toast if we exceed limit
    if (activeToastIds.length > MAX_ACTIVE_TOASTS) {
      const oldestId = activeToastIds.shift();
      if (oldestId) {
        toast.dismiss(oldestId);
      }
    }

    requestAnimationFrame(cleanup);
  };

  requestAnimationFrame(cleanup);
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
 * Show a success toast with deduplication and resource optimization
 */
export function showSuccess(message: string, options?: Parameters<typeof toast.success>[1]) {
  // Global rate limiting - max 1 toast per second
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

  // Auto-dismiss oldest toast if we're at limit
  if (activeToastIds.length >= MAX_ACTIVE_TOASTS) {
    const oldestId = activeToastIds.shift();
    if (oldestId) {
      toast.dismiss(oldestId);
    }
  }

  recentToasts.set(key, now);
  const toastId = toast.success(message, {
    ...options,
    duration: options?.duration || 2000,
    closeButton: true,
  });
  
  if (toastId) {
    activeToastIds.push(toastId);
    // Auto-remove from active list after duration
    setTimeout(() => {
      activeToastIds = activeToastIds.filter(id => id !== toastId);
    }, options?.duration || 2000);
  }
  
  return toastId;
}

/**
 * Show an error toast with deduplication and rate limiting
 */
export function showError(message: string, options?: Parameters<typeof toast.error>[1]) {
  // Global rate limiting - max 1 toast per second
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

  // Auto-dismiss oldest toast if we're at limit
  if (activeToastIds.length >= MAX_ACTIVE_TOASTS) {
    const oldestId = activeToastIds.shift();
    if (oldestId) {
      toast.dismiss(oldestId);
    }
  }

  recentToasts.set(key, now);
  const toastId = toast.error(message, {
    ...options,
    duration: options?.duration || 2000,
    closeButton: true,
  });
  
  if (toastId) {
    activeToastIds.push(toastId);
    // Auto-remove from active list after duration
    setTimeout(() => {
      activeToastIds = activeToastIds.filter(id => id !== toastId);
    }, options?.duration || 2000);
  }
  
  return toastId;
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
  // Global rate limiting - max 1 toast per second
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

  // Auto-dismiss oldest toast if we're at limit
  if (activeToastIds.length >= MAX_ACTIVE_TOASTS) {
    const oldestId = activeToastIds.shift();
    if (oldestId) {
      toast.dismiss(oldestId);
    }
  }

  recentToasts.set(key, now);
  const toastId = toast(message, {
    ...options,
    duration: options?.duration || 2000,
    closeButton: true,
  });
  
  if (toastId) {
    activeToastIds.push(toastId);
    // Auto-remove from active list after duration
    setTimeout(() => {
      activeToastIds = activeToastIds.filter(id => id !== toastId);
    }, options?.duration || 2000);
  }
  
  return toastId;
}

/**
 * Dismiss a toast
 */
export function dismissToast(toastId?: string) {
  if (toastId) {
    activeToastIds = activeToastIds.filter(id => id !== toastId);
  }
  return toast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAll() {
  activeToastIds = [];
  return toast.dismiss();
}

// Re-export toast for advanced usage
export { toast };

