"use client";

import { useEffect, useState } from "react";
import { Check, Copy, PartyPopper, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WheelOfFortune } from "@/features/wheel/components/wheel-of-fortune";
import type {
  WheelSegmentPublic,
  WheelSpinResult,
} from "@/features/wheel/types/wheel.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type WheelModalProps =
  | { trigger: "DAILY" }
  | { trigger: "BOOKING"; appointmentReference: string };

type WheelStatus = "loading" | "hidden" | "ready" | "spinning" | "revealed";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function buildSpinQuery(props: WheelModalProps): string {
  if (props.trigger === "DAILY") {
    return "trigger=DAILY";
  }

  return `trigger=BOOKING&appointmentReference=${encodeURIComponent(
    props.appointmentReference,
  )}`;
}

function buildSpinBody(props: WheelModalProps): string {
  if (props.trigger === "DAILY") {
    return JSON.stringify({ trigger: "DAILY" });
  }

  return JSON.stringify({
    trigger: "BOOKING",
    appointmentReference: props.appointmentReference,
  });
}

function formatExpiry(expiresAt: string): string {
  return new Date(expiresAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function WheelModal(props: WheelModalProps) {
  const [status, setStatus] = useState<WheelStatus>("loading");
  const [segments, setSegments] = useState<WheelSegmentPublic[]>([]);
  const [result, setResult] = useState<WheelSpinResult | null>(null);
  const [spinToken, setSpinToken] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkEligibility() {
      try {
        const response = await fetch(
          `/api/wheel/spin?${buildSpinQuery(props)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          if (!cancelled) setStatus("hidden");
          return;
        }

        const data = (await response.json()) as {
          eligible: boolean;
          segments: WheelSegmentPublic[];
        };

        if (cancelled) return;

        if (data.eligible && data.segments.length > 0) {
          setSegments(data.segments);
          setStatus("ready");
        } else {
          setStatus("hidden");
        }
      } catch {
        if (!cancelled) setStatus("hidden");
      }
    }

    void checkEligibility();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSpin() {
    if (status !== "ready") return;

    setStatus("spinning");

    try {
      const response = await fetch("/api/wheel/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: buildSpinBody(props),
      });

      const data = (await response.json()) as
        | (WheelSpinResult & { success: true })
        | { error: string; code?: string };

      if (!response.ok || !("success" in data)) {
        toast.error(
          "error" in data
            ? data.error
            : "Impossible de faire tourner la roue.",
        );

        setStatus("hidden");
        return;
      }

      setResult(data);
      setSpinToken((token) => token + 1);
    } catch {
      toast.error("Impossible de faire tourner la roue.");
      setStatus("hidden");
    }
  }

  function handleCopyCode() {
    if (!result?.code) return;

    void navigator.clipboard.writeText(result.code).then(() => {
      setCopied(true);
      toast.success("Code copié !");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (status === "hidden" || status === "loading") {
    return null;
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && status !== "spinning") {
          setStatus("hidden");
        }
      }}
    >
      <DialogContent className="max-w-md border-[#F0DCE3] bg-[#FFFAFB] text-center">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
            <Sparkles className="size-6" />
          </div>

          <DialogTitle className="font-serif text-2xl text-[#35242B]">
            {status === "revealed"
              ? result?.won
                ? "Félicitations !"
                : "Pas de chance cette fois"
              : "La roue de la chance"}
          </DialogTitle>

          <DialogDescription className="text-[#79636C]">
            {status === "revealed"
              ? result?.won
                ? "Voici votre code de réduction, valable sur votre prochaine prestation."
                : "Retentez votre chance une prochaine fois !"
              : "Tentez de gagner une réduction sur votre prochaine prestation."}
          </DialogDescription>
        </DialogHeader>

        <WheelOfFortune
          segments={segments}
          targetSegmentId={result?.segmentId ?? null}
          spinToken={spinToken}
          onSpinComplete={() => setStatus("revealed")}
        />

        <div className="mt-6">
          {status === "ready" && (
            <button
              type="button"
              onClick={handleSpin}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-6 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.28)] transition hover:-translate-y-0.5"
            >
              <Sparkles className="size-4" />
              Tourner la roue
            </button>
          )}

          {status === "spinning" && (
            <p className="text-sm font-semibold text-[#A64D69]">
              La roue tourne…
            </p>
          )}

          {status === "revealed" && result?.won && result.code && (
            <div className="rounded-2xl border border-[#F0DCE3] bg-white p-4">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#FFF0F4] px-4 py-3">
                <div className="flex items-center gap-2 text-[#A64D69]">
                  <PartyPopper className="size-4" />
                  <span className="font-mono text-base font-bold tracking-wide">
                    {result.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#35242B] text-white transition hover:bg-[#4A2E38]"
                  aria-label="Copier le code"
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              {result.expiresAt && (
                <p className="mt-3 text-xs text-[#8A767E]">
                  Valable jusqu’au {formatExpiry(result.expiresAt)}. Saisissez
                  ce code lors du paiement de votre prochaine réservation.
                  Vous le retrouverez aussi dans vos notifications.
                </p>
              )}
            </div>
          )}

          {status === "revealed" && !result?.won && (
            <p className="text-sm text-[#79636C]">
              Ce n’était pas votre jour de chance, mais votre prochaine visite
              pourrait bien être la bonne !
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
