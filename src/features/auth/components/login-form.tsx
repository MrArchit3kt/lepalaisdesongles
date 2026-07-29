"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  loginSchema,
  type LoginInput,
} from "@/features/auth/schemas/login.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (!result || result.error) {
      toast.error("Connexion impossible", {
        description:
          "L’adresse e-mail ou le mot de passe est incorrect, ou le compte est désactivé.",
      });

      return;
    }

    toast.success("Connexion réussie", {
      description: "Bienvenue au Palais des Ongles.",
    });

    const requestedCallbackUrl =
      searchParams.get("callbackUrl");

    const callbackUrl =
      requestedCallbackUrl?.startsWith("/")
        ? requestedCallbackUrl
        : "/redirection-apres-connexion";

    router.push(callbackUrl);
    router.refresh();
  }

  return (
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

      <div className="space-y-2">
        <div className="relative">
          <FormField
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            icon={<LockKeyhole className="size-4" />}
            error={errors.password?.message}
            required
            className="pr-12"
            {...register("password")}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((current) => !current)
            }
            className="absolute right-4 top-[42px] text-[#7B6970] transition hover:text-[#241A1D]"
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

        <div className="flex justify-end">
          <Link
            href="/mot-de-passe-oublie"
            className="text-sm text-[#8E6675] transition hover:text-[#241A1D]"
          >
            Mot de passe oublié ?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        isLoading={isSubmitting}
        className="w-full"
      >
        Se connecter
      </Button>

      <p className="text-center text-sm text-[#716168]">
        Vous n’avez pas encore de compte ?{" "}

        <Link
          href="/inscription"
          className="font-semibold text-[#9D6F80] hover:text-[#241A1D]"
        >
          Créer mon compte
        </Link>
      </p>
    </form>
  );
}
