"use client";

import { useEffect } from "react";
import { initToastSwipe } from "@/utils/toastSwipe";

export function ToastSwipeInit() {
  useEffect(() => {
    const cleanup = initToastSwipe();
    return cleanup;
  }, []);

  return null;
}

