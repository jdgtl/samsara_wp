import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate days until credit card expiration
 * @param {number} expMonth - Expiration month (1-12)
 * @param {number} expYear - Expiration year (YYYY)
 * @returns {number} Days until expiration
 */
export const getDaysUntilExpiration = (expMonth, expYear) => {
  const now = new Date();
  const expDate = new Date(expYear, expMonth - 1);
  const diffTime = expDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
