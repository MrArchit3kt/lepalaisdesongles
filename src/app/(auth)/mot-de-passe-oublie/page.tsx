import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Le Palais des Ongles",
  description: "Réinitialisez le mot de passe de votre espace cliente.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
