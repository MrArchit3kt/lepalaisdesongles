"use client";

import { CheckCircle2, Gift, LoaderCircle, Plus, X } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";

type FormValues = {
  amountEuros: string;

  purchaserFirstName: string;
  purchaserLastName: string;
  purchaserEmail: string;

  recipientFirstName: string;
  recipientLastName: string;
  recipientEmail: string;

  personalMessage: string;

  paymentMethod: PaymentMethod;
  validityMonths: string;
  adminNote: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;

  giftCard?: {
    id: string;
    reference: string;
    code: string;
    amountCents: number;
    balanceCents: number;
    expiresAt: string;
  };
};

const INITIAL_VALUES: FormValues = {
  amountEuros: "",

  purchaserFirstName: "",
  purchaserLastName: "",
  purchaserEmail: "",

  recipientFirstName: "",
  recipientLastName: "",
  recipientEmail: "",

  personalMessage: "",

  paymentMethod: "CASH",
  validityMonths: "12",
  adminNote: "",
};

const INPUT_CLASS_NAME =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-60";

const TEXTAREA_CLASS_NAME =
  "w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-60";

function trimOptionalValue(value: string): string | undefined {
  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : undefined;
}

export function AdminCreateGiftCardDialog() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);

  const [copyPurchaser, setCopyPurchaser] = useState(false);

  function updateValue<Key extends keyof FormValues>(
    key: Key,
    value: FormValues[Key],
  ): void {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function closeDialog(): void {
    if (isPending) {
      return;
    }

    setIsOpen(false);
  }

  function resetDialog(): void {
    setValues(INITIAL_VALUES);

    setCopyPurchaser(false);
  }

  function toggleCopyPurchaser(checked: boolean): void {
    setCopyPurchaser(checked);

    setValues((current) => ({
      ...current,

      recipientFirstName: checked
        ? current.purchaserFirstName
        : current.recipientFirstName,

      recipientLastName: checked
        ? current.purchaserLastName
        : current.recipientLastName,

      recipientEmail: checked ? current.purchaserEmail : current.recipientEmail,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const amountEuros = Number(values.amountEuros.replace(",", ".").trim());

    const validityMonths = Number.parseInt(values.validityMonths, 10);

    if (!Number.isFinite(amountEuros)) {
      toast.error("Le montant est invalide.");

      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/gift-cards", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Accept: "application/json",
          },

          body: JSON.stringify({
            amountEuros,

            purchaserFirstName: values.purchaserFirstName,

            purchaserLastName: values.purchaserLastName,

            purchaserEmail: values.purchaserEmail,

            recipientFirstName: values.recipientFirstName,

            recipientLastName: values.recipientLastName,

            recipientEmail: trimOptionalValue(values.recipientEmail),

            personalMessage: trimOptionalValue(values.personalMessage),

            paymentMethod: values.paymentMethod,

            validityMonths,

            adminNote: trimOptionalValue(values.adminNote),
          }),
        });

        const payload = (await response.json()) as ApiResponse;

        if (!response.ok || payload.success !== true || !payload.giftCard) {
          throw new Error(
            payload.error ?? "Impossible de créer la carte cadeau.",
          );
        }

        toast.success(payload.message ?? "La carte cadeau a été créée.");

        const reference = payload.giftCard.reference;

        resetDialog();
        setIsOpen(false);

        router.push(`/admin/cartes-cadeaux/${encodeURIComponent(reference)}`);

        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de créer la carte cadeau.",
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700"
      >
        <Plus className="size-4" aria-hidden="true" />
        Créer une carte
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={closeDialog}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-create-gift-card-title"
            className="relative z-10 flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl"
          >
            <header className="flex shrink-0 items-start justify-between gap-5 border-b border-zinc-200 bg-gradient-to-r from-rose-50 via-white to-pink-50 px-5 py-5 sm:px-7">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-600 text-white shadow-sm">
                  <Gift className="size-6" aria-hidden="true" />
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600">
                    Vente au salon
                  </p>

                  <h2
                    id="admin-create-gift-card-title"
                    className="mt-1 text-xl font-black text-zinc-950 sm:text-2xl"
                  >
                    Créer une carte cadeau
                  </h2>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-600">
                    La carte sera immédiatement payée, activée et utilisable au
                    salon.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                aria-label="Fermer"
                className="grid size-10 shrink-0 place-items-center rounded-full text-zinc-500 transition hover:bg-white hover:text-zinc-950 disabled:opacity-50"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </header>

            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <div className="space-y-8 p-5 sm:p-7">
                <section>
                  <div className="mb-4">
                    <h3 className="font-black text-zinc-950">
                      Carte et paiement
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      Indiquez le montant encaissé et la durée de validité.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Montant
                      </span>

                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          required
                          disabled={isPending}
                          value={values.amountEuros}
                          onChange={(event) =>
                            updateValue("amountEuros", event.target.value)
                          }
                          placeholder="50,00"
                          className={`${INPUT_CLASS_NAME} pr-12`}
                        />

                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center font-bold text-zinc-500">
                          €
                        </span>
                      </div>

                      <span className="mt-2 block text-xs text-zinc-500">
                        De 20 € à 500 €
                      </span>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Moyen de paiement
                      </span>

                      <select
                        required
                        disabled={isPending}
                        value={values.paymentMethod}
                        onChange={(event) =>
                          updateValue(
                            "paymentMethod",
                            event.target.value as PaymentMethod,
                          )
                        }
                        className={INPUT_CLASS_NAME}
                      >
                        <option value="CASH">Espèces</option>

                        <option value="CARD">Carte bancaire au salon</option>

                        <option value="BANK_TRANSFER">Virement bancaire</option>

                        <option value="OTHER">Autre</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Validité
                      </span>

                      <select
                        required
                        disabled={isPending}
                        value={values.validityMonths}
                        onChange={(event) =>
                          updateValue("validityMonths", event.target.value)
                        }
                        className={INPUT_CLASS_NAME}
                      >
                        <option value="3">3 mois</option>

                        <option value="6">6 mois</option>

                        <option value="12">12 mois</option>

                        <option value="18">18 mois</option>

                        <option value="24">24 mois</option>

                        <option value="36">36 mois</option>

                        <option value="60">60 mois</option>
                      </select>
                    </label>
                  </div>
                </section>

                <section className="border-t border-zinc-100 pt-7">
                  <div className="mb-4">
                    <h3 className="font-black text-zinc-950">Acheteur</h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      Personne qui règle la carte cadeau au salon.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Prénom
                      </span>

                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={80}
                        disabled={isPending}
                        value={values.purchaserFirstName}
                        onChange={(event) => {
                          const value = event.target.value;

                          updateValue("purchaserFirstName", value);

                          if (copyPurchaser) {
                            updateValue("recipientFirstName", value);
                          }
                        }}
                        className={INPUT_CLASS_NAME}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Nom
                      </span>

                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={80}
                        disabled={isPending}
                        value={values.purchaserLastName}
                        onChange={(event) => {
                          const value = event.target.value;

                          updateValue("purchaserLastName", value);

                          if (copyPurchaser) {
                            updateValue("recipientLastName", value);
                          }
                        }}
                        className={INPUT_CLASS_NAME}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Adresse e-mail
                      </span>

                      <input
                        type="email"
                        required
                        maxLength={254}
                        disabled={isPending}
                        value={values.purchaserEmail}
                        onChange={(event) => {
                          const value = event.target.value;

                          updateValue("purchaserEmail", value);

                          if (copyPurchaser) {
                            updateValue("recipientEmail", value);
                          }
                        }}
                        placeholder="cliente@exemple.fr"
                        className={INPUT_CLASS_NAME}
                      />
                    </label>
                  </div>
                </section>

                <section className="border-t border-zinc-100 pt-7">
                  <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="font-black text-zinc-950">Bénéficiaire</h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        Personne qui utilisera la carte cadeau.
                      </p>
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={copyPurchaser}
                        disabled={isPending}
                        onChange={(event) =>
                          toggleCopyPurchaser(event.target.checked)
                        }
                        className="size-4 accent-rose-600"
                      />

                      <span className="text-sm font-bold text-zinc-700">
                        Identique à l’acheteur
                      </span>
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Prénom
                      </span>

                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={80}
                        disabled={isPending || copyPurchaser}
                        value={values.recipientFirstName}
                        onChange={(event) =>
                          updateValue("recipientFirstName", event.target.value)
                        }
                        className={INPUT_CLASS_NAME}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Nom
                      </span>

                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={80}
                        disabled={isPending || copyPurchaser}
                        value={values.recipientLastName}
                        onChange={(event) =>
                          updateValue("recipientLastName", event.target.value)
                        }
                        className={INPUT_CLASS_NAME}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Adresse e-mail
                        <span className="ml-1 font-normal text-zinc-500">
                          (facultatif)
                        </span>
                      </span>

                      <input
                        type="email"
                        maxLength={254}
                        disabled={isPending || copyPurchaser}
                        value={values.recipientEmail}
                        onChange={(event) =>
                          updateValue("recipientEmail", event.target.value)
                        }
                        placeholder="beneficiaire@exemple.fr"
                        className={INPUT_CLASS_NAME}
                      />
                    </label>
                  </div>
                </section>

                <section className="border-t border-zinc-100 pt-7">
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Message personnel
                        <span className="ml-1 font-normal text-zinc-500">
                          (facultatif)
                        </span>
                      </span>

                      <textarea
                        rows={5}
                        maxLength={300}
                        disabled={isPending}
                        value={values.personalMessage}
                        onChange={(event) =>
                          updateValue("personalMessage", event.target.value)
                        }
                        placeholder="Un petit message pour le bénéficiaire…"
                        className={TEXTAREA_CLASS_NAME}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Note administrative
                        <span className="ml-1 font-normal text-zinc-500">
                          (facultatif)
                        </span>
                      </span>

                      <textarea
                        rows={5}
                        maxLength={500}
                        disabled={isPending}
                        value={values.adminNote}
                        onChange={(event) =>
                          updateValue("adminNote", event.target.value)
                        }
                        placeholder="Ex. Payée en espèces au salon."
                        className={TEXTAREA_CLASS_NAME}
                      />
                    </label>
                  </div>
                </section>

                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />

                  <p className="text-sm leading-6">
                    Après validation, un code unique sera généré et la carte
                    apparaîtra immédiatement comme active dans la liste.
                  </p>
                </div>
              </div>

              <footer className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isPending}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-black text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 disabled:pointer-events-none disabled:opacity-60"
                >
                  {isPending ? (
                    <LoaderCircle
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Gift className="size-4" aria-hidden="true" />
                  )}

                  {isPending
                    ? "Création en cours…"
                    : "Créer et activer la carte"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
