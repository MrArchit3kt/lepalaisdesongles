"use client";

import {
  CalendarDays,
  Clock3,
  LoaderCircle,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Staff = {
  id: string;
  displayName: string | null;
  color: string | null;

  user: {
    firstName: string;
    lastName: string;
  };
};

type TimeOff = {
  id: string;
  title: string;
  reason: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
};

type StaffTimeOff =
  TimeOff & {
    staff: Staff;
  };

type Override = {
  id: string;
  date: string;
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
};

type StaffOverride =
  Override & {
    staff: Staff;
  };

type Data = {
  staff: Staff[];
  salonTimeOffs: TimeOff[];
  staffTimeOffs: StaffTimeOff[];
  salonOverrides: Override[];
  staffOverrides: StaffOverride[];
};

type ApiResult =
  Data & {
    success?: boolean;
    error?: string;
  };

type Kind =
  | "staff-time-off"
  | "salon-time-off"
  | "salon-override"
  | "staff-override";

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export function AvailabilityExceptionsClient({
  initialData,
}: {
  initialData: Data;
}) {
  const [
    data,
    setData,
  ] = useState(initialData);

  const [
    kind,
    setKind,
  ] =
    useState<Kind>(
      "salon-time-off",
    );

  const [
    allDay,
    setAllDay,
  ] = useState(true);

  const [
    pending,
    startTransition,
  ] = useTransition();

  const isTimeOff =
    kind.endsWith(
      "time-off",
    );

  const needsStaff =
    kind.startsWith(
      "staff",
    );

  const isSalonClosure =
    kind ===
    "salon-time-off";

  function submit(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    const formElement =
      event.currentTarget;

    const form =
      new FormData(
        formElement,
      );

    let payload: Record<
      string,
      unknown
    >;

    try {
      if (isTimeOff) {
        const startDate =
          String(
            form.get(
              "startDate",
            ),
          );

        const endDate =
          String(
            form.get(
              "endDate",
            ),
          );

        const startTime =
          allDay
            ? "00:00"
            : String(
                form.get(
                  "startTime",
                ),
              );

        const endTime =
          allDay
            ? "23:59"
            : String(
                form.get(
                  "endTime",
                ),
              );

        if (
          !startDate ||
          !endDate
        ) {
          throw new Error(
            "Sélectionnez une date de début et une date de fin.",
          );
        }

        const startsAt =
          createLocalDate(
            startDate,
            startTime,
          );

        const endsAt =
          createLocalDate(
            endDate,
            endTime,
          );

        if (
          startsAt >=
          endsAt
        ) {
          throw new Error(
            "La date de fin doit être postérieure à la date de début.",
          );
        }

        payload = {
          staffId:
            kind ===
            "staff-time-off"
              ? String(
                  form.get(
                    "staffId",
                  ),
                )
              : undefined,

          title:
            String(
              form.get(
                "title",
              ),
            ),

          reason:
            String(
              form.get(
                "reason",
              ) ?? "",
            ).trim() ||
            null,

          startsAt:
            startsAt.toISOString(),

          endsAt:
            endsAt.toISOString(),

          allDay,
        };
      } else {
        const isOpen =
          form.get(
            "isOpen",
          ) === "open";

        const hasBreak =
          form.get(
            "hasBreak",
          ) === "on";

        payload = {
          staffId:
            kind ===
            "staff-override"
              ? String(
                  form.get(
                    "staffId",
                  ),
                )
              : undefined,

          date:
            String(
              form.get(
                "date",
              ),
            ),

          isOpen,

          startTime:
            isOpen
              ? String(
                  form.get(
                    "startTime",
                  ),
                )
              : null,

          endTime:
            isOpen
              ? String(
                  form.get(
                    "endTime",
                  ),
                )
              : null,

          hasBreak,

          breakStart:
            isOpen &&
            hasBreak
              ? String(
                  form.get(
                    "breakStart",
                  ),
                )
              : null,

          breakEnd:
            isOpen &&
            hasBreak
              ? String(
                  form.get(
                    "breakEnd",
                  ),
                )
              : null,

          reason:
            String(
              form.get(
                "reason",
              ) ?? "",
            ).trim() ||
            null,
        };
      }
    } catch (
      error: unknown
    ) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Les informations saisies sont invalides.",
      );

      return;
    }

    startTransition(
      async () => {
        try {
          const response =
            await fetch(
              "/api/admin/availability-exceptions",
              {
                method:
                  "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify(
                    {
                      kind,
                      payload,
                    },
                  ),
              },
            );

          const result =
            (await response.json()) as ApiResult;

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.error ??
                "Enregistrement impossible.",
            );
          }

          setData(result);

          formElement.reset();

          setAllDay(true);

          toast.success(
            isSalonClosure
              ? "La fermeture du salon a été enregistrée."
              : "L’exception a été enregistrée.",
          );
        } catch (
          error: unknown
        ) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Enregistrement impossible.",
          );
        }
      },
    );
  }

  function remove(
    targetKind: Kind,
    id: string,
  ): void {
    startTransition(
      async () => {
        try {
          const response =
            await fetch(
              `/api/admin/availability-exceptions?kind=${targetKind}&id=${encodeURIComponent(id)}`,
              {
                method:
                  "DELETE",
              },
            );

          const result =
            (await response.json()) as ApiResult;

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.error ??
                "Suppression impossible.",
            );
          }

          setData(result);

          toast.success(
            "L’exception a été supprimée.",
          );
        } catch (
          error: unknown
        ) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Suppression impossible.",
          );
        }
      },
    );
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/*                              TABS                                  */}
      {/* ------------------------------------------------------------------ */}

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <KindButton
            active={
              kind ===
              "salon-time-off"
            }
            label="Fermeture du salon"
            onClick={() => {
              setKind(
                "salon-time-off",
              );

              setAllDay(
                true,
              );
            }}
          />

          <KindButton
            active={
              kind ===
              "staff-time-off"
            }
            label="Absence professionnelle"
            onClick={() => {
              setKind(
                "staff-time-off",
              );

              setAllDay(
                true,
              );
            }}
          />

          <KindButton
            active={
              kind ===
              "salon-override"
            }
            label="Horaire exceptionnel salon"
            onClick={() =>
              setKind(
                "salon-override",
              )
            }
          />

          <KindButton
            active={
              kind ===
              "staff-override"
            }
            label="Horaire exceptionnel professionnelle"
            onClick={() =>
              setKind(
                "staff-override",
              )
            }
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                              FORM                                  */}
      {/* ------------------------------------------------------------------ */}

      <form
        onSubmit={submit}
        className="overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-sm"
      >
        <header className="border-b border-zinc-100 bg-gradient-to-r from-rose-50 to-pink-50 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200">
              {needsStaff ? (
                <UserRound className="size-6" />
              ) : (
                <CalendarDays className="size-6" />
              )}
            </span>

            <div>
              <h2 className="text-xl font-semibold text-zinc-950">
                {getFormTitle(
                  kind,
                )}
              </h2>

              <p className="mt-1 text-sm leading-6 text-zinc-600">
                {getFormDescription(
                  kind,
                )}
              </p>
            </div>
          </div>
        </header>

        <div className="p-5 sm:p-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {needsStaff ? (
              <Field label="Professionnelle">
                <select
                  name="staffId"
                  required
                  className={inputClassName}
                >
                  {data.staff.map(
                    (staff) => (
                      <option
                        key={
                          staff.id
                        }
                        value={
                          staff.id
                        }
                      >
                        {staffName(
                          staff,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </Field>
            ) : null}

            {isTimeOff ? (
              <>
                <Field label="Titre">
                  <input
                    name="title"
                    required
                    maxLength={
                      120
                    }
                    placeholder={
                      isSalonClosure
                        ? "Vacances annuelles"
                        : "Congés, maladie, formation…"
                    }
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <Field label="Date de début">
                  <input
                    name="startDate"
                    type="date"
                    required
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <Field label="Date de fin">
                  <input
                    name="endDate"
                    type="date"
                    required
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <label className="flex min-h-20 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <input
                    name="allDay"
                    type="checkbox"
                    checked={
                      allDay
                    }
                    onChange={(
                      event,
                    ) =>
                      setAllDay(
                        event
                          .target
                          .checked,
                      )
                    }
                    className="size-5 accent-rose-600"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-zinc-900">
                      Journées
                      complètes
                    </span>

                    <span className="mt-1 block text-xs text-zinc-500">
                      Fermer du
                      matin au soir.
                    </span>
                  </span>
                </label>

                {!allDay ? (
                  <>
                    <Field label="Heure de début">
                      <input
                        name="startTime"
                        type="time"
                        required
                        defaultValue="09:00"
                        className={
                          inputClassName
                        }
                      />
                    </Field>

                    <Field label="Heure de fin">
                      <input
                        name="endTime"
                        type="time"
                        required
                        defaultValue="19:00"
                        className={
                          inputClassName
                        }
                      />
                    </Field>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <Field label="Date concernée">
                  <input
                    name="date"
                    type="date"
                    required
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <Field label="Type d’exception">
                  <select
                    name="isOpen"
                    defaultValue="closed"
                    className={
                      inputClassName
                    }
                  >
                    <option value="closed">
                      Fermé /
                      repos
                    </option>

                    <option value="open">
                      Ouverture
                      personnalisée
                    </option>
                  </select>
                </Field>

                <Field label="Heure de début">
                  <input
                    name="startTime"
                    type="time"
                    defaultValue="09:00"
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <Field label="Heure de fin">
                  <input
                    name="endTime"
                    type="time"
                    defaultValue="19:00"
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <Field label="Début de pause">
                  <input
                    name="breakStart"
                    type="time"
                    defaultValue="12:00"
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <Field label="Fin de pause">
                  <input
                    name="breakEnd"
                    type="time"
                    defaultValue="13:00"
                    className={
                      inputClassName
                    }
                  />
                </Field>

                <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <input
                    name="hasBreak"
                    type="checkbox"
                    className="size-5 accent-rose-600"
                  />

                  <span className="text-sm font-semibold text-zinc-800">
                    Ajouter une
                    pause
                  </span>
                </label>
              </>
            )}

            <Field label="Motif ou commentaire">
              <input
                name="reason"
                maxLength={
                  500
                }
                placeholder="Facultatif"
                className={
                  inputClassName
                }
              />
            </Field>
          </div>

          {isSalonClosure ? (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <CalendarDays className="mt-0.5 size-5 shrink-0 text-amber-600" />

              <p className="text-sm leading-6 text-amber-800">
                Tous les créneaux
                compris entre les deux
                dates seront bloqués
                automatiquement pour
                l’ensemble du salon.
              </p>
            </div>
          ) : null}

          <button
            disabled={pending}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Plus className="size-5" />
            )}

            {pending
              ? "Enregistrement..."
              : isSalonClosure
                ? "Enregistrer la fermeture"
                : "Enregistrer l’exception"}
          </button>
        </div>
      </form>

      {/* ------------------------------------------------------------------ */}
      {/*                              LISTS                                 */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-5 xl:grid-cols-2">
        <List title="Fermetures du salon">
          {data.salonTimeOffs.length ===
          0 ? (
            <EmptyList />
          ) : (
            data.salonTimeOffs.map(
              (item) => (
                <Row
                  key={
                    item.id
                  }
                  title={
                    item.title
                  }
                  subtitle={formatPeriod(
                    item.startsAt,
                    item.endsAt,
                    item.allDay,
                  )}
                  reason={
                    item.reason
                  }
                  onDelete={() =>
                    remove(
                      "salon-time-off",
                      item.id,
                    )
                  }
                />
              ),
            )
          )}
        </List>

        <List title="Absences professionnelles">
          {data.staffTimeOffs.length ===
          0 ? (
            <EmptyList />
          ) : (
            data.staffTimeOffs.map(
              (item) => (
                <Row
                  key={
                    item.id
                  }
                  title={`${staffName(item.staff)} — ${item.title}`}
                  subtitle={formatPeriod(
                    item.startsAt,
                    item.endsAt,
                    item.allDay,
                  )}
                  reason={
                    item.reason
                  }
                  onDelete={() =>
                    remove(
                      "staff-time-off",
                      item.id,
                    )
                  }
                />
              ),
            )
          )}
        </List>

        <List title="Exceptions du salon">
          {data.salonOverrides.length ===
          0 ? (
            <EmptyList />
          ) : (
            data.salonOverrides.map(
              (item) => (
                <Row
                  key={
                    item.id
                  }
                  title={
                    item.isOpen
                      ? "Ouverture exceptionnelle"
                      : "Fermeture exceptionnelle"
                  }
                  subtitle={`${formatDate(item.date)}${
                    item.startTime &&
                    item.endTime
                      ? ` — ${item.startTime} à ${item.endTime}`
                      : ""
                  }`}
                  reason={
                    item.reason
                  }
                  onDelete={() =>
                    remove(
                      "salon-override",
                      item.id,
                    )
                  }
                />
              ),
            )
          )}
        </List>

        <List title="Exceptions professionnelles">
          {data.staffOverrides.length ===
          0 ? (
            <EmptyList />
          ) : (
            data.staffOverrides.map(
              (item) => (
                <Row
                  key={
                    item.id
                  }
                  title={`${staffName(item.staff)} — ${
                    item.isOpen
                      ? "horaires personnalisés"
                      : "repos"
                  }`}
                  subtitle={`${formatDate(item.date)}${
                    item.startTime &&
                    item.endTime
                      ? ` — ${item.startTime} à ${item.endTime}`
                      : ""
                  }`}
                  reason={
                    item.reason
                  }
                  onDelete={() =>
                    remove(
                      "staff-override",
                      item.id,
                    )
                  }
                />
              ),
            )
          )}
        </List>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              COMPONENTS                                    */
/* -------------------------------------------------------------------------- */

const inputClassName =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100";

function KindButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-200"
          : "border border-zinc-200 bg-white text-zinc-600 hover:border-rose-200 hover:bg-rose-50"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-zinc-800">
        {label}
      </span>

      {children}
    </label>
  );
}

function List({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">
        {title}
      </h2>

      <div className="mt-4 space-y-3">
        {children}
      </div>
    </section>
  );
}

function EmptyList() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-center text-sm text-zinc-500">
      Aucun élément enregistré.
    </div>
  );
}

function Row({
  title,
  subtitle,
  reason,
  onDelete,
}: {
  title: string;
  subtitle: string;
  reason: string | null;
  onDelete: () => void;
}) {
  return (
    <article className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200 p-4">
      <div className="min-w-0">
        <h3 className="font-semibold text-zinc-950">
          {title}
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
          <Clock3 className="size-4 shrink-0" />
          {subtitle}
        </p>

        {reason ? (
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {reason}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="grid size-10 shrink-0 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
        aria-label="Supprimer"
      >
        <Trash2 className="size-4" />
      </button>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getFormTitle(
  kind: Kind,
): string {
  switch (kind) {
    case "salon-time-off":
      return "Fermer le salon sur une période";

    case "staff-time-off":
      return "Ajouter une absence";

    case "salon-override":
      return "Modifier exceptionnellement les horaires du salon";

    case "staff-override":
      return "Modifier les horaires d’une professionnelle";
  }
}

function getFormDescription(
  kind: Kind,
): string {
  switch (kind) {
    case "salon-time-off":
      return "Sélectionnez directement la première et la dernière journée de fermeture.";

    case "staff-time-off":
      return "Enregistrez une absence pouvant durer plusieurs jours.";

    case "salon-override":
      return "Modifiez les horaires du salon pour une journée particulière.";

    case "staff-override":
      return "Définissez un horaire exceptionnel pour une professionnelle.";
  }
}

function staffName(
  staff: {
    displayName: string | null;

    user: {
      firstName: string;
      lastName: string;
    };
  },
): string {
  return (
    staff.displayName?.trim() ||
    `${staff.user.firstName} ${staff.user.lastName}`.trim()
  );
}

function createLocalDate(
  date: string,
  time: string,
): Date {
  const value =
    new Date(
      `${date}T${time}:00`,
    );

  if (
    Number.isNaN(
      value.getTime(),
    )
  ) {
    throw new Error(
      "La date sélectionnée est invalide.",
    );
  }

  return value;
}

function formatPeriod(
  startsAt: string,
  endsAt: string,
  allDay: boolean,
): string {
  const start =
    new Date(startsAt);

  const end =
    new Date(endsAt);

  const sameDay =
    start.toLocaleDateString(
      "fr-FR",
    ) ===
    end.toLocaleDateString(
      "fr-FR",
    );

  if (allDay) {
    if (sameDay) {
      return new Intl.DateTimeFormat(
        "fr-FR",
        {
          dateStyle:
            "long",
        },
      ).format(start);
    }

    return `Du ${new Intl.DateTimeFormat(
      "fr-FR",
      {
        dateStyle:
          "long",
      },
    ).format(start)} au ${new Intl.DateTimeFormat(
      "fr-FR",
      {
        dateStyle:
          "long",
      },
    ).format(end)}`;
  }

  return `${new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
    },
  ).format(start)} → ${new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
    },
  ).format(end)}`;
}

function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "long",

      timeZone:
        "UTC",
    },
  ).format(
    new Date(value),
  );
}
