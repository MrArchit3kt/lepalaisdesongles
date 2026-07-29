import {
  BadgeEuro,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Gift,
  History,
  Mail,
  MessageSquareText,
  UserRound,
  WalletCards,
} from "lucide-react";

import { AdminGiftCardActions } from "@/features/admin/gift-cards/components/admin-gift-card-actions";

import { GiftCardStatusBadge } from "@/features/admin/gift-cards/components/gift-card-status-badge";

import type {
  AdminGiftCardDetails,
  AdminGiftCardTransaction,
} from "@/features/admin/gift-cards/types/admin-gift-card.types";

const TRANSACTION_LABELS: Record<AdminGiftCardTransaction["type"], string> = {
  CREATED: "Carte créée",
  PAYMENT_CONFIRMED: "Paiement confirmé",
  PAYMENT_FAILED: "Paiement échoué",
  REDEMPTION: "Utilisation en magasin",
  REDEMPTION_REVERSAL: "Annulation d’utilisation",
  CANCELLED: "Carte annulée",
  REVOKED: "Carte révoquée",
  REACTIVATED: "Carte réactivée",
  EXPIRED: "Carte expirée",
  EMAIL_SENT: "E-mail envoyé",
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Non renseigné";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getTransactionAmountPrefix(
  type: AdminGiftCardTransaction["type"],
): string {
  if (type === "REDEMPTION") {
    return "-";
  }

  if (type === "REDEMPTION_REVERSAL") {
    return "+";
  }

  return "";
}

export function AdminGiftCardDetailsView({
  giftCard,
}: {
  giftCard: AdminGiftCardDetails;
}) {
  const usagePercentage =
    giftCard.initialAmountCents > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              (giftCard.usedAmountCents / giftCard.initialAmountCents) * 100,
            ),
          ),
        )
      : 0;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Valeur initiale"
          value={formatCurrency(giftCard.initialAmountCents)}
          icon={<CircleDollarSign className="size-5" />}
        />

        <MetricCard
          label="Solde disponible"
          value={formatCurrency(giftCard.balanceCents)}
          icon={<WalletCards className="size-5" />}
        />

        <MetricCard
          label="Montant utilisé"
          value={formatCurrency(giftCard.usedAmountCents)}
          icon={<BadgeEuro className="size-5" />}
        />

        <MetricCard
          label="Utilisation"
          value={`${usagePercentage} %`}
          icon={<CheckCircle2 className="size-5" />}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.75fr)]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
                  Carte cadeau
                </p>

                <h2 className="mt-2 font-mono text-xl font-black text-zinc-950 sm:text-2xl">
                  {giftCard.code}
                </h2>

                <p className="mt-2 font-mono text-xs text-zinc-500">
                  {giftCard.reference}
                </p>
              </div>

              <GiftCardStatusBadge
                status={giftCard.status}
                className="self-start"
              />
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-zinc-500">
                <span>Solde consommé</span>
                <span>
                  {formatCurrency(giftCard.usedAmountCents)} sur{" "}
                  {formatCurrency(giftCard.initialAmountCents)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
                  style={{
                    width: `${usagePercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <PersonCard
                title="Acheteur"
                name={`${giftCard.purchaserFirstName} ${giftCard.purchaserLastName}`}
                email={giftCard.purchaserEmail}
              />

              <PersonCard
                title="Bénéficiaire"
                name={`${giftCard.recipientFirstName} ${giftCard.recipientLastName}`}
                email={giftCard.recipientEmail}
              />
            </div>

            {giftCard.personalMessage ? (
              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-700">
                  <MessageSquareText className="size-4" />
                  Message personnel
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                  {giftCard.personalMessage}
                </p>
              </div>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
            <header className="border-b border-zinc-100 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                  <History className="size-5" />
                </span>

                <div>
                  <h2 className="text-xl font-black text-zinc-950">
                    Historique
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {giftCard.transactions.length} mouvement
                    {giftCard.transactions.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </header>

            {giftCard.transactions.length === 0 ? (
              <p className="p-6 text-sm text-zinc-500">
                Aucun mouvement enregistré.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100">
                {giftCard.transactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <AdminGiftCardActions
            reference={giftCard.reference}
            status={giftCard.status}
            balanceCents={giftCard.balanceCents}
            redemptions={giftCard.transactions
              .filter((transaction) => transaction.type === "REDEMPTION")
              .map((transaction) => ({
                id: transaction.id,
                amountCents: transaction.amountCents,
                createdAt: transaction.createdAt,
                reversedAt: transaction.reversedAt,
              }))}
          />

          <InfoSection
            title="Dates importantes"
            icon={<CalendarClock className="size-5" />}
          >
            <InfoRow
              label="Création"
              value={formatDateTime(giftCard.createdAt)}
            />
            <InfoRow label="Paiement" value={formatDateTime(giftCard.paidAt)} />
            <InfoRow
              label="Activation"
              value={formatDateTime(giftCard.activatedAt)}
            />
            <InfoRow
              label="Expiration"
              value={formatDateTime(giftCard.expiresAt)}
            />
            <InfoRow
              label="Utilisation complète"
              value={formatDateTime(giftCard.fullyUsedAt)}
            />
            <InfoRow
              label="Dernière modification"
              value={formatDateTime(giftCard.updatedAt)}
            />
          </InfoSection>

          <InfoSection
            title="Informations PayPal"
            icon={<CreditCard className="size-5" />}
          >
            <CodeRow label="Commande" value={giftCard.paypalOrderId} />
            <CodeRow label="Capture" value={giftCard.paypalCaptureId} />
            <CodeRow label="Payeur" value={giftCard.paypalPayerId} />
          </InfoSection>

          {giftCard.cancellationReason || giftCard.revocationReason ? (
            <InfoSection
              title="Motifs administratifs"
              icon={<Gift className="size-5" />}
            >
              {giftCard.cancellationReason ? (
                <InfoRow
                  label="Annulation"
                  value={giftCard.cancellationReason}
                />
              ) : null}

              {giftCard.revocationReason ? (
                <InfoRow label="Révocation" value={giftCard.revocationReason} />
              ) : null}
            </InfoSection>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-zinc-950">
            {value}
          </p>
        </div>

        <span className="grid size-11 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          {icon}
        </span>
      </div>
    </article>
  );
}

function PersonCard({
  title,
  name,
  email,
}: {
  title: string;
  name: string;
  email: string | null;
}) {
  return (
    <article className="rounded-2xl bg-zinc-50 p-4">
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-rose-600 shadow-sm">
          <UserRound className="size-4" />
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            {title}
          </p>
          <p className="mt-1 font-black text-zinc-900">{name}</p>

          {email ? (
            <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-zinc-500">
              <Mail className="size-3.5 shrink-0" />
              {email}
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-400">Aucun e-mail</p>
          )}
        </div>
      </div>
    </article>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: AdminGiftCardTransaction;
}) {
  const amountPrefix = getTransactionAmountPrefix(transaction.type);

  return (
    <article className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-zinc-950">
              {TRANSACTION_LABELS[transaction.type]}
            </h3>

            {transaction.reversedAt ? (
              <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-orange-700">
                Annulée
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-xs text-zinc-500">
            {formatDateTime(transaction.createdAt)}
            {transaction.actorName
              ? ` · ${transaction.actorName}`
              : " · Système"}
          </p>

          {transaction.note ? (
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              {transaction.note}
            </p>
          ) : null}

          {transaction.reason ? (
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Motif : {transaction.reason}
            </p>
          ) : null}

          {transaction.reversalReason ? (
            <p className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-xs leading-5 text-orange-800">
              Annulé le {formatDateTime(transaction.reversedAt)}
              {transaction.reversedByName
                ? ` par ${transaction.reversedByName}`
                : ""}
              {" — "}
              {transaction.reversalReason}
            </p>
          ) : null}

          {transaction.paypalOrderId || transaction.paypalCaptureId ? (
            <div className="mt-3 space-y-1 font-mono text-[11px] text-zinc-400">
              {transaction.paypalOrderId ? (
                <p className="break-all">
                  Commande : {transaction.paypalOrderId}
                </p>
              ) : null}

              {transaction.paypalCaptureId ? (
                <p className="break-all">
                  Capture : {transaction.paypalCaptureId}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 text-left sm:text-right">
          {transaction.amountCents > 0 ? (
            <p className="text-lg font-black text-zinc-950">
              {amountPrefix}
              {formatCurrency(transaction.amountCents)}
            </p>
          ) : (
            <p className="text-sm font-bold text-zinc-400">Aucun mouvement</p>
          )}

          <p className="mt-1 text-xs text-zinc-500">
            {formatCurrency(transaction.balanceBeforeCents)} →{" "}
            {formatCurrency(transaction.balanceAfterCents)}
          </p>
        </div>
      </div>
    </article>
  );
}

function InfoSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex items-center gap-3 border-b border-zinc-100 pb-4">
        <span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-600">
          {icon}
        </span>
        <h2 className="font-black text-zinc-950">{title}</h2>
      </header>

      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold leading-6 text-zinc-700">
        {value}
      </p>
    </div>
  );
}

function CodeRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className="mt-1 break-all font-mono text-xs leading-5 text-zinc-700">
        {value ?? "Non renseigné"}
      </p>
    </div>
  );
}
