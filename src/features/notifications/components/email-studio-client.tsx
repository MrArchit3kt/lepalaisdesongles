"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  CalendarClock,
  Check,
  Clock3,
  ExternalLink,
  LoaderCircle,
  Mail,
  Monitor,
  RefreshCw,
  Send,
  Smartphone,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import {
  sendEmailStudioTestAction,
} from "../actions/email-studio.actions";

import type {
  AppointmentEmailKind,
} from "../types/appointment-email.types";

type EmailModel = {
  kind: AppointmentEmailKind;
  label: string;
  description: string;
  title: string;
  eyebrow: string;
  badge: string;
  intro: string;
  closing: string;
  icon: string;
  accent: string;
  accentSoft: string;
};

const EMAIL_MODELS: EmailModel[] = [
  {
    kind: "BOOKING_CONFIRMED",
    label: "Réservation confirmée",
    description:
      "Envoyé lorsque le rendez-vous de la cliente est confirmé.",
    title:
      "Votre rendez-vous est confirmé",
    eyebrow:
      "Réservation confirmée",
    badge:
      "Rendez-vous confirmé",
    intro:
      "Votre réservation a bien été enregistrée. Nous avons hâte de vous accueillir et de prendre soin de vos ongles.",
    closing:
      "Votre créneau vous est maintenant réservé.",
    icon: "✓",
    accent: "#9E536B",
    accentSoft: "#FBEAF0",
  },
  {
    kind: "APPOINTMENT_UPDATED",
    label: "Rendez-vous modifié",
    description:
      "Envoyé après une modification des informations du rendez-vous.",
    title:
      "Votre rendez-vous a été modifié",
    eyebrow:
      "Rendez-vous mis à jour",
    badge:
      "Informations modifiées",
    intro:
      "Les informations de votre rendez-vous ont été mises à jour. Retrouvez ci-dessous votre nouveau récapitulatif.",
    closing:
      "Pensez à noter ces nouvelles informations dans votre agenda.",
    icon: "✦",
    accent: "#755688",
    accentSoft: "#F3ECF8",
  },
  {
    kind: "APPOINTMENT_CANCELLED",
    label: "Rendez-vous annulé",
    description:
      "Envoyé lorsque le rendez-vous est annulé.",
    title:
      "Votre rendez-vous a été annulé",
    eyebrow:
      "Annulation",
    badge:
      "Rendez-vous annulé",
    intro:
      "Votre rendez-vous n’est plus programmé. Vous pouvez effectuer une nouvelle réservation depuis votre espace client.",
    closing:
      "Nous espérons pouvoir vous accueillir prochainement.",
    icon: "×",
    accent: "#A45A59",
    accentSoft: "#FCEDEC",
  },
  {
    kind: "REMINDER_24H",
    label: "Rappel 24 heures",
    description:
      "Rappel automatique envoyé environ 24 heures avant le rendez-vous.",
    title:
      "Votre rendez-vous est prévu demain",
    eyebrow:
      "Rappel de rendez-vous",
    badge:
      "Dans environ 24 heures",
    intro:
      "Petit rappel : votre rendez-vous approche. Vous trouverez toutes les informations utiles ci-dessous.",
    closing:
      "Nous avons hâte de vous retrouver demain.",
    icon: "◷",
    accent: "#A6772C",
    accentSoft: "#FFF6E4",
  },
  {
    kind: "REMINDER_2H",
    label: "Rappel 2 heures",
    description:
      "Dernier rappel automatique avant l'arrivée de la cliente.",
    title:
      "Nous vous attendons bientôt",
    eyebrow:
      "Votre rendez-vous approche",
    badge:
      "Dans environ 2 heures",
    intro:
      "Votre rendez-vous commence dans environ deux heures. Voici un dernier rappel des informations importantes.",
    closing:
      "À tout à l’heure au salon.",
    icon: "◷",
    accent: "#A6772C",
    accentSoft: "#FFF6E4",
  },
];

export function EmailStudioClient() {
  const [selectedKind, setSelectedKind] =
    useState<AppointmentEmailKind>(
      "BOOKING_CONFIRMED",
    );

  const [recipientEmail, setRecipientEmail] =
    useState("");

  const [previewMode, setPreviewMode] =
    useState<"desktop" | "mobile">(
      "desktop",
    );

  const [feedback, setFeedback] =
    useState<{
      success: boolean;
      message: string;
    } | null>(null);

  const [isPending, startTransition] =
    useTransition();

  const selectedModel =
    useMemo(
      () =>
        EMAIL_MODELS.find(
          (model) =>
            model.kind === selectedKind,
        ) ?? EMAIL_MODELS[0],
      [selectedKind],
    );

  function sendTestEmail() {
    setFeedback(null);

    const formData =
      new FormData();

    formData.set(
      "recipientEmail",
      recipientEmail,
    );

    formData.set(
      "kind",
      selectedKind,
    );

    startTransition(async () => {
      const result =
        await sendEmailStudioTestAction(
          formData,
        );

      setFeedback({
        success:
          result.success,
        message:
          result.message,
      });
    });
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <header className="mb-8">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E8CCD5] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#A5526D] shadow-sm">
              <Sparkles className="size-3.5" />
              Communication client
            </div>

            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#2F2027] sm:text-4xl">
              Studio e-mails
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#806A73] sm:text-base">
              Prévisualisez les e-mails transactionnels du salon
              et envoyez de véritables messages de test avec la
              configuration Resend utilisée en production.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[#EFDDE3] bg-white px-4 py-3 text-xs font-semibold text-[#806A73] shadow-sm">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>

            Envoi via Resend
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="overflow-hidden rounded-[1.75rem] border border-[#EFDDE3] bg-white shadow-[0_18px_50px_rgba(92,42,60,0.07)]">
            <div className="border-b border-[#F1E2E7] px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-[#FFF0F4] text-[#A5526D]">
                  <Mail className="size-5" />
                </div>

                <div>
                  <h2 className="font-bold text-[#38282E]">
                    Modèle d’e-mail
                  </h2>

                  <p className="text-xs text-[#927B84]">
                    Choisissez le scénario à tester.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-3">
              {EMAIL_MODELS.map(
                (model) => {
                  const active =
                    model.kind ===
                    selectedKind;

                  return (
                    <button
                      key={model.kind}
                      type="button"
                      onClick={() => {
                        setSelectedKind(
                          model.kind,
                        );

                        setFeedback(
                          null,
                        );
                      }}
                      className={`w-full rounded-[1.25rem] border p-4 text-left transition ${
                        active
                          ? "border-[#DCAFC0] bg-[#FFF3F6] shadow-[0_8px_22px_rgba(157,77,105,0.09)]"
                          : "border-transparent hover:border-[#F0DDE4] hover:bg-[#FFFAFB]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="grid size-9 shrink-0 place-items-center rounded-xl text-sm font-black"
                          style={{
                            backgroundColor:
                              model.accentSoft,
                            color:
                              model.accent,
                          }}
                        >
                          {model.icon}
                        </span>

                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="block text-sm font-bold text-[#3C2A31]">
                              {model.label}
                            </span>

                            {active ? (
                              <Check className="size-3.5 text-[#A5526D]" />
                            ) : null}
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-[#927B84]">
                            {model.description}
                          </span>
                        </span>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[#EFDDE3] bg-white p-5 shadow-[0_18px_50px_rgba(92,42,60,0.07)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-[#FFF0F4] text-[#A5526D]">
                <Send className="size-4.5" />
              </div>

              <div>
                <h2 className="font-bold text-[#38282E]">
                  Envoi de test
                </h2>

                <p className="text-xs text-[#927B84]">
                  Le message sera réellement envoyé.
                </p>
              </div>
            </div>

            <label
              htmlFor="test-email"
              className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-[#806A73]"
            >
              Adresse destinataire
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#B28D9A]" />

              <input
                id="test-email"
                type="email"
                value={recipientEmail}
                onChange={(event) => {
                  setRecipientEmail(
                    event.target.value,
                  );

                  setFeedback(
                    null,
                  );
                }}
                placeholder="votre@email.fr"
                autoComplete="email"
                className="h-12 w-full rounded-2xl border border-[#E8D3DA] bg-[#FFFDFD] pl-11 pr-4 text-sm text-[#38282E] outline-none transition placeholder:text-[#B9A4AB] focus:border-[#C98299] focus:ring-4 focus:ring-[#E8B4C0]/20"
              />
            </div>

            <button
              type="button"
              disabled={
                isPending ||
                recipientEmail.trim().length ===
                  0
              }
              onClick={sendTestEmail}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#A5526D] to-[#843F59] px-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(132,63,89,0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Envoyer un test
                </>
              )}
            </button>

            {feedback ? (
              <div
                className={`mt-4 flex items-start gap-3 rounded-2xl border p-3 text-xs leading-5 ${
                  feedback.success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {feedback.success ? (
                  <Check className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <X className="mt-0.5 size-4 shrink-0" />
                )}

                {feedback.message}
              </div>
            ) : null}
          </section>
        </aside>

        <section className="overflow-hidden rounded-[1.9rem] border border-[#EFDDE3] bg-white shadow-[0_18px_55px_rgba(92,42,60,0.08)]">
          <div className="flex flex-col gap-4 border-b border-[#F1E2E7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[#38282E]">
                Prévisualisation
              </p>

              <p className="mt-0.5 text-xs text-[#927B84]">
                {selectedModel.label}
              </p>
            </div>

            <div className="inline-flex w-fit rounded-xl border border-[#E9D6DD] bg-[#FFF9FA] p-1">
              <button
                type="button"
                onClick={() =>
                  setPreviewMode(
                    "desktop",
                  )
                }
                className={`grid size-9 place-items-center rounded-lg transition ${
                  previewMode ===
                  "desktop"
                    ? "bg-white text-[#A5526D] shadow-sm"
                    : "text-[#9A8189]"
                }`}
                aria-label="Aperçu ordinateur"
              >
                <Monitor className="size-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setPreviewMode(
                    "mobile",
                  )
                }
                className={`grid size-9 place-items-center rounded-lg transition ${
                  previewMode ===
                  "mobile"
                    ? "bg-white text-[#A5526D] shadow-sm"
                    : "text-[#9A8189]"
                }`}
                aria-label="Aperçu mobile"
              >
                <Smartphone className="size-4" />
              </button>
            </div>
          </div>

          <div className="min-h-[760px] bg-[#F7F1F3] p-4 sm:p-7 lg:p-10">
            <div
              className={`mx-auto transition-all duration-300 ${
                previewMode ===
                "mobile"
                  ? "max-w-[390px]"
                  : "max-w-[680px]"
              }`}
            >
              <EmailPreview
                model={
                  selectedModel
                }
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function EmailPreview({
  model,
}: {
  model: EmailModel;
}) {
  return (
    <div>
      <div className="mb-5 flex justify-center">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-[1.4rem] bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_14px_30px_rgba(132,63,89,0.24)]">
            <Sparkles className="size-6" />
          </div>

          <p className="mt-3 font-serif text-lg font-semibold text-[#3A2930]">
            Le Palais des Ongles
          </p>
        </div>
      </div>

      <article className="overflow-hidden rounded-[28px] border border-[#E7D7DC] bg-white shadow-[0_18px_50px_rgba(74,43,54,0.10)]">
        <header
          className="px-6 py-9 text-center sm:px-8"
          style={{
            background: `linear-gradient(135deg, ${model.accentSoft}, #ffffff)`,
          }}
        >
          <div
            className="mx-auto mb-4 grid size-12 place-items-center rounded-full text-xl font-bold text-white"
            style={{
              backgroundColor:
                model.accent,
            }}
          >
            {model.icon}
          </div>

          <p
            className="mb-2 text-[11px] font-black uppercase tracking-[0.18em]"
            style={{
              color:
                model.accent,
            }}
          >
            {model.eyebrow}
          </p>

          <h2 className="font-serif text-[28px] font-medium leading-tight text-[#35262C]">
            {model.title}
          </h2>
        </header>

        <div className="px-6 pb-8 pt-8 sm:px-9">
          <p className="font-serif text-xl text-[#35262C]">
            Bonjour Élodie,
          </p>

          <p className="mt-3 text-sm leading-7 text-[#76626A]">
            {model.intro}
          </p>

          <span
            className="mt-5 inline-flex rounded-full border px-3 py-2 text-[11px] font-black"
            style={{
              color:
                model.accent,
              backgroundColor:
                model.accentSoft,
              borderColor:
                `${model.accent}33`,
            }}
          >
            {model.badge}
          </span>

          <div className="mt-6 overflow-hidden rounded-[20px] border border-[#EEDFE4] bg-[#FFF9FB] px-5">
            <PreviewDetail
              icon={
                <RefreshCw className="size-4" />
              }
              label="Référence"
              value="TEST-EMAIL-001"
            />

            <PreviewDetail
              icon={
                <CalendarClock className="size-4" />
              }
              label="Date"
              value="Vendredi 31 juillet 2026"
            />

            <PreviewDetail
              icon={
                <Clock3 className="size-4" />
              }
              label="Heure"
              value="14:30"
            />

            <PreviewDetail
              icon={
                <Sparkles className="size-4" />
              }
              label="Prestations"
              value="Pose complète gel, Nail art"
            />

            <PreviewDetail
              icon={
                <UserRound className="size-4" />
              }
              label="Professionnelle"
              value="Le Palais des Ongles"
              last
            />
          </div>

          <div className="mt-7 text-center">
            <span
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-bold text-white shadow-lg"
              style={{
                backgroundColor:
                  model.accent,
              }}
            >
              Gérer mon rendez-vous
              <ExternalLink className="size-3.5" />
            </span>
          </div>

          <p className="mt-7 text-center text-sm leading-6 text-[#76626A]">
            {model.closing}
          </p>

          <div className="mt-8 rounded-[18px] bg-[#F8F3F5] p-5 text-center">
            <p className="font-serif text-base font-semibold text-[#4C3940]">
              Le Palais des Ongles
            </p>

            <p className="mt-2 text-xs leading-5 text-[#7F6B73]">
              Votre salon de beauté
            </p>

            <p
              className="mt-3 text-xs font-bold"
              style={{
                color:
                  model.accent,
              }}
            >
              Visiter notre site
            </p>
          </div>
        </div>
      </article>

      <p className="mt-5 text-center text-[11px] leading-5 text-[#A08D94]">
        Cet e-mail concerne votre rendez-vous auprès de
        Le Palais des Ongles.
      </p>
    </div>
  );
}

function PreviewDetail({
  icon,
  label,
  value,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 py-4 ${
        last
          ? ""
          : "border-b border-[#F0E3E7]"
      }`}
    >
      <span className="mt-0.5 text-[#B16B82]">
        {icon}
      </span>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#9A8189]">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold leading-6 text-[#35262C]">
          {value}
        </p>
      </div>
    </div>
  );
}
