import type { GiftCardStatus } from "@/generated/prisma/client";

import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<GiftCardStatus, string> = {
  PENDING_PAYMENT: "Paiement en attente",

  ACTIVE: "Active",

  PARTIALLY_USED: "Partiellement utilisée",

  USED: "Utilisée",

  CANCELLED: "Annulée",

  REVOKED: "Révoquée",

  EXPIRED: "Expirée",

  PAYMENT_FAILED: "Paiement échoué",
};

const STATUS_CLASSES: Record<GiftCardStatus, string> = {
  PENDING_PAYMENT: "border-amber-200 bg-amber-50 text-amber-700",

  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",

  PARTIALLY_USED: "border-blue-200 bg-blue-50 text-blue-700",

  USED: "border-zinc-200 bg-zinc-100 text-zinc-700",

  CANCELLED: "border-orange-200 bg-orange-50 text-orange-700",

  REVOKED: "border-red-200 bg-red-50 text-red-700",

  EXPIRED: "border-slate-200 bg-slate-100 text-slate-700",

  PAYMENT_FAILED: "border-rose-200 bg-rose-50 text-rose-700",
};

export function GiftCardStatusBadge({
  status,
  className,
}: {
  status: GiftCardStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black",
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
