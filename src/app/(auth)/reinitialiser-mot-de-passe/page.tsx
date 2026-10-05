import type { Metadata } from "next";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Nouveau mot de passe | Le Palais des Ongles",
  description: "Choisissez un nouveau mot de passe pour votre espace cliente.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return <ResetPasswordForm token={token?.trim() || null} />;
}
