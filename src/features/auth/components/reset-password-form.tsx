"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Eye, EyeOff, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/features/auth/schemas/password-reset.schema";

type ResetPasswordFormProps = {
  token: string | null;
};

type ResetPasswordApiError = {
  error?: string;
  code?: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),

    defaultValues: {
      token: token ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordInput) {
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = (await response.json()) as ResetPasswordApiError;

        if (result.code === "INVALID_TOKEN") {
          setTokenError(
            result.error ??
              "Ce lien de réinitialisation est invalide ou a expiré.",
          );

          return;
        }

        toast.error("Réinitialisation impossible", {
          description: result.error ?? "Réessaie dans quelques instants.",
        });

        return;
      }

      toast.success("Mot de passe mis à jour", {
        description: "Tu peux maintenant te connecter avec ton nouveau mot de passe.",
      });

      router.push("/connexion?reset=1");
    } catch (error) {
      console.error("[RESET_PASSWORD_FORM]", error);

      toast.error("Erreur de connexion", {
        description: "Le serveur ne répond pas. Réessaie dans quelques instants.",
      });
    }
  }

  if (!token || tokenError) {
    return (
      <div className="space-y-6 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <CircleAlert className="size-6" />
        </span>

        <div>
          <h1 className="font-serif text-2xl font-semibold text-[#35242B]">
            Lien invalide ou expiré
          </h1>

          <p className="mt-3 leading-7 text-[#79636C]">
            {tokenError ??
              "Ce lien de réinitialisation est invalide ou a expiré. Les liens ne sont valables qu’une heure."}
          </p>
        </div>

        <Link
          href="/mot-de-passe-oublie"
          className="inline-block text-sm font-semibold text-[#A64D69] hover:text-[#35242B]"
        >
          Demander un nouveau lien
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
          Nouveau mot de passe
        </h1>

        <p className="mt-4 leading-7 text-[#79636C]">
          Choisis un nouveau mot de passe pour ton compte.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        <input type="hidden" {...register("token")} />

        <div className="relative">
          <FormField
            label="Nouveau mot de passe"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="12 caractères minimum"
            icon={<LockKeyhole className="size-4" />}
            error={errors.password?.message}
            hint="Majuscule, minuscule, chiffre et caractère spécial."
            className="pr-12"
            required
            {...register("password")}
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-[42px] text-[#6F5962] transition hover:text-[#35242B]"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>

        <div className="relative">
          <FormField
            label="Confirmation du mot de passe"
            type={showConfirmation ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Répétez votre mot de passe"
            icon={<LockKeyhole className="size-4" />}
            error={errors.confirmPassword?.message}
            className="pr-12"
            required
            {...register("confirmPassword")}
          />

          <button
            type="button"
            onClick={() => setShowConfirmation((current) => !current)}
            className="absolute right-4 top-[42px] text-[#6F5962] transition hover:text-[#35242B]"
            aria-label={
              showConfirmation ? "Masquer la confirmation" : "Afficher la confirmation"
            }
          >
            {showConfirmation ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Réinitialiser mon mot de passe
        </Button>
      </form>
    </div>
  );
}
