export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

/**
 * App Configuration
 */
export const APP_NAME = "KU Market";
export const APP_DESCRIPTION = "Marketplace for KU Students";

/**
 * Pagination
 */
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

/**
 * File Upload Limits
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

