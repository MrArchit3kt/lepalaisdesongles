export const FIXED_DEPOSIT_CENTS = 3_500;
export const CANCELLATION_NOTICE_HOURS = 48;

/**
 * Règle de paiement :
 * - prestation jusqu'à 35 € : paiement intégral ;
 * - prestation au-dessus de 35 € : acompte fixe de 35 €.
 */
export function calculateRequiredDepositCents(
  totalPriceCents: number,
): number {
  if (
    !Number.isInteger(totalPriceCents) ||
    totalPriceCents < 0
  ) {
    throw new Error(
      "Le montant total de la prestation est invalide.",
    );
  }

  return Math.min(
    totalPriceCents,
    FIXED_DEPOSIT_CENTS,
  );
}

export function isFullPaymentRequired(
  totalPriceCents: number,
): boolean {
  return (
    totalPriceCents > 0 &&
    totalPriceCents <= FIXED_DEPOSIT_CENTS
  );
}
