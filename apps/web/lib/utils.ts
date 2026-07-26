import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  console.assert(
    normalizeAssetUrl("http://localhost:5000/uploads/a.png") ===
      "http://localhost:5000/uploads/a.png",
    "Asset URL test failed for absolute HTTP URL"
  );
  console.assert(
    normalizeAssetUrl("uploads/proker/a.jpg") === "/uploads/proker/a.jpg",
    "Asset URL test failed for relative path without leading slash"
  );
  console.assert(
    normalizeAssetUrl("/uploads/proker/a.jpg") === "/uploads/proker/a.jpg",
    "Asset URL test failed for relative path with leading slash"
  );
}
