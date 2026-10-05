"use client";

import { CheckCircle2, Share, Smartphone } from "lucide-react";

import { useInstallPrompt } from "@/features/push/hooks/use-install-prompt";

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function InstallAppSection() {
  const { deviceContext, canPromptInstall, promptInstall } =
    useInstallPrompt();

  // Rien à afficher tant qu'on ne sait pas encore si l'app est
  // installée (évite un flash de contenu au premier rendu).
  if (deviceContext === null) {
    return null;
  }

  const { isStandalone, isIos } = deviceContext;

  return (
    <section className="px-5 pb-20 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-[#35242B]/7 bg-gradient-to-br from-[#FFF0F4] via-white to-[#FBF3F5] p-8 shadow-[0_30px_80px_-50px_rgba(139,64,90,0.35)] sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 size-64 rounded-full bg-[#E8B3C3]/35 blur-3xl"
          />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9537B] to-[#B8899A] text-white shadow-lg shadow-[#E8B4B8]/60">
                <Smartphone className="size-6" />
              </span>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-[#A64D69]">
                Application
              </p>

              <h2 className="mt-2 font-serif text-3xl text-[#35242B] sm:text-4xl">
                {isStandalone
                  ? "L’application est installée"
                  : "Installez l’application"}
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#79636C]">
                {isStandalone
                  ? "Vous recevez déjà le site directement depuis votre écran d’accueil, comme une vraie application."
                  : "Ajoutez Le Palais des Ongles à votre écran d’accueil pour réserver plus vite et recevoir vos rappels de rendez-vous en notification."}
              </p>
            </div>

            <div className="w-full shrink-0 lg:w-auto lg:min-w-[22rem]">
              {isStandalone ? (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 className="size-5 shrink-0" />
                  Application déjà installée sur cet appareil
                </div>
              ) : canPromptInstall ? (
                <button
                  type="button"
                  onClick={() => void promptInstall()}
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#AA526E] via-[#BD7088] to-[#8B405A] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(139,64,90,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(139,64,90,0.35)] sm:w-auto"
                >
                  <Smartphone className="size-5" />
                  Installer en un clic
                </button>
              ) : isIos ? (
                <div className="rounded-2xl border border-[#F0DCE3] bg-white p-5">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#35242B]">
                    <Share className="size-4 text-[#A64D69]" />
                    Sur iPhone / iPad
                  </p>

                  <p className="mt-2 text-sm leading-7 text-[#79636C]">
                    Appuyez sur{" "}
                    <Share className="mx-0.5 inline size-3.5 align-text-bottom text-[#A64D69]" />{" "}
                    <b>Partager</b> dans Safari, puis sur{" "}
                    <b>« Sur l’écran d’accueil »</b>.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#F0DCE3] bg-white p-5">
                  <p className="text-sm font-bold text-[#35242B]">
                    Installation non disponible ici
                  </p>

                  <p className="mt-2 text-sm leading-7 text-[#79636C]">
                    Votre navigateur ne propose pas d’installation
                    automatique. Ouvrez cette page avec Chrome ou Edge sur
                    Android, ou Safari sur iPhone, pour installer
                    l’application.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
