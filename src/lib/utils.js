import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { apiClient } from "./api";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

/**
 * Fetcher function compatible with React Query
 * This now uses the apiClient consistently
 */
export const fetcher = async (url, options = {}) => {
  try {
    // Use the apiClient for consistent handling
    return await apiClient.get(url, options);
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error(error.message || "Failed to fetch data");
  }
};

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}