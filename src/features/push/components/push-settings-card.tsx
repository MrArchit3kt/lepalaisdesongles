"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  BellRing,
  LoaderCircle,
  Share,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

import { useInstallPrompt } from "@/features/push/hooks/use-install-prompt";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type PushState =
  | "checking"
  | "unsupported"
  | "denied"
  | "ready"
  | "subscribed";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function PushSettingsCard() {
  const { deviceContext, canPromptInstall, promptInstall } =
    useInstallPrompt();

  const [pushState, setPushState] = useState<PushState>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function checkPushState() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setPushState("unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        setPushState("denied");
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const existingSubscription = registration
        ? await registration.pushManager.getSubscription()
        : null;

      setPushState(existingSubscription ? "subscribed" : "ready");
    }

    void checkPushState();
  }, []);

  async function handleEnable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!publicKey) {
      toast.error("Les notifications push ne sont pas configurées sur le site.");
      return;
    }

    setBusy(true);

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setPushState("denied");

        toast.error(
          "Permission refusée. Tu peux l’autoriser depuis les réglages de notifications de ton navigateur.",
        );

        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        throw new Error("Échec de l’enregistrement de l’abonnement.");
      }

      setPushState("subscribed");
      toast.success("Notifications activées !");
    } catch (error) {
      console.error("[PUSH_ENABLE]", error);
      toast.error("Impossible d’activer les notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = registration
        ? await registration.pushManager.getSubscription()
        : null;

      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        await subscription.unsubscribe();
      }

      setPushState("ready");
      toast.success("Notifications désactivées.");
    } catch (error) {
      console.error("[PUSH_DISABLE]", error);
      toast.error("Impossible de désactiver les notifications.");
    } finally {
      setBusy(false);
    }
  }

  // Rien à afficher tant qu'on ne sait pas encore si l'app est
  // installée (évite un flash de contenu au premier rendu).
  if (deviceContext === null) {
    return null;
  }

  const { isStandalone, isIos } = deviceContext;
  const needsInstallStep = isIos && !isStandalone;

  return (
    <section className="rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-[0_18px_55px_-35px_rgba(24,24,27,0.28)] sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-pink-50 text-rose-700 shadow-sm">
          <BellRing className="size-5" />
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold text-[#35242B]">
            Notifications push
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Reçois un rappel 48h et 2h avant ton rendez-vous, une invitation à
            laisser un avis après ta visite, et un accès direct pour ajouter
            ta réservation à ton agenda — directement sur ton téléphone.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {needsInstallStep ? (
          <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
              <Share className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zinc-950">
                Étape 1 — Installer l’application
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Sur iPhone, les notifications ne sont possibles qu’une fois le
                site ajouté à l’écran d’accueil : appuie sur{" "}
                <Share className="mx-0.5 inline size-3.5 align-text-bottom" />{" "}
                <b>Partager</b>, puis <b>« Sur l’écran d’accueil »</b>.
              </p>
            </div>
          </div>
        ) : null}

        {!isStandalone && !isIos && canPromptInstall ? (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <Smartphone className="size-4" />
            Installer l’application
          </button>
        ) : null}

        {needsInstallStep ? null : (
          <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-rose-200 hover:bg-rose-50/30">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
              {pushState === "subscribed" ? (
                <Bell className="size-4" />
              ) : (
                <BellOff className="size-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-zinc-950">
                {pushState === "subscribed"
                  ? "Notifications activées"
                  : "Activer les notifications"}
              </p>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                {pushState === "unsupported"
                  ? "Ton navigateur ne permet pas les notifications push."
                  : pushState === "denied"
                    ? "Les notifications sont bloquées pour ce site. Autorise-les depuis les réglages de ton navigateur pour les activer."
                    : pushState === "subscribed"
                      ? "Tu recevras les rappels, demandes d’avis et confirmations directement sur cet appareil."
                      : "Autorise les notifications pour ne rien manquer."}
              </p>
            </div>

            {pushState === "ready" || pushState === "subscribed" ? (
              <button
                type="button"
                disabled={busy}
                onClick={pushState === "subscribed" ? handleDisable : handleEnable}
                className="mt-1 shrink-0 rounded-full px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
                style={
                  pushState === "subscribed"
                    ? { color: "#9f1239", backgroundColor: "#ffe4e6" }
                    : { color: "white", backgroundColor: "#e11d48" }
                }
              >
                {busy ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : pushState === "subscribed" ? (
                  "Désactiver"
                ) : (
                  "Activer"
                )}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
