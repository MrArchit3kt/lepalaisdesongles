import type {
  Metadata,
} from "next";

import {
  RegisterForm,
} from "@/features/auth/components/register-form";

import {
  getReferralLinkPreview,
  normalizeReferralToken,
} from "@/features/vip/services/referral-link.service";

export const metadata: Metadata = {
  title:
    "Créer un compte | Le Palais des Ongles",

  description:
    "Créez votre compte cliente pour réserver vos prestations en ligne.",
};

type RegisterPageProps = {
  searchParams: Promise<{
    ref?: string | string[];
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const parameters =
    await searchParams;

  const rawReferralToken =
    Array.isArray(
      parameters.ref,
    )
      ? parameters.ref[0]
      : parameters.ref;

  const normalizedToken =
    normalizeReferralToken(
      rawReferralToken,
    );

  const referral =
    normalizedToken
      ? await getReferralLinkPreview(
          normalizedToken,
        )
      : null;

  const referralInvalid =
    Boolean(
      rawReferralToken,
    ) &&
    referral ===
      null;

  return (
    <div>
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#A06F81]">
          Nouvelle cliente
        </p>

        <h1 className="font-serif text-4xl text-[#241A1D] sm:text-5xl">
          Créez votre espace
        </h1>

        <p className="mt-4 leading-7 text-[#75636A]">
          Réservez plus facilement et retrouvez toutes vos
          informations dans votre espace personnel.
        </p>
      </div>

      <RegisterForm
        referralToken={
          referral?.token ??
          ""
        }
        referrerFirstName={
          referral
            ?.referrerFirstName ??
          null
        }
        referralInvalid={
          referralInvalid
        }
      />
    </div>
  );
}
