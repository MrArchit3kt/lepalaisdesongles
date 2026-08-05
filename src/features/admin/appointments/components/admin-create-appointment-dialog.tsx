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

type AvailabilitySlot = {
  startsAt: string;
  endsAt: string;
  label: string;
  staff: { id: string; displayName: string };
  workstation: { id: string; name: string };
};

type AvailabilityResponse = {
  slots?: AvailabilitySlot[];
  totalPriceCents?: number;
  depositCents?: number;
  message?: string;
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

function formatSlotDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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

  // Étape 3 — créneau
  const [date, setDate] = useState(todayIsoDate());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [depositCents, setDepositCents] = useState(0);
  const [totalPriceCents, setTotalPriceCents] = useState(0);

  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.has(service.id)),
    [services, selectedServiceIds],
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
  /*                       CRÉNEAUX DISPONIBLES                           */
  /* -------------------------------------------------------------------- */

  function loadSlots(): void {
    if (selectedServiceIds.size === 0) {
      return;
    }

    setIsLoadingSlots(true);
    setSlotsMessage(null);
    setSelectedSlot(null);

    const params = new URLSearchParams();

    params.set("date", date);

    for (const serviceId of selectedServiceIds) {
      params.append("serviceId", serviceId);
    }

    fetch(`/api/availability?${params.toString()}`)
      .then((response) => response.json() as Promise<AvailabilityResponse>)
      .then((payload) => {
        setSlots(payload.slots ?? []);
        setDepositCents(payload.depositCents ?? 0);
        setTotalPriceCents(payload.totalPriceCents ?? 0);

        if (!payload.slots || payload.slots.length === 0) {
          setSlotsMessage(
            payload.message ??
              "Aucun créneau disponible à cette date pour ces prestations.",
          );
        }
      })
      .catch(() => {
        setSlotsMessage("Impossible de charger les créneaux disponibles.");
      })
      .finally(() => {
        setIsLoadingSlots(false);
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
    setSlots([]);
    setSlotsMessage(null);
    setSelectedSlot(null);
    setDepositCents(0);
    setTotalPriceCents(0);
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
    loadSlots();
  }

  function handleConfirm(): void {
    if (!selectedClient || !selectedSlot || isPending) {
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
            staffId: selectedSlot.staff.id,
            workstationId: selectedSlot.workstation.id,
            startsAt: selectedSlot.startsAt,
            endsAt: selectedSlot.endsAt,
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

              {/* ---------------------------- ÉTAPE CRÉNEAU --------------------------- */}
              {step === "slot" ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-zinc-800">
                      Date
                    </span>

                    <input
                      type="date"
                      value={date}
                      min={todayIsoDate()}
                      onChange={(event) => {
                        setDate(event.target.value);
                      }}
                      onBlur={loadSlots}
                      className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                    />
                  </label>

                  {isLoadingSlots ? (
                    <p className="flex items-center gap-2 text-sm text-zinc-500">
                      <LoaderCircle className="size-4 animate-spin" />
                      Chargement des créneaux...
                    </p>
                  ) : null}

                  {!isLoadingSlots && slotsMessage ? (
                    <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
                      {slotsMessage}
                    </p>
                  ) : null}

                  {!isLoadingSlots && slots.length > 0 ? (
                    <ul className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                      {slots.map((slot) => {
                        const isSelected =
                          selectedSlot?.startsAt === slot.startsAt &&
                          selectedSlot?.staff.id === slot.staff.id;

                        return (
                          <li key={`${slot.startsAt}-${slot.staff.id}`}>
                            <button
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`w-full rounded-2xl border px-3 py-2.5 text-left text-xs transition ${
                                isSelected
                                  ? "border-rose-600 bg-rose-600 text-white"
                                  : "border-zinc-200 bg-white text-zinc-800 hover:border-rose-300"
                              }`}
                            >
                              <span className="flex items-center gap-1.5 font-bold">
                                <Clock3 className="size-3.5" />
                                {formatSlotDate(slot.startsAt)}
                              </span>

                              <span
                                className={`mt-1 block truncate ${
                                  isSelected ? "text-white/80" : "text-zinc-500"
                                }`}
                              >
                                {slot.staff.displayName}
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
              selectedSlot ? (
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
                      {formatSlotDate(selectedSlot.startsAt)} avec{" "}
                      {selectedSlot.staff.displayName}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3">
                      <span className="text-sm font-bold text-zinc-800">
                        Total
                      </span>

                      <span className="text-sm font-black text-zinc-950">
                        {formatEuros(totalPriceCents)}
                      </span>
                    </div>

                    {depositCents > 0 ? (
                      <div className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
                        Un lien de paiement PayPal pour l’acompte de{" "}
                        <strong>{formatEuros(depositCents)}</strong> sera
                        envoyé automatiquement par e-mail à la cliente. Le
                        rendez-vous sera confirmé dès réception du paiement.
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                        <CheckCircle2 className="size-4 shrink-0" />
                        Aucun acompte requis : le rendez-vous sera confirmé
                        immédiatement.
                      </div>
                    )}
                  </div>
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
                  Voir les créneaux
                </button>
              ) : null}

              {step === "slot" ? (
                <button
                  type="button"
                  disabled={!selectedSlot}
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
