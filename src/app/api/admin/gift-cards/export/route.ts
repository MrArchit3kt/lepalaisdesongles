import type { NextRequest } from "next/server";

import {
  ADMIN_GIFT_CARD_CSV_EXPORT_LIMIT,
  getAdminGiftCardsCsvExport,
  parseAdminGiftCardQuery,
} from "@/features/admin/gift-cards/services/admin-gift-card.service";

import { requireAdminUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CSV_HEADERS = [
  "Référence",
  "Code",
  "Statut",
  "Montant initial",
  "Solde restant",
  "Montant utilisé",
  "Devise",
  "Acheteur",
  "E-mail acheteur",
  "Bénéficiaire",
  "E-mail bénéficiaire",
  "Payée le",
  "Expire le",
  "Créée le",
] as const;

function escapeCsvCell(value: string | number | null): string {
  if (value === null) {
    return "";
  }

  let normalized = String(value).replace(/\r?\n/g, " ").trim();

  if (/^[=+\-@]/.test(normalized)) {
    normalized = `'${normalized}`;
  }

  return `"${normalized.replaceAll('"', '""')}"`;
}

function formatMoneyForCsv(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(cents / 100);
}

function formatDateForCsv(date: Date | null): string {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function createFilename(): string {
  const date = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return `cartes-cadeaux-${date}.csv`;
}

export async function GET(request: NextRequest): Promise<Response> {
  await requireAdminUser();

  const searchParamsRecord = Object.fromEntries(
    request.nextUrl.searchParams.entries(),
  );

  const query = parseAdminGiftCardQuery(searchParamsRecord);
  const exportData = await getAdminGiftCardsCsvExport(query);

  const lines = [
    CSV_HEADERS.map(escapeCsvCell).join(";"),

    ...exportData.rows.map((giftCard) =>
      [
        giftCard.reference,
        giftCard.code,
        giftCard.status,
        formatMoneyForCsv(giftCard.initialAmountCents),
        formatMoneyForCsv(giftCard.balanceCents),
        formatMoneyForCsv(giftCard.usedAmountCents),
        giftCard.currency,
        giftCard.purchaserFullName,
        giftCard.purchaserEmail,
        giftCard.recipientFullName,
        giftCard.recipientEmail,
        formatDateForCsv(giftCard.paidAt),
        formatDateForCsv(giftCard.expiresAt),
        formatDateForCsv(giftCard.createdAt),
      ]
        .map(escapeCsvCell)
        .join(";"),
    ),
  ];

  const csv = `\uFEFF${lines.join("\r\n")}`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${createFilename()}"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "X-Export-Total": String(exportData.totalItems),
      "X-Export-Limit": String(ADMIN_GIFT_CARD_CSV_EXPORT_LIMIT),
      "X-Export-Truncated": String(exportData.truncated),
    },
  });
}
