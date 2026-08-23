"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Frown,
  Gift,
  Pencil,
  Percent,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";

import {
  deleteWheelSegmentAction,
  moveWheelSegmentAction,
  saveWheelSegmentAction,
  saveWheelSettingsAction,
  toggleWheelSegmentAction,
} from "@/features/admin/wheel/actions/admin-wheel.actions";
import type {
  AdminWheelSegment,
  WheelSettings,
} from "@/features/admin/wheel/types/admin-wheel.types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminWheelDashboardProps = {
  initialSettings: WheelSettings;
  initialSegments: AdminWheelSegment[];
};

type SegmentDraft = {
  label: string;
  kind: "LOSE" | "PERCENTAGE" | "FIXED_AMOUNT";
  percentageValue: string;
  amountCents: string;
  weight: string;
  colorHex: string;
  isActive: boolean;
};

const EMPTY_DRAFT: SegmentDraft = {
  label: "",
  kind: "LOSE",
  percentageValue: "",
  amountCents: "",
  weight: "10",
  colorHex: "",
  isActive: true,
};

const KIND_LABELS: Record<AdminWheelSegment["kind"], string> = {
  LOSE: "Perdu",
  PERCENTAGE: "Réduction en %",
  FIXED_AMOUNT: "Réduction fixe",
};

function segmentValueLabel(segment: AdminWheelSegment): string {
  if (segment.kind === "PERCENTAGE") {
    return `${segment.percentageValue ?? 0} %`;
  }

  if (segment.kind === "FIXED_AMOUNT") {
    return `${((segment.amountCents ?? 0) / 100).toFixed(2)} €`;
  }

  return "—";
}

function draftFromSegment(segment: AdminWheelSegment): SegmentDraft {
  return {
    label: segment.label,
    kind: segment.kind,
    percentageValue: segment.percentageValue?.toString() ?? "",
    amountCents:
      segment.amountCents !== null
        ? (segment.amountCents / 100).toString()
        : "",
    weight: segment.weight.toString(),
    colorHex: segment.colorHex ?? "",
    isActive: segment.isActive,
  };
}

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function AdminWheelDashboard({
  initialSettings,
  initialSegments,
}: AdminWheelDashboardProps) {
  const router = useRouter();

  const [settings, setSettings] = useState(initialSettings);
  const [isSettingsPending, startSettingsTransition] = useTransition();

  const [isSegmentActionPending, startSegmentTransition] = useTransition();
  const [pendingSegmentId, setPendingSegmentId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] =
    useState<AdminWheelSegment | null>(null);
  const [draft, setDraft] = useState<SegmentDraft>(EMPTY_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function openCreateDialog() {
    setEditingSegment(null);
    setDraft(EMPTY_DRAFT);
    setFieldErrors({});
    setDialogOpen(true);
  }

  function openEditDialog(segment: AdminWheelSegment) {
    setEditingSegment(segment);
    setDraft(draftFromSegment(segment));
    setFieldErrors({});
    setDialogOpen(true);
  }

  function handleSettingsSave() {
    startSettingsTransition(async () => {
      const result = await saveWheelSettingsAction(settings);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function handleSegmentSubmit() {
    const payload = {
      label: draft.label.trim(),
      kind: draft.kind,
      weight: Number(draft.weight),
      isActive: draft.isActive,
      colorHex: draft.colorHex.trim() || null,

      percentageValue:
        draft.kind === "PERCENTAGE" && draft.percentageValue
          ? Number(draft.percentageValue)
          : null,

      amountCents:
        draft.kind === "FIXED_AMOUNT" && draft.amountCents
          ? Math.round(Number(draft.amountCents) * 100)
          : null,
    };

    startSegmentTransition(async () => {
      const result = await saveWheelSegmentAction(
        editingSegment?.id ?? null,
        payload,
      );

      if (!result.success) {
        toast.error(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      toast.success(result.message);
      setDialogOpen(false);
      router.refresh();
    });
  }

  function handleDelete(segment: AdminWheelSegment) {
    if (
      !window.confirm(
        `Supprimer la case « ${segment.label} » ? Cette action est irréversible.`,
      )
    ) {
      return;
    }

    setPendingSegmentId(segment.id);

    startSegmentTransition(async () => {
      const result = await deleteWheelSegmentAction(segment.id);

      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }

      setPendingSegmentId(null);
      router.refresh();
    });
  }

  function handleToggle(segment: AdminWheelSegment) {
    setPendingSegmentId(segment.id);

    startSegmentTransition(async () => {
      const result = await toggleWheelSegmentAction(segment.id);

      if (!result.success) {
        toast.error(result.message);
      }

      setPendingSegmentId(null);
      router.refresh();
    });
  }

  function handleMove(segment: AdminWheelSegment, direction: "UP" | "DOWN") {
    setPendingSegmentId(segment.id);

    startSegmentTransition(async () => {
      const result = await moveWheelSegmentAction(segment.id, direction);

      if (!result.success) {
        toast.error(result.message);
      }

      setPendingSegmentId(null);
      router.refresh();
    });
  }

  const totalWeight = initialSegments
    .filter((segment) => segment.isActive)
    .reduce((sum, segment) => sum + segment.weight, 0);

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------- */}
      {/*                             RÉGLAGES                            */}
      {/* -------------------------------------------------------------- */}

      <section className="rounded-[1.75rem] border border-[#241A1D]/8 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-xl text-[#241A1D]">
          Réglages généraux
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-[#241A1D]/10 px-4 py-3">
            <span className="text-sm font-medium text-[#33262A]">
              Roue activée
            </span>

            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  enabled: event.target.checked,
                }))
              }
              className="size-5 accent-[#B8899A]"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-[#241A1D]/10 px-4 py-3">
            <span className="text-sm font-medium text-[#33262A]">
              Tirage après réservation
            </span>

            <input
              type="checkbox"
              checked={settings.bookingSpinEnabled}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  bookingSpinEnabled: event.target.checked,
                }))
              }
              className="size-5 accent-[#B8899A]"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-[#241A1D]/10 px-4 py-3">
            <span className="text-sm font-medium text-[#33262A]">
              1 tirage par jour à la connexion
            </span>

            <input
              type="checkbox"
              checked={settings.dailySpinEnabled}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  dailySpinEnabled: event.target.checked,
                }))
              }
              className="size-5 accent-[#B8899A]"
            />
          </label>

          <FormField
            label="Validité des codes gagnés (jours)"
            name="defaultValidityDays"
            type="number"
            min={1}
            max={365}
            value={settings.defaultValidityDays}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                defaultValidityDays: Number(event.target.value),
              }))
            }
          />
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            onClick={handleSettingsSave}
            isLoading={isSettingsPending}
            size="sm"
          >
            Enregistrer les réglages
          </Button>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/*                              CASES                              */}
      {/* -------------------------------------------------------------- */}

      <section className="rounded-[1.75rem] border border-[#241A1D]/8 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-[#241A1D]">
              Cases de la roue
            </h2>

            <p className="mt-1 text-sm text-[#7A6870]">
              {initialSegments.filter((segment) => segment.isActive).length}{" "}
              case(s) active(s) · poids total {totalWeight || 0}
            </p>
          </div>

          <Button onClick={openCreateDialog} size="sm">
            <Plus className="size-4" />
            Ajouter une case
          </Button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#241A1D]/10 text-xs font-semibold uppercase tracking-wide text-[#7A6870]">
                <th className="py-3 pr-4">Ordre</th>
                <th className="py-3 pr-4">Libellé</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Valeur</th>
                <th className="py-3 pr-4">Poids</th>
                <th className="py-3 pr-4">Actif</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#241A1D]/6">
              {initialSegments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#7A6870]">
                    Aucune case configurée pour le moment.
                  </td>
                </tr>
              )}

              {initialSegments.map((segment, index) => {
                const isRowPending =
                  isSegmentActionPending && pendingSegmentId === segment.id;

                return (
                  <tr key={segment.id} className={isRowPending ? "opacity-50" : ""}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0 || isSegmentActionPending}
                          onClick={() => handleMove(segment, "UP")}
                          className="rounded-lg p-1.5 text-[#7A6870] transition hover:bg-[#241A1D]/5 disabled:opacity-30"
                          aria-label="Monter"
                        >
                          <ArrowUp className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          disabled={
                            index === initialSegments.length - 1 ||
                            isSegmentActionPending
                          }
                          onClick={() => handleMove(segment, "DOWN")}
                          className="rounded-lg p-1.5 text-[#7A6870] transition hover:bg-[#241A1D]/5 disabled:opacity-30"
                          aria-label="Descendre"
                        >
                          <ArrowDown className="size-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3 shrink-0 rounded-full border border-black/10"
                          style={{
                            backgroundColor: segment.colorHex ?? "#B8899A",
                          }}
                        />

                        <span className="font-medium text-[#241A1D]">
                          {segment.label}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F4] px-2.5 py-1 text-xs font-semibold text-[#A64D69]">
                        {segment.kind === "LOSE" ? (
                          <Frown className="size-3.5" />
                        ) : segment.kind === "PERCENTAGE" ? (
                          <Percent className="size-3.5" />
                        ) : (
                          <Gift className="size-3.5" />
                        )}
                        {KIND_LABELS[segment.kind]}
                      </span>
                    </td>

                    <td className="py-3 pr-4 text-[#33262A]">
                      {segmentValueLabel(segment)}
                    </td>

                    <td className="py-3 pr-4 text-[#33262A]">
                      {segment.weight}
                      {totalWeight > 0 && (
                        <span className="ml-1 text-xs text-[#7A6870]">
                          ({Math.round((segment.weight / totalWeight) * 100)}%)
                        </span>
                      )}
                    </td>

                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        disabled={isSegmentActionPending}
                        onClick={() => handleToggle(segment)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          segment.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[#241A1D]/5 text-[#7A6870]"
                        }`}
                      >
                        {segment.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="py-3 pr-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDialog(segment)}
                          className="rounded-lg p-2 text-[#7A6870] transition hover:bg-[#241A1D]/5"
                          aria-label="Modifier"
                        >
                          <Pencil className="size-4" />
                        </button>

                        <button
                          type="button"
                          disabled={isSegmentActionPending}
                          onClick={() => handleDelete(segment)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* -------------------------------------------------------------- */}
      {/*                        DIALOGUE AJOUT/ÉDITION                   */}
      {/* -------------------------------------------------------------- */}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSegment ? "Modifier la case" : "Ajouter une case"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <FormField
              label="Libellé"
              name="label"
              value={draft.label}
              onChange={(event) =>
                setDraft((current) => ({ ...current, label: event.target.value }))
              }
              error={fieldErrors.label?.[0]}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#33262A]">
                Type de gain
              </label>

              <select
                value={draft.kind}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    kind: event.target.value as SegmentDraft["kind"],
                  }))
                }
                className="h-12 w-full rounded-2xl border border-[#241A1D]/12 bg-white px-4 text-sm text-[#241A1D] focus:border-[#B8899A] focus:outline-none focus:ring-4 focus:ring-[#B8899A]/12"
              >
                <option value="LOSE">Perdu</option>
                <option value="PERCENTAGE">Réduction en %</option>
                <option value="FIXED_AMOUNT">Réduction fixe (€)</option>
              </select>
            </div>

            {draft.kind === "PERCENTAGE" && (
              <FormField
                label="Pourcentage de réduction"
                name="percentageValue"
                type="number"
                min={1}
                max={100}
                value={draft.percentageValue}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    percentageValue: event.target.value,
                  }))
                }
                error={fieldErrors.percentageValue?.[0]}
              />
            )}

            {draft.kind === "FIXED_AMOUNT" && (
              <FormField
                label="Montant de réduction (€)"
                name="amountCents"
                type="number"
                min={1}
                step="0.01"
                value={draft.amountCents}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    amountCents: event.target.value,
                  }))
                }
                error={fieldErrors.amountCents?.[0]}
              />
            )}

            <FormField
              label="Poids (probabilité relative)"
              name="weight"
              type="number"
              min={1}
              max={1000}
              hint="Plus le poids est élevé, plus la case a de chances de sortir. Mettez un poids élevé sur « Perdu » pour limiter les gains."
              value={draft.weight}
              onChange={(event) =>
                setDraft((current) => ({ ...current, weight: event.target.value }))
              }
              error={fieldErrors.weight?.[0]}
            />

            <FormField
              label="Couleur (optionnel)"
              name="colorHex"
              placeholder="#A64D69"
              value={draft.colorHex}
              onChange={(event) =>
                setDraft((current) => ({ ...current, colorHex: event.target.value }))
              }
              error={fieldErrors.colorHex?.[0]}
            />

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="size-5 accent-[#B8899A]"
              />
              <span className="text-sm font-medium text-[#33262A]">
                Case active
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSegmentActionPending}
            >
              Annuler
            </Button>

            <Button
              type="button"
              onClick={handleSegmentSubmit}
              isLoading={isSegmentActionPending}
              disabled={!draft.label.trim()}
            >
              {editingSegment ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
