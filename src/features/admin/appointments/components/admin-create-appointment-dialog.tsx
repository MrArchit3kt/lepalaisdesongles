"use client";

import {
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  LoaderCircle,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminServiceOption = {
  id: string;
  name: string;
  categoryName: string;
  priceCents: number | null;
  durationMinutes: number;
};

type Props = {
  services: AdminServiceOption[];
};

type Step = "client" | "services" | "slot" | "confirm";

type ClientResult = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
};

type ClientSearchResponse = {
  clients?: ClientResult[];
  error?: string;
};

type StaffOption = {
  staffId: string;
  displayName: string;
  totalDurationMinutes: number;
  cleanupMinutes: number;
  totalPriceCents: number;
  depositCents: number;
  workstationId: string | null;
};

type StaffOptionsResponse = {
  staff?: StaffOption[];
  error?: string;
};

type CreateAppointmentResponse = {
  success?: boolean;
  message?: string;
  error?: string;

  appointment?: {
    reference: string;
    requiresPayment: boolean;
  };
};

type PaymentOption = "ONLINE" | "ALREADY_PAID";

type OfflinePaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";

const OFFLINE_PAYMENT_METHOD_LABELS: Record<OfflinePaymentMethod, string> = {
  CASH: "Espèces",
  CARD: "Carte bancaire",
  BANK_TRANSFER: "Virement",
  OTHER: "Autre",
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatEuros(cents: number | null): string {
  if (cents === null) {
    return "Sur devis";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function todayIsoDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
  }).format(new Date());
}

const DEFAULT_TIME = "10:00";

/*
 * Formate une date calendaire "YYYY-MM-DD" sans jamais passer par le
 * fuseau horaire du navigateur (on force UTC minuit), afin que
 * l'aperçu affiché à l'admin corresponde toujours au jour saisi.
 */
function formatCalendarDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function AdminCreateAppointmentDialog({ services }: Props) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("client");
  const [isPending, startTransition] = useTransition();

  // Étape 1 — cliente
  const [clientQuery, setClientQuery] = useState("");
  const [fetchedClientResults, setFetchedClientResults] = useState<
    ClientResult[]
  >([]);
  const [isSearchingClients, setIsSearchingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientResult | null>(
    null,
  );

  // Une requête trop courte n'a jamais été envoyée : on n'affiche donc
  // jamais d'anciens résultats obsolètes, sans avoir à réinitialiser
  // l'état de façon synchrone dans l'effet de recherche ci-dessous.
  const clientResults = useMemo(
    () => (clientQuery.trim().length < 2 ? [] : fetchedClientResults),
    [clientQuery, fetchedClientResults],
  );

  // Étape 2 — prestations
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(
    new Set(),
  );

  // Étape 3 — professionnelle & horaire
  const [date, setDate] = useState(todayIsoDate());
  const [time, setTime] = useState(DEFAULT_TIME);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [staffMessage, setStaffMessage] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  // Étape 4 — confirmation (paiement de l'acompte)
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("ONLINE");
  const [offlinePaymentMethod, setOfflinePaymentMethod] =
    useState<OfflinePaymentMethod>("CASH");

  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.has(service.id)),
    [services, selectedServiceIds],
  );

  const selectedStaff = useMemo(
    () => staffOptions.find((staff) => staff.staffId === selectedStaffId) ?? null,
    [staffOptions, selectedStaffId],
  );

  /* -------------------------------------------------------------------- */
  /*                        RECHERCHE DE CLIENTES                         */
  /* -------------------------------------------------------------------- */

  useEffect(() => {
    const query = clientQuery.trim();

    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      setIsSearchingClients(true);

      fetch(`/api/admin/clients/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((response) => response.json() as Promise<ClientSearchResponse>)
        .then((payload) => {
          setFetchedClientResults(payload.clients ?? []);
        })
        .catch(() => {
          // Une recherche annulée (nouvelle frappe) n'est pas une erreur.
        })
        .finally(() => {
          setIsSearchingClients(false);
        });
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [clientQuery]);

  /* -------------------------------------------------------------------- */
  /*                    PROFESSIONNELLES DISPONIBLES                      */
  /* -------------------------------------------------------------------- */

  /*
   * Contrairement au tunnel de réservation public, cette liste ignore
   * volontairement les réglages de réservation en ligne et les
   * horaires configurés : une professionnelle créant un rendez-vous
   * manuellement doit pouvoir planifier n'importe quelle membre de
   * l'équipe compatible avec les prestations choisies, à n'importe
   * quelle heure. Seul un vrai chevauchement de planning sera bloqué
   * à la création (voir handleConfirm).
   */
  function loadStaffOptions(): void {
    if (selectedServiceIds.size === 0) {
      return;
    }

    setIsLoadingStaff(true);
    setStaffMessage(null);
    setSelectedStaffId(null);

    const params = new URLSearchParams();

    for (const serviceId of selectedServiceIds) {
      params.append("serviceId", serviceId);
    }

    fetch(`/api/admin/appointments/staff-options?${params.toString()}`)
      .then(async (response) => {
        const payload = (await response.json()) as StaffOptionsResponse;

        if (!response.ok) {
          throw new Error(
            payload.error ??
              "Impossible de charger les professionnelles disponibles.",
          );
        }

        return payload;
      })
      .then((payload) => {
        const options = payload.staff ?? [];

        setStaffOptions(options);

        if (options.length === 0) {
          setStaffMessage(
            "Aucune professionnelle ne réalise toutes les prestations sélectionnées.",
          );
        }
      })
      .catch((error: unknown) => {
        setStaffOptions([]);

        setStaffMessage(
          error instanceof Error
            ? error.message
            : "Impossible de charger les professionnelles disponibles.",
        );
      })
      .finally(() => {
        setIsLoadingStaff(false);
      });
  }

  /* -------------------------------------------------------------------- */
  /*                                NAVIGATION                            */
  /* -------------------------------------------------------------------- */

  function resetDialog(): void {
    setStep("client");
    setClientQuery("");
    setFetchedClientResults([]);
    setSelectedClient(null);
    setSelectedServiceIds(new Set());
    setDate(todayIsoDate());
    setTime(DEFAULT_TIME);
    setStaffOptions([]);
    setStaffMessage(null);
    setSelectedStaffId(null);
    setPaymentOption("ONLINE");
    setOfflinePaymentMethod("CASH");
  }

  function closeDialog(): void {
    if (isPending) {
      return;
    }

    setIsOpen(false);
    resetDialog();
  }

  function toggleService(serviceId: string): void {
    setSelectedServiceIds((current) => {
      const next = new Set(current);

      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }

      return next;
    });
  }

  function goToSlotStep(): void {
    if (selectedServiceIds.size === 0) {
      toast.error("Sélectionnez au moins une prestation.");

      return;
    }

    setStep("slot");
    loadStaffOptions();
  }

  function handleConfirm(): void {
    if (!selectedClient || !selectedStaffId || isPending) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/appointments/create", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            clientId: selectedClient.id,
            serviceIds: Array.from(selectedServiceIds),
            staffId: selectedStaffId,
            date,
            time,
            paymentOption,

            paymentMethod:
              paymentOption === "ALREADY_PAID" ? offlinePaymentMethod : undefined,
          }),
        });

        const payload = (await response.json()) as CreateAppointmentResponse;

        if (!response.ok || payload.success !== true) {
          throw new Error(
            payload.error ?? "Impossible de créer le rendez-vous.",
          );
        }

        toast.success(
          payload.message ?? "Le rendez-vous a été créé avec succès.",
        );

        closeDialog();
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de créer le rendez-vous.",
        );
      }
    });
  }

  /* -------------------------------------------------------------------- */
  /*                                  RENDU                                */
  /* -------------------------------------------------------------------- */

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700"
      >
        <CalendarPlus className="size-4" aria-hidden="true" />
        Nouveau rendez-vous
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
            aria-labelledby="admin-create-appointment-title"
            className="relative z-10 flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl"
          >
            <header className="flex shrink-0 items-start justify-between gap-5 border-b border-zinc-200 bg-gradient-to-r from-rose-50 via-white to-pink-50 px-5 py-5 sm:px-7">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-600 text-white shadow-sm">
                  <CalendarPlus className="size-6" aria-hidden="true" />
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600">
                    Rendez-vous manuel
                  </p>

                  <h2
                    id="admin-create-appointment-title"
                    className="mt-1 text-xl font-black text-zinc-950 sm:text-2xl"
                  >
                    Nouveau rendez-vous
                  </h2>
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

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
              {/* --------------------------- ÉTAPE CLIENTE --------------------------- */}
              {step === "client" ? (
                <div className="space-y-4">
                  <label className="relative block">
                    <span className="mb-2 block text-sm font-bold text-zinc-800">
                      Rechercher une cliente
                    </span>

                    <Search className="pointer-events-none absolute left-4 top-[42px] size-5 -translate-y-1/2 text-zinc-400" />

                    <input
                      type="search"
                      value={clientQuery}
                      onChange={(event) => setClientQuery(event.target.value)}
                      placeholder="Nom, prénom ou e-mail..."
                      autoFocus
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-12 pr-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                    />
                  </label>

                  {isSearchingClients ? (
                    <p className="flex items-center gap-2 text-sm text-zinc-500">
                      <LoaderCircle className="size-4 animate-spin" />
                      Recherche en cours...
                    </p>
                  ) : null}

                  {!isSearchingClients &&
                  clientQuery.trim().length >= 2 &&
                  clientResults.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      Aucune cliente trouvée avec un compte actif.
                    </p>
                  ) : null}

                  <ul className="space-y-2">
                    {clientResults.map((client) => (
                      <li key={client.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClient(client);
                            setStep("services");
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left transition hover:border-rose-300 hover:bg-rose-50"
                        >
                          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700">
                            <UserRound className="size-5" />
                          </span>

                          <span className="min-w-0">
                            <span className="block truncate font-bold text-zinc-950">
                              {client.firstName} {client.lastName}
                            </span>

                            <span className="block truncate text-xs text-zinc-500">
                              {client.email}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* -------------------------- ÉTAPE PRESTATIONS ------------------------- */}
              {step === "services" && selectedClient ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rose-600 text-white">
                      <UserRound className="size-4" />
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-zinc-950">
                        {selectedClient.firstName} {selectedClient.lastName}
                      </span>

                      <span className="block truncate text-xs text-zinc-500">
                        {selectedClient.email}
                      </span>
                    </span>
                  </div>

                  <p className="text-sm font-bold text-zinc-800">
                    Sélectionnez les prestations
                  </p>

                  <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {services.map((service) => {
                      const isChecked = selectedServiceIds.has(service.id);

                      return (
                        <li key={service.id}>
                          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-rose-300">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleService(service.id)}
                              className="size-4 accent-rose-600"
                            />

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold text-zinc-950">
                                {service.name}
                              </span>

                              <span className="block text-xs text-zinc-500">
                                {service.categoryName} ·{" "}
                                {service.durationMinutes} min
                              </span>
                            </span>

                            <span className="shrink-0 text-sm font-bold text-zinc-800">
                              {formatEuros(service.priceCents)}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {/* ------------------------- ÉTAPE PROFESSIONNELLE ----------------------- */}
              {step === "slot" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Date
                      </span>

                      <input
                        type="date"
                        value={date}
                        min={todayIsoDate()}
                        onChange={(event) => setDate(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-zinc-800">
                        Heure
                      </span>

                      <input
                        type="time"
                        value={time}
                        onChange={(event) => setTime(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                      />
                    </label>
                  </div>

                  <p className="text-sm font-bold text-zinc-800">
                    Sélectionnez une professionnelle
                  </p>

                  <p className="text-xs text-zinc-500">
                    Toutes les professionnelles réalisant ces prestations sont
                    proposées, y compris en dehors de leurs disponibilités
                    habituelles. Seul un rendez-vous déjà existant sur ce
                    créneau sera bloqué.
                  </p>

                  {isLoadingStaff ? (
                    <p className="flex items-center gap-2 text-sm text-zinc-500">
                      <LoaderCircle className="size-4 animate-spin" />
                      Chargement des professionnelles...
                    </p>
                  ) : null}

                  {!isLoadingStaff && staffMessage ? (
                    <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
                      {staffMessage}
                    </p>
                  ) : null}

                  {!isLoadingStaff && staffOptions.length > 0 ? (
                    <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {staffOptions.map((staff) => {
                        const isSelected = selectedStaffId === staff.staffId;

                        return (
                          <li key={staff.staffId}>
                            <button
                              type="button"
                              onClick={() => setSelectedStaffId(staff.staffId)}
                              className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                                isSelected
                                  ? "border-rose-600 bg-rose-600 text-white"
                                  : "border-zinc-200 bg-white text-zinc-800 hover:border-rose-300"
                              }`}
                            >
                              <span className="min-w-0">
                                <span className="flex items-center gap-1.5 font-bold">
                                  <UserRound className="size-3.5 shrink-0" />
                                  <span className="truncate">
                                    {staff.displayName}
                                  </span>
                                </span>

                                <span
                                  className={`mt-1 flex items-center gap-1 text-xs ${
                                    isSelected ? "text-white/80" : "text-zinc-500"
                                  }`}
                                >
                                  <Clock3 className="size-3 shrink-0" />
                                  {staff.totalDurationMinutes} min
                                </span>
                              </span>

                              <span className="shrink-0 text-sm font-bold">
                                {formatEuros(staff.totalPriceCents)}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              {/* --------------------------- ÉTAPE CONFIRMATION ----------------------- */}
              {step === "confirm" &&
              selectedClient &&
              selectedStaff ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-zinc-500">
                      Cliente
                    </p>

                    <p className="mt-1 text-sm font-bold text-zinc-950">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </p>

                    <p className="mt-3 text-xs font-black uppercase tracking-[0.15em] text-zinc-500">
                      Prestations
                    </p>

                    <p className="mt-1 text-sm text-zinc-800">
                      {selectedServices.map((service) => service.name).join(", ")}
                    </p>

                    <p className="mt-3 text-xs font-black uppercase tracking-[0.15em] text-zinc-500">
                      Créneau
                    </p>

                    <p className="mt-1 text-sm text-zinc-800">
                      {formatCalendarDate(date)} à {time} avec{" "}
                      {selectedStaff.displayName}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3">
                      <span className="text-sm font-bold text-zinc-800">
                        Total
                      </span>

                      <span className="text-sm font-black text-zinc-950">
                        {formatEuros(selectedStaff.totalPriceCents)}
                      </span>
                    </div>

                    {selectedStaff.depositCents === 0 ? (
                      <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                        <CheckCircle2 className="size-4 shrink-0" />
                        Aucun acompte requis : le rendez-vous sera confirmé
                        immédiatement.
                      </div>
                    ) : null}
                  </div>

                  {selectedStaff.depositCents > 0 ? (
                    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-zinc-500">
                        Acompte de {formatEuros(selectedStaff.depositCents)}
                      </p>

                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                          paymentOption === "ONLINE"
                            ? "border-rose-600 bg-rose-50"
                            : "border-zinc-200 hover:border-rose-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentOption === "ONLINE"}
                          onChange={() => setPaymentOption("ONLINE")}
                          className="mt-1 size-4 accent-rose-600"
                        />

                        <span>
                          <span className="block text-sm font-bold text-zinc-950">
                            Envoyer un lien de paiement à la cliente
                          </span>

                          <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                            Un e-mail avec un lien de paiement PayPal est
                            envoyé immédiatement. La cliente a 24h pour régler
                            l’acompte, sans quoi le rendez-vous sera
                            automatiquement annulé.
                          </span>
                        </span>
                      </label>

                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                          paymentOption === "ALREADY_PAID"
                            ? "border-rose-600 bg-rose-50"
                            : "border-zinc-200 hover:border-rose-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentOption === "ALREADY_PAID"}
                          onChange={() => setPaymentOption("ALREADY_PAID")}
                          className="mt-1 size-4 accent-rose-600"
                        />

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-zinc-950">
                            L’acompte a déjà été réglé en institut
                          </span>

                          <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                            Le rendez-vous est confirmé immédiatement ; la
                            cliente reçoit l’e-mail de confirmation avec les
                            rappels habituels.
                          </span>

                          {paymentOption === "ALREADY_PAID" ? (
                            <select
                              value={offlinePaymentMethod}
                              onChange={(event) =>
                                setOfflinePaymentMethod(
                                  event.target.value as OfflinePaymentMethod,
                                )
                              }
                              className="mt-3 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                            >
                              {Object.entries(OFFLINE_PAYMENT_METHOD_LABELS).map(
                                ([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ),
                              )}
                            </select>
                          ) : null}
                        </span>
                      </label>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-200 px-5 py-4 sm:px-7">
              {step !== "client" ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (step === "services") setStep("client");
                    if (step === "slot") setStep("services");
                    if (step === "confirm") setStep("slot");
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50"
                >
                  <ChevronLeft className="size-4" />
                  Retour
                </button>
              ) : (
                <span />
              )}

              {step === "services" ? (
                <button
                  type="button"
                  onClick={goToSlotStep}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-rose-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-rose-700"
                >
                  Choisir la professionnelle
                </button>
              ) : null}

              {step === "slot" ? (
                <button
                  type="button"
                  disabled={!selectedStaffId || !time}
                  onClick={() => setStep("confirm")}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-rose-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continuer
                </button>
              ) : null}

              {step === "confirm" ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleConfirm}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60"
                >
                  {isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : null}
                  Créer le rendez-vous
                </button>
              ) : null}
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}
