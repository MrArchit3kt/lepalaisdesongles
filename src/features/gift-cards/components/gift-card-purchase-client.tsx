"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  CreditCard,
  Gift,
  Heart,
  Mail,
  MessageSquare,
  Sparkles,
  User,
} from "lucide-react";

import { GiftCardPayPalCheckout } from "@/features/gift-cards/components/gift-card-paypal-checkout";

import { giftCardPublicFormSchema } from "@/features/gift-cards/schemas/gift-card.schemas";

import { cn } from "@/lib/utils";

type GiftCardFormInput = z.input<typeof giftCardPublicFormSchema>;

type GiftCardFormValues = z.output<typeof giftCardPublicFormSchema>;
const PREDEFINED_AMOUNTS = [25, 50, 75, 100, 150, 200] as const;

type CheckoutResponse = {
  success: boolean;
  giftCardId?: string;
  reference?: string;
  checkoutToken?: string;
  error?: string;
};

export function GiftCardPurchaseClient() {
  const [loading, setLoading] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);

  const [checkoutData, setCheckoutData] = useState<{
    giftCardId: string;
    reference: string;
    checkoutToken: string;
  } | null>(null);

  const form = useForm<GiftCardFormInput, unknown, GiftCardFormValues>({
    resolver: zodResolver(giftCardPublicFormSchema),

    defaultValues: {
      amountEuros: 50,

      purchaserFirstName: "",
      purchaserLastName: "",
      purchaserEmail: "",

      recipientFirstName: "",
      recipientLastName: "",
      recipientEmail: "",

      personalMessage: "",
    },
  });

  const [
    amount,
    purchaserFirstName,
    purchaserLastName,
    purchaserEmail,
    recipientFirstName,
    recipientLastName,
    recipientEmail,
    personalMessage,
  ] = useWatch({
    control: form.control,
    name: [
      "amountEuros",
      "purchaserFirstName",
      "purchaserLastName",
      "purchaserEmail",
      "recipientFirstName",
      "recipientLastName",
      "recipientEmail",
      "personalMessage",
    ],
  });

  const safeAmount =
    typeof amount === "number" && Number.isFinite(amount) ? amount : 0;

  const amountLabel = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(safeAmount),
    [safeAmount],
  );

  async function onSubmit(values: GiftCardFormValues) {
    setLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/gift-cards/checkout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as CheckoutResponse;

      if (
        !response.ok ||
        !payload.success ||
        !payload.checkoutToken ||
        !payload.reference ||
        !payload.giftCardId
      ) {
        throw new Error(
          payload.error ?? "Impossible de préparer votre carte cadeau.",
        );
      }

      setCheckoutData({
        giftCardId: payload.giftCardId,

        reference: payload.reference,

        checkoutToken: payload.checkoutToken,
      });
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkoutData) {
    return (
      <section className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-6 shadow-[0_24px_64px_rgba(85,38,55,0.10)] backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#E8B4C0]/30 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-[#D6B679]/15 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-5 border-b border-[#F0E1E6] pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_14px_30px_rgba(132,63,89,0.24)]">
                <CreditCard className="size-5" />
              </span>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                  Dernière étape
                </p>

                <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027] sm:text-4xl">
                  Finalisez votre achat
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#816D75]">
                  Votre carte cadeau est prête. Elle sera activée uniquement
                  après confirmation du paiement par PayPal.
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#E8C3CF] bg-[#FFF8FA] px-4 py-2 text-xs font-black text-[#816D75] shadow-sm">
              <Sparkles className="size-4 text-[#A5526D]" />
              {amountLabel}
            </span>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] p-5 shadow-[0_12px_30px_rgba(85,38,55,0.06)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                  Référence
                </p>

                <p className="mt-2 font-black tracking-wide text-[#843F59]">
                  {checkoutData.reference}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#A68C96]">
                  Montant à régler
                </p>

                <p className="mt-1 font-serif text-3xl font-semibold text-[#843F59]">
                  {amountLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <GiftCardPayPalCheckout
              giftCardId={checkoutData.giftCardId}
              reference={checkoutData.reference}
              checkoutToken={checkoutData.checkoutToken}
              clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setCheckoutData(null);
              setApiError(null);
            }}
            className="mt-5 w-full rounded-full border border-[#E7CED6] bg-white px-5 py-3 text-sm font-black text-[#843F59] shadow-sm transition hover:border-[#C97992] hover:bg-[#FFF8FA]"
          >
            Modifier les informations
          </button>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-7"
    >
      {apiError ? (
        <div
          role="alert"
          className="rounded-[1.35rem] border border-red-200 bg-gradient-to-br from-red-50 to-white p-5 text-sm font-medium leading-6 text-red-700 shadow-[0_12px_30px_rgba(220,38,38,0.07)]"
        >
          {apiError}
        </div>
      ) : null}
      <section className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[#E8B4C0]/28 blur-3xl" />

        <div className="relative">
          <header className="flex items-start gap-4 border-b border-[#F0E1E6] pb-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)]">
              <Gift className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                Étape 1
              </p>

              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027] sm:text-4xl">
                Choisissez le montant
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#816D75]">
                Sélectionnez la valeur de la carte cadeau qui sera utilisable
                directement au salon.
              </p>
            </div>
          </header>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PREDEFINED_AMOUNTS.map((predefinedAmount) => {
              const selected = amount === predefinedAmount;

              return (
                <button
                  key={predefinedAmount}
                  type="button"
                  onClick={() => {
                    form.setValue("amountEuros", predefinedAmount, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                  className={cn(
                    "relative overflow-hidden rounded-[1.35rem] border px-4 py-5 text-center transition duration-200",
                    selected
                      ? "border-[#A5526D] bg-gradient-to-br from-[#B45F7A] to-[#843F59] text-white shadow-[0_14px_30px_rgba(132,63,89,0.22)]"
                      : "border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] text-[#2F2027] shadow-sm hover:-translate-y-0.5 hover:border-[#DDBAC5]",
                  )}
                >
                  {selected ? (
                    <Sparkles className="absolute right-3 top-3 size-4 text-white/70" />
                  ) : null}

                  <span className="font-serif text-2xl font-semibold">
                    {predefinedAmount} €
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <label
              htmlFor="gift-card-custom-amount"
              className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#6C555F]"
            >
              Autre montant
            </label>

            <div className="relative">
              <input
                id="gift-card-custom-amount"
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                {...form.register("amountEuros", {
                  valueAsNumber: true,
                })}
                className={cn(
                  "h-14 w-full rounded-[1.15rem] border bg-white px-4 pr-14 text-base font-black text-[#2F2027] outline-none transition placeholder:text-[#B9A5AD]",
                  form.formState.errors.amountEuros
                    ? "border-red-300 ring-4 ring-red-100"
                    : "border-[#E8D4DB] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#F6E5EA]",
                )}
              />

              <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center font-black text-[#A5526D]">
                €
              </span>
            </div>

            {form.formState.errors.amountEuros ? (
              <p className="mt-2 text-sm font-medium text-red-600">
                {form.formState.errors.amountEuros.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur sm:p-7 lg:p-8">
        <div className="relative">
          <header className="flex items-start gap-4 border-b border-[#F0E1E6] pb-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#EDD5DD] bg-[#FFF0F4] text-[#A5526D]">
              <User className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                Étape 2
              </p>

              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027]">
                Vos informations
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#816D75]">
                Indiquez les coordonnées de la personne qui achète la carte
                cadeau.
              </p>
            </div>
          </header>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="purchaser-first-name"
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#6C555F]"
              >
                Prénom
              </label>

              <input
                id="purchaser-first-name"
                type="text"
                autoComplete="given-name"
                {...form.register("purchaserFirstName")}
                className={cn(
                  "h-14 w-full rounded-[1.15rem] border bg-white px-4 text-sm font-semibold text-[#2F2027] outline-none transition",
                  form.formState.errors.purchaserFirstName
                    ? "border-red-300 ring-4 ring-red-100"
                    : "border-[#E8D4DB] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#F6E5EA]",
                )}
              />

              {form.formState.errors.purchaserFirstName ? (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {form.formState.errors.purchaserFirstName.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="purchaser-last-name"
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#6C555F]"
              >
                Nom
              </label>

              <input
                id="purchaser-last-name"
                type="text"
                autoComplete="family-name"
                {...form.register("purchaserLastName")}
                className={cn(
                  "h-14 w-full rounded-[1.15rem] border bg-white px-4 text-sm font-semibold text-[#2F2027] outline-none transition",
                  form.formState.errors.purchaserLastName
                    ? "border-red-300 ring-4 ring-red-100"
                    : "border-[#E8D4DB] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#F6E5EA]",
                )}
              />

              {form.formState.errors.purchaserLastName ? (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {form.formState.errors.purchaserLastName.message}
                </p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="purchaser-email"
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#6C555F]"
              >
                Adresse e-mail
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-[#A5526D]" />

                <input
                  id="purchaser-email"
                  type="email"
                  autoComplete="email"
                  {...form.register("purchaserEmail")}
                  className={cn(
                    "h-14 w-full rounded-[1.15rem] border bg-white pl-12 pr-4 text-sm font-semibold text-[#2F2027] outline-none transition",
                    form.formState.errors.purchaserEmail
                      ? "border-red-300 ring-4 ring-red-100"
                      : "border-[#E8D4DB] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#F6E5EA]",
                  )}
                />
              </div>

              {form.formState.errors.purchaserEmail ? (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {form.formState.errors.purchaserEmail.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>{" "}
      <section className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -bottom-24 -right-20 size-64 rounded-full bg-[#D6B679]/12 blur-3xl" />

        <div className="relative">
          <header className="flex items-start gap-4 border-b border-[#F0E1E6] pb-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#EDD5DD] bg-[#FFF0F4] text-[#A5526D]">
              <Heart className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                Étape 3
              </p>

              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027]">
                Le bénéficiaire
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#816D75]">
                Renseignez les informations de la personne qui recevra cette
                carte cadeau.
              </p>
            </div>
          </header>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="recipient-first-name"
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#6C555F]"
              >
                Prénom
              </label>

              <input
                id="recipient-first-name"
                type="text"
                autoComplete="off"
                {...form.register("recipientFirstName")}
                className={cn(
                  "h-14 w-full rounded-[1.15rem] border bg-white px-4 text-sm font-semibold text-[#2F2027] outline-none transition",
                  form.formState.errors.recipientFirstName
                    ? "border-red-300 ring-4 ring-red-100"
                    : "border-[#E8D4DB] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#F6E5EA]",
                )}
              />

              {form.formState.errors.recipientFirstName ? (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {form.formState.errors.recipientFirstName.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="recipient-last-name"
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#6C555F]"
              >
                Nom
              </label>

              <input
                id="recipient-last-name"
                type="text"
                autoComplete="off"
                {...form.register("recipientLastName")}
                className={cn(
                  "h-14 w-full rounded-[1.15rem] border bg-white px-4 text-sm font-semibold text-[#2F2027] outline-none transition",
                  form.formState.errors.recipientLastName
                    ? "border-red-300 ring-4 ring-red-100"
                    : "border-[#E8D4DB] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#F6E5EA]",
                )}
              />

              {form.formState.errors.recipientLastName ? (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {form.formState.errors.recipientLastName.message}
                </p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="recipient-email"
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#6C555F]"
              >
                Adresse e-mail
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-[#A5526D]" />

                <input
                  id="recipient-email"
                  type="email"
                  autoComplete="off"
                  {...form.register("recipientEmail")}
                  className={cn(
                    "h-14 w-full rounded-[1.15rem] border bg-white pl-12 pr-4 text-sm font-semibold text-[#2F2027] outline-none transition",
                    form.formState.errors.recipientEmail
                      ? "border-red-300 ring-4 ring-red-100"
                      : "border-[#E8D4DB] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#F6E5EA]",
                  )}
                />
              </div>

              {form.formState.errors.recipientEmail ? (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {form.formState.errors.recipientEmail.message}
                </p>
              ) : null}

              <p className="mt-2 text-xs leading-5 text-[#917B84]">
                Cette adresse servira à identifier le bénéficiaire de la carte
                cadeau.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-5 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur sm:p-7 lg:p-8">
        <div className="relative">
          <header className="flex items-start gap-4 border-b border-[#F0E1E6] pb-6">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#EDD5DD] bg-[#FFF0F4] text-[#A5526D]">
              <MessageSquare className="size-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
                Étape 4
              </p>

              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027]">
                Votre message
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#816D75]">
                Ajoutez quelques mots qui accompagneront la carte cadeau. Ce
                message est facultatif.
              </p>
            </div>
          </header>

          <div className="mt-7">
            <label
              htmlFor="gift-card-personal-message"
              className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#6C555F]"
            >
              Message personnel
            </label>

            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-4 top-4 size-4.5 text-[#A5526D]" />

              <textarea
                id="gift-card-personal-message"
                rows={6}
                {...form.register("personalMessage")}
                placeholder="Joyeux anniversaire ! Profite bien de ce moment rien que pour toi…"
                className={cn(
                  "min-h-36 w-full resize-y rounded-[1.25rem] border bg-white py-4 pl-12 pr-4 text-sm font-medium leading-7 text-[#2F2027] outline-none transition placeholder:text-[#B9A5AD]",
                  form.formState.errors.personalMessage
                    ? "border-red-300 ring-4 ring-red-100"
                    : "border-[#E8D4DB] focus:border-[#B45F7A] focus:ring-4 focus:ring-[#F6E5EA]",
                )}
              />
            </div>

            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                {form.formState.errors.personalMessage ? (
                  <p className="text-sm font-medium text-red-600">
                    {form.formState.errors.personalMessage.message}
                  </p>
                ) : (
                  <p className="text-xs leading-5 text-[#917B84]">
                    Le message sera associé à la carte cadeau.
                  </p>
                )}
              </div>

              <p className="shrink-0 text-xs font-semibold text-[#A68C96]">
                {(personalMessage ?? "").length} caractères{" "}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden rounded-[2rem] border border-[#5A3A47] bg-gradient-to-br from-[#3A2730] via-[#2F2027] to-[#24191F] p-5 text-white shadow-[0_24px_64px_rgba(47,32,39,0.22)] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[#C97992]/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 -left-16 size-64 rounded-full bg-[#D6B679]/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#E8B4C0] ring-1 ring-white/15">
                <Gift className="size-5" />
              </span>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#E8B4C0]">
                  Récapitulatif
                </p>

                <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
                  Votre carte cadeau
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">
                  Vérifiez les informations avant de préparer le paiement
                  sécurisé.
                </p>
              </div>
            </div>

            <div className="w-fit shrink-0 rounded-[1.35rem] border border-white/15 bg-white/[0.08] px-5 py-4 shadow-lg backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/55">
                Valeur
              </p>

              <p className="mt-1 font-serif text-3xl font-semibold text-white">
                {amountLabel}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#E8B4C0]">
                Acheteur
              </p>

              <p className="mt-3 font-black text-white">
                {[purchaserFirstName, purchaserLastName]
                  .filter(Boolean)
                  .join(" ") || "À renseigner"}
              </p>

              <p className="mt-1 break-all text-sm leading-6 text-white/60">
                {purchaserEmail || "Adresse e-mail à renseigner"}{" "}
              </p>
            </div>

            <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#E8B4C0]">
                Bénéficiaire
              </p>

              <p className="mt-3 font-black text-white">
                {[recipientFirstName, recipientLastName]
                  .filter(Boolean)
                  .join(" ") || "À renseigner"}
              </p>

              <p className="mt-1 break-all text-sm leading-6 text-white/60">
                {recipientEmail || "Adresse e-mail à renseigner"}{" "}
              </p>
            </div>
          </div>

          {personalMessage?.trim() ? (
            <div className="mt-4 rounded-[1.35rem] border border-[#D6B679]/25 bg-[#D6B679]/[0.08] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#E7CE9E]">
                Message personnel
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm italic leading-7 text-white/75">
                « {personalMessage?.trim()} »{" "}
              </p>
            </div>
          ) : null}

          <div className="mt-6 rounded-[1.35rem] border border-white/10 bg-black/10 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-[#D6B679]" />

              <div>
                <p className="text-sm font-black text-white">
                  Utilisation directement au salon
                </p>

                <p className="mt-1 text-xs leading-6 text-white/60">
                  La carte cadeau pourra être utilisée partiellement ou
                  intégralement lors d’une visite au Palais des Ongles.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#D99AB0] via-[#C97992] to-[#B45F7A] px-6 py-4 text-sm font-black text-white shadow-[0_16px_38px_rgba(201,121,146,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(201,121,146,0.35)] disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="size-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                Préparation en cours…
              </>
            ) : (
              <>
                <CreditCard className="size-5" />
                Continuer vers le paiement
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs font-medium leading-5 text-white/50">
            Aucun débit ne sera effectué avant la validation du paiement sur
            PayPal.
          </p>
        </div>
      </section>
    </form>
  );
}
