"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

import { changeClientPasswordAction } from "@/features/client/actions/change-client-password.action";

import {
  initialChangeClientPasswordActionState,
  type ChangeClientPasswordFieldErrors,
} from "@/features/client/schemas/client-profile.schema";

type PasswordFieldName = keyof ChangeClientPasswordFieldErrors;

type PasswordInputProps = {
  id: PasswordFieldName;
  label: string;
  autoComplete: string;
  placeholder: string;
  disabled: boolean;
  errors: ChangeClientPasswordFieldErrors;
};

function getFirstError(
  errors: ChangeClientPasswordFieldErrors,
  fieldName: PasswordFieldName,
): string | null {
  return errors[fieldName]?.[0] ?? null;
}

function PasswordInput({
  id,
  label,
  autoComplete,
  placeholder,
  disabled,
  errors,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const error = getFirstError(errors, id);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-zinc-800">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />

        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            "h-12 w-full rounded-2xl border bg-white pl-11 pr-12 text-sm text-zinc-950 outline-none transition",
            "placeholder:text-zinc-400",
            "focus:border-rose-300 focus:ring-4 focus:ring-rose-100",
            "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
            error ? "border-red-300 ring-4 ring-red-50" : "border-zinc-200",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={() => {
            setVisible((currentValue) => !currentValue);
          }}
          disabled={disabled}
          className="absolute right-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-start gap-2 text-sm text-red-600"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState(
    changeClientPasswordAction,
    initialChangeClientPasswordActionState,
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.status === "SUCCESS") {
      formRef.current?.reset();

      toast.success(state.message);

      const timeoutId = window.setTimeout(() => {
        void signOut({
          callbackUrl: "/connexion?password-changed=1",
        });
      }, 1800);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    if (state.status === "ERROR") {
      toast.error(state.message);
    }

    return undefined;
  }, [state.message, state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-[28px] border border-zinc-200/80 bg-white p-5 shadow-[0_18px_55px_-35px_rgba(24,24,27,0.28)] sm:p-7"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-pink-50 text-rose-700 shadow-sm">
          <KeyRound className="size-5" />
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold text-[#35242B]">
            Modifier mon mot de passe
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            Choisis un mot de passe unique et difficile à deviner pour protéger
            ton compte.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-sky-700" />

          <div>
            <p className="text-sm font-semibold text-sky-950">
              Sécurité du compte
            </p>

            <p className="mt-1 text-sm leading-6 text-sky-800">
              Après la modification, toutes les sessions existantes seront
              invalidées et tu seras automatiquement déconnectée.
            </p>
          </div>
        </div>
      </div>

      {state.message ? (
        <div
          className={[
            "mt-5 flex items-start gap-3 rounded-2xl border p-4 text-sm",
            state.status === "SUCCESS"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {state.status === "SUCCESS" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
          )}

          <p className="leading-6">{state.message}</p>
        </div>
      ) : null}

      <div className="mt-7 space-y-5">
        <PasswordInput
          id="currentPassword"
          label="Mot de passe actuel"
          autoComplete="current-password"
          placeholder="Saisis ton mot de passe actuel"
          disabled={pending}
          errors={state.fieldErrors}
        />

        <PasswordInput
          id="newPassword"
          label="Nouveau mot de passe"
          autoComplete="new-password"
          placeholder="12 caractères minimum"
          disabled={pending}
          errors={state.fieldErrors}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirmer le nouveau mot de passe"
          autoComplete="new-password"
          placeholder="Saisis une nouvelle fois le mot de passe"
          disabled={pending}
          errors={state.fieldErrors}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm font-semibold text-zinc-900">
          Le nouveau mot de passe doit contenir :
        </p>

        <div className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            12 caractères minimum
          </p>

          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Une lettre majuscule
          </p>

          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Une lettre minuscule
          </p>

          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Un chiffre
          </p>

          <p className="flex items-center gap-2 sm:col-span-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Un caractère spécial
          </p>
        </div>
      </div>

      <div className="mt-7 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 text-sm font-bold text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Modification…
            </>
          ) : (
            <>
              <KeyRound className="size-4" />
              Modifier mon mot de passe
            </>
          )}
        </button>
      </div>
    </form>
  );
}
