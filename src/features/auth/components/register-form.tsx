"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircleAlert,
  Eye,
  EyeOff,
  Gift,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/schemas/register.schema";

type RegisterApiError = {
  success?: boolean;
  message?: string;
  field?: string;

  errors?: Array<{
    field: string;
    message: string;
  }>;
};

type RegisterFormProps = {
  referralToken?: string;
  referrerFirstName?: string | null;
  referralInvalid?: boolean;
};

export function RegisterForm({
  referralToken = "",
  referrerFirstName = null,
  referralInvalid = false,
}: RegisterFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      marketingConsent: false,
      referralToken,
    },
  });

  async function onSubmit(data: RegisterInput) {
    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(data),
        },
      );

      const result =
        (await response.json()) as RegisterApiError;

      if (!response.ok) {
        if (result.field === "email") {
          setError("email", {
            type: "server",
            message:
              result.message ??
              "Cette adresse e-mail est déjà utilisée.",
          });
        }

        result.errors?.forEach((fieldError) => {
          const field =
            fieldError.field as keyof RegisterInput;

          setError(field, {
            type: "server",
            message: fieldError.message,
          });
        });

        toast.error("Inscription impossible", {
          description:
            result.message ??
            "Vérifie les informations du formulaire.",
        });

        return;
      }

      const signInResult = await signIn(
        "credentials",
        {
          email: data.email,
          password: data.password,
          redirect: false,
        },
      );

      if (signInResult?.error) {
        toast.success("Demande prise en compte", {
          description:
            "Vous pouvez maintenant essayer de vous connecter avec vos identifiants.",
        });

        router.push(
          "/connexion?registered=1",
        );

        return;
      }

      toast.success("Bienvenue !", {
        description:
          "Votre espace cliente est maintenant disponible.",
      });

      router.push("/espace-client");
      router.refresh();
    } catch (error) {
      console.error("[REGISTER_FORM]", error);

      toast.error("Erreur de connexion", {
        description:
          "Le serveur ne répond pas. Réessaie dans quelques instants.",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <input
        type="hidden"
        {...register("referralToken")}
      />

      {referrerFirstName ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Gift className="size-5" />
          </span>

          <div>
            <p className="font-semibold text-emerald-950">
              Invitation de {referrerFirstName}
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-700">
              Votre parrainage sera automatiquement enregistré lors de la
              création du compte. Aucun code n’est à saisir.
            </p>
          </div>
        </div>
      ) : null}

      {referralInvalid ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />

          <div>
            <p className="font-semibold text-amber-950">
              Lien de parrainage indisponible
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              Ce lien n’est plus valide ou le programme de parrainage est
              temporairement désactivé. Vous pouvez tout de même créer votre
              compte normalement.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Prénom"
          type="text"
          autoComplete="given-name"
          placeholder="Votre prénom"
          icon={<UserRound className="size-4" />}
          error={errors.firstName?.message}
          required
          {...register("firstName")}
        />

        <FormField
          label="Nom"
          type="text"
          autoComplete="family-name"
          placeholder="Votre nom"
          icon={<UserRound className="size-4" />}
          error={errors.lastName?.message}
          required
          {...register("lastName")}
        />
      </div>

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

      <FormField
        label="Téléphone"
        type="tel"
        autoComplete="tel"
        placeholder="06 12 34 56 78"
        icon={<Phone className="size-4" />}
        error={errors.phone?.message}
        required
        {...register("phone")}
      />

      <div className="relative">
        <FormField
          label="Mot de passe"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          icon={<LockKeyhole className="size-4" />}
          error={errors.password?.message}
          hint="Au moins une majuscule, une minuscule et un chiffre."
          className="pr-12"
          required
          {...register("password")}
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword((current) => !current)
          }
          className="absolute right-4 top-[42px] text-[#6F5962] transition hover:text-[#35242B]"
          aria-label={
            showPassword
              ? "Masquer le mot de passe"
              : "Afficher le mot de passe"
          }
        >
          {showPassword ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>

      <div className="relative">
        <FormField
          label="Confirmation du mot de passe"
          type={
            showConfirmation ? "text" : "password"
          }
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
          onClick={() =>
            setShowConfirmation((current) => !current)
          }
          className="absolute right-4 top-[42px] text-[#6F5962] transition hover:text-[#35242B]"
          aria-label={
            showConfirmation
              ? "Masquer la confirmation"
              : "Afficher la confirmation"
          }
        >
          {showConfirmation ? (
            <EyeOff className="size-5" />
          ) : (
            <Eye className="size-5" />
          )}
        </button>
      </div>

      <div className="space-y-4 rounded-2xl bg-[#FFFAFB] p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-[#A64D69] accent-[#A64D69]"
            {...register("acceptTerms")}
          />

          <span className="text-sm leading-6 text-[#4A3540]">
            J’accepte les{" "}

            <Link
              href="/conditions-generales"
              className="font-medium text-[#A44E69] underline underline-offset-2"
            >
              conditions générales
            </Link>{" "}

            et la{" "}

            <Link
              href="/politique-de-confidentialite"
              className="font-medium text-[#A44E69] underline underline-offset-2"
            >
              politique de confidentialité
            </Link>
            .
          </span>
        </label>

        {errors.acceptTerms?.message ? (
          <p className="text-sm text-red-600">
            {errors.acceptTerms.message}
          </p>
        ) : null}

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-[#A64D69] accent-[#A64D69]"
            {...register("marketingConsent")}
          />

          <span className="text-sm leading-6 text-[#4A3540]">
            Je souhaite recevoir les nouveautés,
            promotions et jeux concours par e-mail.
          </span>
        </label>
      </div>

      <Button
        type="submit"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
      >
        Créer mon compte
      </Button>

      <p className="text-center text-sm text-[#4A3540]">
        Vous possédez déjà un compte ?{" "}

        <Link
          href="/connexion"
          className="font-semibold text-[#A64D69] hover:text-[#35242B]"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
