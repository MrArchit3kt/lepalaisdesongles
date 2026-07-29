"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";

type PayPalCheckoutProps = {
  appointmentId: string;
  reference: string;
  clientId: string;
};

type CreateOrderResponse = {
  id?: string;
  error?: string;
  details?: string;
};

type CaptureOrderResponse = {
  success?: boolean;
  confirmationUrl?: string;
  error?: string;
  details?: string;
};

export function PayPalCheckout({
  appointmentId,
  reference,
  clientId,
}: PayPalCheckoutProps) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(
    null,
  );

  const [completed, setCompleted] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  async function createPayPalOrder(): Promise<string> {
    setError(null);

    const response = await fetch(
      "/api/paypal/orders",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          appointmentId,
        }),
      },
    );

    const payload =
      (await response.json()) as CreateOrderResponse;

    if (!response.ok || !payload.id) {
      throw new Error(
        payload.error ??
          payload.details ??
          "Impossible de préparer le paiement PayPal.",
      );
    }

    return payload.id;
  }

  async function capturePayPalOrder(
    orderId: string,
  ): Promise<void> {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/paypal/orders/${encodeURIComponent(
          orderId,
        )}/capture`,
        {
          method: "POST",

          headers: {
            Accept: "application/json",
          },
        },
      );

      const payload =
        (await response.json()) as CaptureOrderResponse;

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.error ??
            payload.details ??
            "Le paiement n'a pas pu être confirmé.",
        );
      }

      setCompleted(true);

      router.push(
        payload.confirmationUrl ??
          `/reservation/confirmation/${reference}`,
      );

      router.refresh();
    } finally {
      setProcessing(false);
    }
  }

  if (!clientId) {
    return (
      <div className="rounded-[1.35rem] border border-red-200 bg-gradient-to-br from-red-50 to-white p-5 text-sm font-medium leading-6 text-red-700 shadow-[0_12px_30px_rgba(220,38,38,0.07)]">
        La configuration PayPal est incomplète.
        Ajoutez la variable
        NEXT_PUBLIC_PAYPAL_CLIENT_ID dans votre
        fichier .env.
      </div>
    );
  }

  if (completed) {
    return (
      <div className="rounded-[1.5rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-[#F3FBF5] p-6 text-center shadow-[0_16px_36px_rgba(16,185,129,0.09)]">
        <p className="font-serif text-2xl font-semibold text-emerald-800">
          Paiement accepté
        </p>

        <p className="mt-2 text-sm font-medium leading-6 text-emerald-700">
          Redirection vers la confirmation de votre
          rendez-vous…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="rounded-[1.25rem] border border-red-200 bg-gradient-to-br from-red-50 to-white p-4 text-sm font-medium leading-6 text-red-700 shadow-[0_10px_28px_rgba(220,38,38,0.06)]"
        >
          {error}
        </div>
      ) : null}

      {processing ? (
        <div className="rounded-[1.25rem] border border-[#E8D4DB] bg-gradient-to-br from-[#FFF8FA] to-white p-4 text-center text-sm font-medium leading-6 text-[#816D75] shadow-[0_10px_28px_rgba(85,38,55,0.05)]">
          Confirmation de votre paiement en
          cours…
        </div>
      ) : null}

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
          forceReRender={[
            appointmentId,
            reference,
          ]}
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
              "Le paiement a été annulé. Votre créneau reste en attente tant que l'acompte n'est pas réglé.",
            );
          }}
          onError={(reason) => {
            console.error(
              "Erreur bouton PayPal :",
              reason,
            );

            setError(
              "PayPal rencontre une erreur. Réessayez dans quelques instants.",
            );
          }}
        />
      </PayPalScriptProvider>

      <p className="rounded-[1.15rem] border border-[#EFDEE4] bg-white/65 px-4 py-3 text-center text-xs font-medium leading-5 text-[#816D75] shadow-sm">
        Le rendez-vous sera confirmé uniquement
        après validation de l’acompte par PayPal.
      </p>
    </div>
  );
}
