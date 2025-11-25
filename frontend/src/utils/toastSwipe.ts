/**
 * Add swipe to dismiss functionality to toast elements
 */
export function initToastSwipe() {
  if (typeof window === "undefined") return;

  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let currentToast: HTMLElement | null = null;

  const handleTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    // Find the toast container (not the close button)
    const toast = target.closest('[id^="react-hot-toast"]') as HTMLElement;
    if (!toast || target.closest('button')) return;

    currentToast = toast;
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
      // Move toast horizontally
      currentToast.style.transform = `translateX(${deltaX}px)`;
      currentToast.style.opacity = `${1 - Math.abs(deltaX) / 200}`;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!currentToast) return;

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);

    // If swiped right more than 100px, dismiss the toast
    if (deltaX > 100 && Math.abs(deltaX) > deltaY) {
      // Animate out
      currentToast.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      currentToast.style.transform = "translateX(100%)";
      currentToast.style.opacity = "0";

      // Remove after animation
      setTimeout(() => {
        if (currentToast) {
          currentToast.remove();
        }
      }, 300);
    } else {
      // Snap back
      currentToast.style.transition = "transform 0.3s ease, opacity 0.3s ease";
      currentToast.style.transform = "translateX(0)";
      currentToast.style.opacity = "1";
    }

    currentToast = null;
  };

  // Add event listeners to document
  document.addEventListener("touchstart", handleTouchStart, { passive: false });
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });

  // Cleanup function
  return () => {
    document.removeEventListener("touchstart", handleTouchStart);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  };
}

