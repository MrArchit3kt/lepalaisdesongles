import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  priceCents: number,
  locale = "fr-FR",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(priceCents / 100);
}

export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
): string {
  return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`
    .toUpperCase()
    .trim();
}
