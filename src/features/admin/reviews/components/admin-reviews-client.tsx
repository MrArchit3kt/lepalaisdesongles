"use client";

import {
  BadgeCheck,
  CalendarDays,
  LoaderCircle,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { AdminReviewListItem } from "@/features/admin/reviews/services/admin-reviews.service";
import {
  REVIEW_SOURCES,
  REVIEW_STATUSES,
} from "@/features/admin/reviews/schemas/admin-review.schema";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Props = {
  reviews: AdminReviewListItem[];
};

type Source = (typeof REVIEW_SOURCES)[number];
type Status = (typeof REVIEW_STATUSES)[number];

type FormState = {
  source: Source;
  status: Status;
  authorName: string;
  authorAvatar: string;
  rating: number;
  title: string;
  content: string;
  publishedAt: string;
  isVerified: boolean;
  isFeatured: boolean;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
};

const SOURCE_LABELS: Record<Source, string> = {
  WEBSITE: "Site",
  GOOGLE: "Google",
  FACEBOOK: "Facebook",
  OTHER: "Autre",
};

const STATUS_LABELS: Record<Status, string> = {
  PENDING: "En attente",
  APPROVED: "Publié",
  REJECTED: "Refusé",
  HIDDEN: "Masqué",
};

const STATUS_BADGE_CLASSES: Record<Status, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  HIDDEN: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

function todayIsoDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
  }).format(new Date());
}

function emptyForm(): FormState {
  return {
    source: "GOOGLE",
    status: "APPROVED",
    authorName: "",
    authorAvatar: "",
    rating: 5,
    title: "",
    content: "",
    publishedAt: todayIsoDate(),
    isVerified: true,
    isFeatured: false,
  };
}

function formFromReview(review: AdminReviewListItem): FormState {
  return {
    source: (REVIEW_SOURCES as readonly string[]).includes(review.source)
      ? (review.source as Source)
      : "OTHER",
    status: (REVIEW_STATUSES as readonly string[]).includes(review.status)
      ? (review.status as Status)
      : "PENDING",
    authorName: review.authorName,
    authorAvatar: review.authorAvatar ?? "",
    rating: review.rating,
    title: review.title ?? "",
    content: review.content,
    publishedAt: review.publishedAt
      ? review.publishedAt.slice(0, 10)
      : todayIsoDate(),
    isVerified: review.isVerified,
    isFeatured: review.isFeatured,
  };
}

function formatDate(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

/* -------------------------------------------------------------------------- */
/*                                 COMPOSANT                                  */
/* -------------------------------------------------------------------------- */

export function AdminReviewsClient({ reviews }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort((a, b) => {
        const dateA = a.publishedAt ?? a.createdAt;
        const dateB = b.publishedAt ?? b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      }),
    [reviews],
  );

  function openCreateForm(): void {
    setEditingId(null);
    setForm(emptyForm());
    setIsFormOpen(true);
  }

  function openEditForm(review: AdminReviewListItem): void {
    setEditingId(review.id);
    setForm(formFromReview(review));
    setIsFormOpen(true);
  }

  function closeForm(): void {
    if (isPending) return;
    setIsFormOpen(false);
  }

  function handleSubmit(): void {
    if (isPending) return;

    startTransition(async () => {
      try {
        const url = editingId
          ? `/api/admin/reviews/${editingId}`
          : "/api/admin/reviews";

        const response = await fetch(url, {
          method: editingId ? "PATCH" : "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            source: form.source,
            status: form.status,
            authorName: form.authorName,
            authorAvatar: form.authorAvatar,
            rating: form.rating,
            title: form.title,
            content: form.content,
            publishedAt: form.publishedAt,
            isVerified: form.isVerified,
            isFeatured: form.isFeatured,
          }),
        });

        const payload = (await response.json()) as ApiResponse;

        if (!response.ok || payload.success !== true) {
          throw new Error(payload.error ?? "Impossible d’enregistrer cet avis.");
        }

        toast.success(
          editingId ? "L’avis a été mis à jour." : "L’avis a été ajouté.",
        );

        setIsFormOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible d’enregistrer cet avis.",
        );
      }
    });
  }

  function handleDelete(review: AdminReviewListItem): void {
    if (isPending) return;

    if (
      !window.confirm(
        `Supprimer l’avis de ${review.authorName} ? Cette action est définitive.`,
      )
    ) {
      return;
    }

    setDeletingId(review.id);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/reviews/${review.id}`, {
          method: "DELETE",
          headers: { Accept: "application/json" },
        });

        const payload = (await response.json()) as ApiResponse;

        if (!response.ok || payload.success !== true) {
          throw new Error(payload.error ?? "Impossible de supprimer cet avis.");
        }

        toast.success("L’avis a été supprimé.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de supprimer cet avis.",
        );
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          {sortedReviews.length} avis{" "}
          {sortedReviews.length > 1 ? "publiés" : "publié"}
        </p>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-rose-700"
        >
          <Plus className="size-4" />
          Ajouter un avis
        </button>
      </div>

      {sortedReviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
          Aucun avis pour le moment. Les 5 avis Google les plus pertinents
          s’affichent automatiquement sur la page « Avis » du site — ajoutez-en
          ici pour compléter avec le reste de vos avis.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Auteur</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3">Avis</th>
                  <th className="px-4 py-3">Publié le</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {sortedReviews.map((review) => (
                  <tr key={review.id} className="align-top transition hover:bg-pink-50/40">
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-bold text-zinc-700">
                          {SOURCE_LABELS[review.source as Source] ?? review.source}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
                            STATUS_BADGE_CLASSES[review.status as Status] ??
                            STATUS_BADGE_CLASSES.PENDING
                          }`}
                        >
                          {STATUS_LABELS[review.status as Status] ?? review.status}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {review.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                            <BadgeCheck className="size-3" />
                            Vérifié
                          </span>
                        ) : null}

                        {review.isFeatured ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                            <Sparkles className="size-3" />
                            En vedette
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <b>{review.authorName}</b>
                    </td>

                    <td className="px-4 py-3">
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`size-3.5 ${
                              index < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-zinc-200"
                            }`}
                          />
                        ))}
                      </span>
                    </td>

                    <td className="max-w-sm px-4 py-3">
                      {review.title ? (
                        <p className="font-bold text-zinc-800">{review.title}</p>
                      ) : null}

                      <p className="line-clamp-2 text-zinc-500">
                        {review.content}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-zinc-600">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 text-zinc-400" />
                        {formatDate(review.publishedAt)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(review)}
                          aria-label="Modifier cet avis"
                          className="grid size-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                        >
                          <Pencil className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(review)}
                          disabled={isPending && deletingId === review.id}
                          aria-label="Supprimer cet avis"
                          className="grid size-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                        >
                          {isPending && deletingId === review.id ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isFormOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={closeForm}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-review-form-title"
            className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl"
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-200 px-5 py-5 sm:px-7">
              <h2
                id="admin-review-form-title"
                className="text-xl font-black text-zinc-950"
              >
                {editingId ? "Modifier l’avis" : "Ajouter un avis"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                disabled={isPending}
                aria-label="Fermer"
                className="grid size-10 shrink-0 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-7">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-zinc-800">
                    Source
                  </span>

                  <select
                    value={form.source}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        source: event.target.value as Source,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  >
                    {REVIEW_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {SOURCE_LABELS[source]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-zinc-800">
                    Statut
                  </span>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as Status,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  >
                    {REVIEW_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-zinc-800">
                    Note
                  </span>

                  <select
                    value={form.rating}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        rating: Number(event.target.value),
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} étoile{value > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-800">
                  Nom de l’auteur
                </span>

                <input
                  type="text"
                  value={form.authorName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      authorName: event.target.value,
                    }))
                  }
                  placeholder="Prénom Nom"
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-800">
                  Photo de l’auteur (URL, facultatif)
                </span>

                <input
                  type="text"
                  value={form.authorAvatar}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      authorAvatar: event.target.value,
                    }))
                  }
                  placeholder="https://…"
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-800">
                  Titre (facultatif)
                </span>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-zinc-800">
                  Contenu de l’avis
                </span>

                <textarea
                  value={form.content}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  rows={5}
                  placeholder="Collez ici le texte de l’avis Google…"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-zinc-800">
                    Date de publication
                  </span>

                  <input
                    type="date"
                    value={form.publishedAt}
                    max={todayIsoDate()}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        publishedAt: event.target.value,
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-950 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  />
                </label>

                <div className="flex flex-col justify-end gap-2 pb-1">
                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800">
                    <input
                      type="checkbox"
                      checked={form.isVerified}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          isVerified: event.target.checked,
                        }))
                      }
                      className="size-4 accent-rose-600"
                    />
                    Avis vérifié
                  </label>

                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-800">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          isFeatured: event.target.checked,
                        }))
                      }
                      className="size-4 accent-rose-600"
                    />
                    Mettre en vedette
                  </label>
                </div>
              </div>
            </div>

            <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-zinc-200 px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={closeForm}
                disabled={isPending}
                className="inline-flex h-11 items-center rounded-2xl px-4 text-sm font-bold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  isPending ||
                  !form.authorName.trim() ||
                  !form.content.trim() ||
                  !form.publishedAt
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {editingId ? "Enregistrer" : "Ajouter l’avis"}
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}
