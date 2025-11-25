"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Fix close button functionality for toast
 */
export function ToastCloseFix() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Find close button
      const button = target.closest('button');
      if (!button) return;

      // Check if it's a toast close button
      const toastEl = button.closest('[id^="react-hot-toast"]');
      if (!toastEl) return;

      // Get toast ID from the element
      const toastId = toastEl.id;
      if (toastId) {
        e.preventDefault();
        e.stopPropagation();
        toast.dismiss(toastId);
      }
    };

    // Use capture phase to ensure we catch the event
    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  return null;
}

