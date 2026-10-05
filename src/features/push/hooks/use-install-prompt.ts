"use client";

import { useEffect, useState } from "react";

import {
  detectIsIos,
  detectIsStandalone,
  type BeforeInstallPromptEvent,
} from "@/features/push/utils/device-detection";

type DeviceContext = {
  isStandalone: boolean;
  isIos: boolean;
};

/*
 * Centralise la détection "app déjà installée ?" / "peut-on proposer
 * une installation en un clic ?" — utilisé à la fois par la carte
 * d'activation des notifications (espace client) et par le bouton
 * d'installation de la page Contact.
 */
export function useInstallPrompt() {
  const [deviceContext, setDeviceContext] = useState<DeviceContext | null>(
    null,
  );

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Enveloppé en micro-tâche : la lecture de window/navigator ne
    // peut se faire qu'une fois monté (SSR-safe), et ce détour évite
    // un setState synchrone immédiat en tête d'effet.
    queueMicrotask(() => {
      setDeviceContext({
        isStandalone: detectIsStandalone(),
        isIos: detectIsIos(),
      });
    });

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  async function promptInstall(): Promise<boolean> {
    if (!installPrompt) return false;

    installPrompt.prompt();

    const choice = await installPrompt.userChoice;

    setInstallPrompt(null);

    if (choice.outcome === "accepted") {
      setDeviceContext((current) =>
        current ? { ...current, isStandalone: true } : current,
      );

      return true;
    }

    return false;
  }

  return {
    deviceContext,
    canPromptInstall: installPrompt !== null,
    promptInstall,
  };
}
