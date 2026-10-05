"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/features/auth/schemas/password-reset.schema";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: RequestPasswordResetInput) {
    try {
      await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // La réponse de l'API est volontairement identique que le
      // compte existe ou non (anti-énumération) : on affiche donc
      // toujours la même confirmation ici.
      setSentTo(data.email);
    } catch (error) {
      console.error("[FORGOT_PASSWORD_FORM]", error);

      toast.error("Erreur de connexion", {
        description: "Le serveur ne répond pas. Réessaie dans quelques instants.",
      });
    }
  }

  if (sentTo) {
    return (
      <div className="space-y-6 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
          <MailCheck className="size-6" />
        </span>

        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#35242B]">
            Vérifie ta boîte mail
          </h1>

          <p className="mt-3 leading-7 text-[#79636C]">
            Si un compte existe avec l’adresse <b>{sentTo}</b>, tu viens de
            recevoir un lien pour choisir un nouveau mot de passe. Pense à
            vérifier tes courriers indésirables s’il n’arrive pas dans
            quelques minutes.
          </p>
        </div>

        <Link
          href="/connexion"
          className="inline-block text-sm font-semibold text-[#A64D69] hover:text-[#35242B]"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#A44E69]">
          Espace personnel
        </p>

        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#35242B] sm:text-4xl">
          Mot de passe oublié
        </h1>

        <p className="mt-4 leading-7 text-[#79636C]">
          Indique ton adresse e-mail : si un compte existe, tu recevras un
          lien pour choisir un nouveau mot de passe.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        <FormField
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          placeholder="votre@email.fr"
          icon={<Mail className="size-4" />}
          error={errors.email?.message}
          required
          {...register("email")}
        />

        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Envoyer le lien de réinitialisation
        </Button>

        <p className="text-center text-sm text-[#4A3540]">
          <Link
            href="/connexion"
            className="font-semibold text-[#A64D69] hover:text-[#35242B]"
          >
            Retour à la connexion
          </Link>
        </p>
      </form>
    </div>
  );
}
