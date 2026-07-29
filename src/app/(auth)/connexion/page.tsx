import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Connexion | Le Palais des Ongles",
  description:
    "Connectez-vous à votre espace cliente Le Palais des Ongles.",
};

export default function LoginPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#A06F81]">
          Espace personnel
        </p>

        <h1 className="font-serif text-4xl text-[#241A1D] sm:text-5xl">
          Bon retour parmi nous
        </h1>

        <p className="mt-4 leading-7 text-[#75636A]">
          Connectez-vous pour gérer vos rendez-vous,
          envoyer vos inspirations et contacter le salon.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-80 animate-pulse rounded-3xl bg-[#FFF4F3]" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
