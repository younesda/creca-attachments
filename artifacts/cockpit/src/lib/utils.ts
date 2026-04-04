import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un montant en euros avec 2 décimales si nécessaire.
 * Les montants sont en euros (ex: 1500.50 → "1 500,50 €").
 * Les centimes entiers s'affichent sans décimales (ex: 1500 → "1 500 €").
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
