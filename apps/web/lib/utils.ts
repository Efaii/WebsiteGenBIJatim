import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes asset URLs from the backend.
 * Correctly handles NEXT_PUBLIC_API_URL by stripping /api for static access.
 */
export function getAssetUrl(path: string | undefined | null) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  
  // Local public assets should be returned as is
  if (path.startsWith("/assets") || path.startsWith("/favicon.ico") || path.startsWith("/next.svg")) {
    return path;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const cleanBase = baseUrl.replace(/\/api$/, "");
  
  return `${cleanBase}${path.startsWith("/") ? "" : "/"}${path}`;
}
