"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  Clock3,
  Euro,
  ImagePlus,
  LoaderCircle,
  RotateCcw,
  Save,
  Sparkles,
  Tag,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  createGalleryItemAction,
  type GalleryActionState,
} from "../../actions/gallery.actions";
import {
  galleryFormSchema,
  type GalleryFormInput,
} from "../../schemas/gallery.schema";
import { GalleryUploadZone } from "../gallery-upload-zone";

export type GalleryCategoryOption = {
  id: string;
  name: string;
};

type CreateGalleryFormProps = {
  categories?: GalleryCategoryOption[];
};

type GalleryFormValues = z.input<typeof galleryFormSchema>;

const DEFAULT_VALUES: GalleryFormValues = {
  title: "",
  description: "",
  categoryId: "",
  serviceName: "",
  priceCents: undefined,
  durationMinutes: undefined,
  tags: [],
  isFeatured: false,
  isPublished: true,
  images: [],
};

const INITIAL_STATE: GalleryActionState = {
  success: false,
  message: "",
};

function parseTags(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ).slice(0, 20);
}

function createGalleryFormData(values: GalleryFormInput): FormData {
  const formData = new FormData();

  formData.set("title", values.title);
  formData.set("description", values.description);
  formData.set("categoryId", values.categoryId);
  formData.set("serviceName", values.serviceName ?? "");
  formData.set(
    "priceCents",
    values.priceCents === undefined || values.priceCents === null
      ? ""
      : String(values.priceCents),
  );
  formData.set(
    "durationMinutes",
    values.durationMinutes === undefined ||
      values.durationMinutes === null
      ? ""
      : String(values.durationMinutes),
  );
  formData.set("tags", JSON.stringify(values.tags));
  formData.set("images", JSON.stringify(values.images));
  formData.set("isFeatured", String(values.isFeatured));
  formData.set("isPublished", String(values.isPublished));

  return formData;
}

export function CreateGalleryForm({
  categories = [],
}: CreateGalleryFormProps) {
  const [state, dispatchAction, pending] = useActionState(
    createGalleryItemAction,
    INITIAL_STATE,
  );

  const [priceInput, setPriceInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const form = useForm<GalleryFormValues, unknown, GalleryFormInput>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
  });

  const images = form.watch("images");
  const tags = form.watch("tags") ?? [];
  const isFeatured = form.watch("isFeatured");
  const isPublished = form.watch("isPublished");

  const coverImage = useMemo(
    () => images.find((image) => image.isCover) ?? images[0] ?? null,
    [images],
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (!state.success) {
      toast.error(state.message);
      return;
    }

    toast.success(state.message);
    form.reset(DEFAULT_VALUES);
    setPriceInput("");
    setTagsInput("");
  }, [form, state.message, state.success]);

  function resetForm(): void {
    form.reset(DEFAULT_VALUES);
    setPriceInput("");
    setTagsInput("");
  }

  function updateTags(rawValue: string): void {
    setTagsInput(rawValue);
    form.setValue("tags", parseTags(rawValue), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function updatePrice(rawValue: string): void {
    setPriceInput(rawValue);
    const normalizedValue = rawValue.replace(",", ".").trim();

    if (!normalizedValue) {
      form.setValue("priceCents", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const price = Number(normalizedValue);

    form.setValue(
      "priceCents",
      Number.isFinite(price) ? Math.round(price * 100) : undefined,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  const submitForm = form.handleSubmit((values) => {
    const formData = createGalleryFormData(values);

    startTransition(() => {
      dispatchAction(formData);
    });
  });

  const fieldClassName =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-zinc-100";
  const errorClassName =
    "flex items-center gap-1.5 text-sm text-red-600";

  return (
    <form onSubmit={submitForm} className="space-y-8" noValidate>
      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 bg-gradient-to-r from-pink-50 via-white to-fuchsia-50 px-6 py-6 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-pink-100 p-3 text-pink-600">
              <ImagePlus className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-zinc-950 sm:text-2xl">
                Nouvelle réalisation
              </h1>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Ajoutez les photos et les informations de la nouvelle pose à présenter dans la galerie.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="gallery-title" className="text-sm font-semibold text-zinc-800">
                Titre de la réalisation
              </label>
              <input
                id="gallery-title"
                type="text"
                placeholder="Baby-boomer naturel"
                disabled={pending}
                className={fieldClassName}
                {...form.register("title")}
              />
              {form.formState.errors.title?.message && (
                <p className={errorClassName}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="gallery-category" className="text-sm font-semibold text-zinc-800">
                Catégorie
              </label>
              {categories.length > 0 ? (
                <select
                  id="gallery-category"
                  disabled={pending}
                  className={fieldClassName}
                  {...form.register("categoryId")}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="gallery-category"
                  type="text"
                  placeholder="Identifiant de la catégorie"
                  disabled={pending}
                  className={fieldClassName}
                  {...form.register("categoryId")}
                />
              )}
              {form.formState.errors.categoryId?.message && (
                <p className={errorClassName}>
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="gallery-description" className="text-sm font-semibold text-zinc-800">
              Description
            </label>
            <textarea
              id="gallery-description"
              rows={5}
              placeholder="Décrivez les couleurs, la forme, les décorations et les particularités de cette pose..."
              disabled={pending}
              className={`${fieldClassName} resize-y`}
              {...form.register("description")}
            />
            {form.formState.errors.description?.message && (
              <p className={errorClassName}>
                <AlertCircle className="h-4 w-4 shrink-0" />
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-800">Photos de la réalisation</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Ajoutez jusqu’à dix images et choisissez celle qui servira de couverture.
              </p>
            </div>
            <Controller
              control={form.control}
              name="images"
              render={({ field }) => (
                <GalleryUploadZone
                  value={field.value}
                  disabled={pending}
                  onChange={(nextImages) => {
                    field.onChange(nextImages);
                    void form.trigger("images");
                  }}
                />
              )}
            />
            {form.formState.errors.images?.message && (
              <p className={errorClassName}>
                <AlertCircle className="h-4 w-4 shrink-0" />
                {form.formState.errors.images.message}
              </p>
            )}
          </div>

          <div className="border-t border-zinc-100 pt-8">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-zinc-950">Informations complémentaires</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Ces informations permettent aux clientes d’identifier la prestation réalisée.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="gallery-service-name" className="text-sm font-semibold text-zinc-800">
                  Nom de la prestation
                </label>
                <div className="relative">
                  <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="gallery-service-name"
                    type="text"
                    placeholder="Pose complète gel"
                    disabled={pending}
                    className={`${fieldClassName} pl-11`}
                    {...form.register("serviceName")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="gallery-price" className="text-sm font-semibold text-zinc-800">
                  Prix indicatif
                </label>
                <div className="relative">
                  <Euro className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="gallery-price"
                    type="text"
                    inputMode="decimal"
                    placeholder="55,00"
                    value={priceInput}
                    disabled={pending}
                    className={`${fieldClassName} pl-11`}
                    onChange={(event) => updatePrice(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="gallery-duration" className="text-sm font-semibold text-zinc-800">
                  Durée en minutes
                </label>
                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="gallery-duration"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="90"
                    disabled={pending}
                    className={`${fieldClassName} pl-11`}
                    {...form.register("durationMinutes", {
                      setValueAs: (value: string) =>
                        value === "" ? undefined : Number(value),
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <label htmlFor="gallery-tags" className="text-sm font-semibold text-zinc-800">
                Tags
              </label>
              <div className="relative">
                <Tag className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
                <input
                  id="gallery-tags"
                  type="text"
                  placeholder="Baby-boomer, nude, mariage"
                  value={tagsInput}
                  disabled={pending}
                  className={`${fieldClassName} pl-11`}
                  onChange={(event) => updateTags(event.target.value)}
                />
              </div>
              <p className="text-xs text-zinc-500">
                Séparez chaque tag par une virgule. Maximum 20 tags.
              </p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-8">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-zinc-200 p-5 transition hover:border-pink-300 hover:bg-pink-50/40">
                <input
                  type="checkbox"
                  disabled={pending}
                  className="mt-1 h-4 w-4 accent-pink-600"
                  {...form.register("isFeatured")}
                />
                <div>
                  <p className="font-semibold text-zinc-900">Mettre en avant</p>
                  <p className="mt-1 text-sm leading-5 text-zinc-500">
                    La réalisation pourra apparaître dans les sélections vedettes.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-zinc-200 p-5 transition hover:border-pink-300 hover:bg-pink-50/40">
                <input
                  type="checkbox"
                  disabled={pending}
                  className="mt-1 h-4 w-4 accent-pink-600"
                  {...form.register("isPublished")}
                />
                <div>
                  <p className="font-semibold text-zinc-900">Publier immédiatement</p>
                  <p className="mt-1 text-sm leading-5 text-zinc-500">
                    Décochez cette option pour conserver la réalisation comme brouillon.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl bg-zinc-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Photos</p>
              <p className="mt-2 text-2xl font-bold text-zinc-950">{images.length}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Couverture</p>
              <p className="mt-2 text-sm font-semibold text-zinc-950">
                {coverImage ? "Sélectionnée" : "À ajouter"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Mise en avant</p>
              <p className="mt-2 text-sm font-semibold text-zinc-950">{isFeatured ? "Oui" : "Non"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Statut</p>
              <p className="mt-2 text-sm font-semibold text-zinc-950">{isPublished ? "Publication" : "Brouillon"}</p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="outline" disabled={pending} onClick={resetForm}>
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>

            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer la réalisation
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}