import toast from "react-hot-toast";

/**
 * Add swipe to dismiss functionality to toast elements
 */
export function initToastSwipe() {
  if (typeof window === "undefined") return;

  let touchStartX = 0;
  let touchStartY = 0;
  let currentToast: HTMLElement | null = null;
  let toastId: string | null = null;

  const handleTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    // Find the toast container (not the close button)
    const toastEl = target.closest('[id^="react-hot-toast"]') as HTMLElement;
    if (!toastEl || target.closest('button')) return;

    currentToast = toastEl;
    toastId = toastEl.id;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!currentToast) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.screenX - touchStartX;
    const deltaY = Math.abs(touch.screenY - touchStartY);

    // Only allow horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      e.preventDefault();
      e.stopPropagation();
      // Move toast horizontally
      currentToast.style.transform = `translateX(${deltaX}px)`;
      currentToast.style.opacity = `${Math.max(0, 1 - Math.abs(deltaX) / 200)}`;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!currentToast) return;

    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);

    // If swiped right more than 80px, dismiss the toast
    if (deltaX > 80 && Math.abs(deltaX) > deltaY) {
      // Use toast.dismiss() API
      if (toastId) {
        toast.dismiss(toastId);
      }
    } else {
      // Snap back
      currentToast.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      currentToast.style.transform = "translateX(0)";
      currentToast.style.opacity = "1";
      setTimeout(() => {
        if (currentToast) {
          currentToast.style.transition = "";
        }
      }, 300);
    }

    currentToast = null;
    toastId = null;
  };

  // Add event listeners to document with capture phase
  document.addEventListener("touchstart", handleTouchStart, { passive: false, capture: true });
  document.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
  document.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true });

  // Cleanup function
  return () => {
    document.removeEventListener("touchstart", handleTouchStart, { capture: true });
    document.removeEventListener("touchmove", handleTouchMove, { capture: true });
    document.removeEventListener("touchend", handleTouchEnd, { capture: true });
  };
}

