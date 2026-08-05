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
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#A44E69]">
          Espace personnel
        </p>

        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#35242B] sm:text-4xl lg:text-5xl">
          Bon retour parmi nous
        </h1>

        <p className="mt-4 leading-7 text-[#79636C]">
          Connectez-vous pour gérer vos rendez-vous,
          envoyer vos inspirations et contacter le salon.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-80 animate-pulse rounded-3xl bg-[#FBF3F5]" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
