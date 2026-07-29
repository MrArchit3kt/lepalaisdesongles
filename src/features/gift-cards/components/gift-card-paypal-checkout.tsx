"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  BadgeCheck,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

type GiftCardPayPalCheckoutProps = {
  giftCardId: string;
  reference: string;
  checkoutToken: string;
  clientId: string;
};

type CreateOrderResponse = {
  success?: boolean;
  id?: string;
  orderId?: string;
  error?: string;
  details?: string;
};

type CaptureOrderResponse = {
  success?: boolean;
  reference?: string;
  confirmationUrl?: string;
  error?: string;
  details?: string;
};

export function GiftCardPayPalCheckout({
  giftCardId,
  reference,
  checkoutToken,
  clientId,
}: GiftCardPayPalCheckoutProps) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  const [processing, setProcessing] = useState(false);

  const [completed, setCompleted] = useState(false);

  async function createPayPalOrder(): Promise<string> {
    setError(null);

    const response = await fetch("/api/gift-cards/paypal/orders", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Accept: "application/json",
      },

      body: JSON.stringify({
        giftCardId,
        checkoutToken,
      }),
    });

    const payload = (await response.json()) as CreateOrderResponse;

    const orderId = payload.id ?? payload.orderId;

    if (!response.ok || !orderId) {
      throw new Error(
        payload.error ??
          payload.details ??
          "Impossible de préparer le paiement PayPal.",
      );
    }

    return orderId;
  }

  async function capturePayPalOrder(orderId: string): Promise<void> {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/gift-cards/paypal/orders/${encodeURIComponent(orderId)}/capture`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Accept: "application/json",
          },

          body: JSON.stringify({
            giftCardId,
            checkoutToken,
          }),
        },
      );

      const payload = (await response.json()) as CaptureOrderResponse;

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.error ??
            payload.details ??
            "Le paiement n’a pas pu être confirmé.",
        );
      }

      setCompleted(true);

      const confirmationUrl =
        payload.confirmationUrl ??
        `/carte-cadeau/confirmation/${
          payload.reference ?? reference
        }?token=${encodeURIComponent(checkoutToken)}`;

      router.push(confirmationUrl);

      router.refresh();
    } finally {
      setProcessing(false);
    }
  }

  if (!clientId) {
    return (
      <div
        role="alert"
        className="rounded-[1.35rem] border border-red-200 bg-gradient-to-br from-red-50 to-white p-5 text-sm font-medium leading-6 text-red-700 shadow-[0_12px_30px_rgba(220,38,38,0.07)]"
      >
        La configuration PayPal est incomplète. Ajoutez la variable
        NEXT_PUBLIC_PAYPAL_CLIENT_ID dans votre fichier .env.
      </div>
    );
  }

  if (completed) {
    return (
      <div className="relative overflow-hidden rounded-[1.5rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-[#F3FBF5] p-7 text-center shadow-[0_16px_36px_rgba(16,185,129,0.09)]">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
          <BadgeCheck className="size-7" />
        </span>

        <p className="mt-5 font-serif text-2xl font-semibold text-emerald-800">
          Paiement accepté
        </p>

        <p className="mt-2 text-sm font-medium leading-6 text-emerald-700">
          Votre carte cadeau est en cours d’activation. Vous allez être redirigé
          vers sa confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[#5A3A47] bg-gradient-to-br from-[#3A2730] via-[#2F2027] to-[#24191F] p-5 text-white shadow-[0_18px_44px_rgba(47,32,39,0.20)]">
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-[#C97992]/20 blur-3xl" />

        <div className="relative flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-[#E8B4C0] ring-1 ring-white/15">
            <LockKeyhole className="size-5" />
          </span>

          <div>
            <p className="font-black">Paiement protégé par PayPal</p>

            <p className="mt-1 text-sm leading-6 text-white/65">
              Les informations bancaires sont saisies directement sur
              l’interface sécurisée de PayPal. Elles ne sont jamais enregistrées
              par le salon.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-[1.25rem] border border-red-200 bg-gradient-to-br from-red-50 to-white p-4 text-sm font-medium leading-6 text-red-700 shadow-[0_10px_28px_rgba(220,38,38,0.06)]"
        >
          {error}
        </div>
      ) : null}

      {processing ? (
        <div className="flex items-center justify-center gap-3 rounded-[1.25rem] border border-[#E8D4DB] bg-gradient-to-br from-[#FFF8FA] to-white p-4 text-center text-sm font-medium leading-6 text-[#816D75] shadow-[0_10px_28px_rgba(85,38,55,0.05)]">
          <LoaderCircle className="size-5 animate-spin text-[#A5526D]" />
          Confirmation du paiement en cours…
        </div>
      ) : null}

      <div className="rounded-[1.5rem] border border-[#EFDEE4] bg-white p-4 shadow-[0_14px_34px_rgba(85,38,55,0.07)] sm:p-5">
        <PayPalScriptProvider
          options={{
            clientId,
            currency: "EUR",
            intent: "capture",
            components: "buttons",
          }}
        >
          <PayPalButtons
            disabled={processing}
            forceReRender={[giftCardId, reference, checkoutToken]}
            style={{
              layout: "vertical",
              shape: "pill",
              label: "paypal",
              height: 48,
            }}
            createOrder={async () => {
              try {
                return await createPayPalOrder();
              } catch (reason: unknown) {
                const message =
                  reason instanceof Error
                    ? reason.message
                    : "Impossible de préparer le paiement.";

                setError(message);

                throw reason;
              }
            }}
            onApprove={async (data) => {
              try {
                await capturePayPalOrder(data.orderID);
              } catch (reason: unknown) {
                setError(
                  reason instanceof Error
                    ? reason.message
                    : "Impossible de confirmer le paiement.",
                );
              }
            }}
            onCancel={() => {
              setError(
                "Le paiement a été annulé. La carte cadeau ne sera pas activée tant que le règlement n’est pas confirmé.",
              );
            }}
            onError={(reason) => {
              console.error(
                "Erreur bouton PayPal de la carte cadeau :",
                reason,
              );

              setError(
                "PayPal rencontre une erreur. Réessayez dans quelques instants.",
              );
            }}
          />
        </PayPalScriptProvider>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] p-4 shadow-sm">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#A5526D]" />

          <div>
            <p className="text-sm font-black text-[#2F2027]">
              Paiement sécurisé
            </p>

            <p className="mt-1 text-xs leading-5 text-[#816D75]">
              Transaction protégée et vérifiée par PayPal.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-[1.25rem] border border-[#EFDEE4] bg-gradient-to-br from-white to-[#FFF7F9] p-4 shadow-sm">
          <CreditCard className="mt-0.5 size-5 shrink-0 text-[#A5526D]" />

          <div>
            <p className="text-sm font-black text-[#2F2027]">
              Activation immédiate
            </p>

            <p className="mt-1 text-xs leading-5 text-[#816D75]">
              La carte est activée après confirmation du règlement.
            </p>
          </div>
        </div>
      </div>

      <p className="rounded-[1.15rem] border border-[#EFDEE4] bg-white/70 px-4 py-3 text-center text-xs font-medium leading-5 text-[#816D75] shadow-sm">
        La carte cadeau est utilisable uniquement au salon et peut être débitée
        en une ou plusieurs fois.
      </p>
    </div>
  );
}
