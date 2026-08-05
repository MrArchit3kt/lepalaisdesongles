import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { ChangePasswordForm } from "@/features/client/components/change-password-form";

import {
  ClientProfileForm,
  type ClientProfileFormData,
} from "@/features/client/components/client-profile-form";

import { prisma } from "@/lib/prisma";

import { requireClientUser } from "@/lib/session";

/* -------------------------------------------------------------------------- */
/*                                  METADATA                                  */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: "Mon profil | Le Palais des Ongles",

  description:
    "Gérez vos informations personnelles, vos préférences et la sécurité de votre compte client.",
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatDateForInput(value: Date | null | undefined): string {
  if (!value) {
    return "";
  }

  const year = value.getUTCFullYear();

  const month = String(value.getUTCMonth() + 1).padStart(2, "0");

  const day = String(value.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitials(firstName: string, lastName: string): string {
  const firstInitial = firstName.trim().charAt(0);

  const lastInitial = lastName.trim().charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase();
}

function getProfileCompletion(profile: ClientProfileFormData): number {
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.email,
    profile.phone,
    profile.birthDate,
    profile.addressLine1,
    profile.postalCode,
    profile.city,
    profile.country,
  ];

  const completedFields = fields.filter(
    (value) => value.trim().length > 0,
  ).length;

  return Math.round((completedFields / fields.length) * 100);
}

function ProfileInformationItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F6E7EB] text-[#8C747D]">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#A6949B]">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium text-[#4A3540]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function ClientProfilePage() {
  const sessionUser = await requireClientUser();

  const user = await prisma.user.findUnique({
    where: {
      id: sessionUser.id,
    },

    select: {
      id: true,

      firstName: true,

      lastName: true,

      email: true,

      phone: true,

      image: true,

      emailVerified: true,

      phoneVerified: true,

      createdAt: true,

      clientProfile: {
        select: {
          birthDate: true,

          addressLine1: true,

          addressLine2: true,

          postalCode: true,

          city: true,

          country: true,

          allergies: true,

          marketingEmail: true,

          marketingSms: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const profile: ClientProfileFormData = {
    firstName: user.firstName,

    lastName: user.lastName,

    email: user.email,

    phone: user.phone ?? "",

    birthDate: formatDateForInput(user.clientProfile?.birthDate),

    addressLine1: user.clientProfile?.addressLine1 ?? "",

    addressLine2: user.clientProfile?.addressLine2 ?? "",

    postalCode: user.clientProfile?.postalCode ?? "",

    city: user.clientProfile?.city ?? "",

    country: user.clientProfile?.country ?? "France",

    allergies: user.clientProfile?.allergies ?? "",

    marketingEmail: user.clientProfile?.marketingEmail ?? false,

    marketingSms: user.clientProfile?.marketingSms ?? false,
  };

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  const initials = getInitials(user.firstName, user.lastName);

  const profileCompletion = getProfileCompletion(profile);

  const memberSince = new Intl.DateTimeFormat("fr-FR", {
    month: "long",

    year: "numeric",
  }).format(user.createdAt);

  const addressSummary = [
    user.clientProfile?.postalCode,
    user.clientProfile?.city,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-5 sm:pt-8">
          <Link
            href="/espace-client"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#6F5962] transition hover:bg-white hover:text-[#35242B] hover:shadow-sm"
          >
            <ArrowLeft className="size-4" />
            Retour à mon espace
          </Link>
        </div>

        <section className="relative mt-5 overflow-hidden rounded-[34px] border border-[#F0DCE3] bg-[#FBF3F5] px-5 py-8 shadow-[0_28px_90px_-55px_rgba(139,64,90,0.5)] sm:px-8 sm:py-10 lg:px-10">
          <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[#E8B3C3]/30 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-[#D89CB0]/25 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69] shadow-sm backdrop-blur">
                <Sparkles className="size-4" />
                Mon compte client
              </div>

              <h1 className="mt-5 max-w-3xl font-serif text-3xl font-semibold tracking-tight text-[#35242B] sm:text-4xl lg:text-5xl">
                Mon profil
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-[#79636C] sm:text-lg">
                Mets à jour tes coordonnées, tes préférences et les informations
                utiles au salon depuis un espace sécurisé.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                  <ShieldCheck className="size-4" />
                  Compte sécurisé
                </div>

                {user.emailVerified ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800">
                    <BadgeCheck className="size-4" />
                    E-mail vérifié
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-xl shadow-[#8B405A]/5 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={fullName}
                    className="size-16 rounded-2xl object-cover shadow-md"
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#AA526E] to-[#8B405A] text-xl font-black text-white shadow-lg shadow-[#8B405A]/25">
                    {initials}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-lg font-serif font-semibold text-[#35242B]">
                    {fullName}
                  </p>

                  <p className="mt-1 truncate text-sm text-[#8C747D]">
                    {user.email}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#A64D69]">
                    Membre depuis {memberSince}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[#4A3540]">
                    Profil complété
                  </p>

                  <p className="text-sm font-black text-[#A64D69]">
                    {profileCompletion} %
                  </p>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F6E7EB]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#AA526E] to-[#8B405A] transition-all"
                    style={{
                      width: `${profileCompletion}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-[#8C747D]">
                  Complète tes informations pour faciliter tes réservations et
                  personnaliser ton expérience.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <div className="min-w-0">
            <ClientProfileForm profile={profile} />

            <div className="mt-8">
              <ChangePasswordForm />
            </div>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24">
            <section className="rounded-[28px] border border-[#F0DCE3] bg-white p-5 shadow-[0_18px_55px_-35px_rgba(53,36,43,0.28)]">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                  <CircleUserRound className="size-5" />
                </div>

                <div>
                  <h2 className="font-serif text-lg font-semibold text-[#35242B]">Aperçu du compte</h2>

                  <p className="text-xs text-[#8C747D]">
                    Informations principales
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <ProfileInformationItem
                  icon={UserRound}
                  label="Identité"
                  value={fullName}
                />

                <ProfileInformationItem
                  icon={Mail}
                  label="E-mail"
                  value={user.email}
                />

                <ProfileInformationItem
                  icon={Phone}
                  label="Téléphone"
                  value={user.phone ?? "Non renseigné"}
                />

                <ProfileInformationItem
                  icon={CalendarDays}
                  label="Naissance"
                  value={
                    profile.birthDate
                      ? new Intl.DateTimeFormat("fr-FR", {
                          dateStyle: "long",
                          timeZone: "UTC",
                        }).format(
                          new Date(`${profile.birthDate}T00:00:00.000Z`),
                        )
                      : "Non renseignée"
                  }
                />

                <ProfileInformationItem
                  icon={MapPin}
                  label="Localisation"
                  value={addressSummary || "Non renseignée"}
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#3B2430] via-[#4A2A3A] to-[#2E1E28] p-5 text-white shadow-xl shadow-[#2E1E28]/15">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
                <KeyRound className="size-5" />
              </div>

              <h2 className="mt-5 font-serif text-lg font-semibold">Protéger mon compte</h2>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Utilise un mot de passe unique et ne le communique jamais, même
                à une personne affirmant travailler pour le salon.
              </p>

              <a
                href="#securite"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#F0C4D3] transition hover:text-white"
              >
                Voir les paramètres de sécurité
                <ChevronRight className="size-4" />
              </a>
            </section>

            <section className="rounded-[28px] border border-[#F0DCE3] bg-[#FFF0F4] p-5">
              <p className="text-sm font-bold text-[#35242B]">
                Besoin de modifier ton e-mail ?
              </p>

              <p className="mt-2 text-sm leading-6 text-[#6F5962]">
                Pour des raisons de sécurité, le changement d’adresse e-mail
                doit être demandé directement auprès du salon.
              </p>

              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#A64D69] transition hover:text-[#35242B]"
              >
                Contacter le salon
                <ChevronRight className="size-4" />
              </Link>
            </section>
          </aside>
        </div>

        <div id="securite" className="scroll-mt-24" />
      </div>
    </main>
  );
}
