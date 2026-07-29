"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
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

import type { GalleryActionState } from "../../actions/gallery.actions";
import {
  galleryFormSchema,
  type GalleryFormInput,
} from "../../schemas/gallery.schema";
import { GalleryUploadZone } from "../gallery-upload-zone";

export type EditGalleryCategoryOption = {
  id: string;
  name: string;
};

export type EditGalleryItem = GalleryFormInput & {
  id: string;
};

type UpdateGalleryAction = (
  previousState: GalleryActionState,
  formData: FormData,
) => Promise<GalleryActionState>;

type EditGalleryFormProps = {
  item: EditGalleryItem;
  action: UpdateGalleryAction;
  categories?: EditGalleryCategoryOption[];
};

type GalleryFormValues = z.input<typeof galleryFormSchema>;

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

function formatPriceInput(priceCents?: number | null): string {
  if (priceCents === undefined || priceCents === null) {
    return "";
  }

  return (priceCents / 100).toFixed(2).replace(".", ",");
}

function createDefaultValues(item: EditGalleryItem): GalleryFormValues {
  return {
    title: item.title,
    description: item.description,
    categoryId: item.categoryId,
    serviceName: item.serviceName ?? "",
    priceCents: item.priceCents,
    durationMinutes: item.durationMinutes,
    tags: item.tags ?? [],
    isFeatured: item.isFeatured,
    isPublished: item.isPublished,
    images: item.images,
  };
}

function createGalleryFormData(
  itemId: string,
  values: GalleryFormInput,
): FormData {
  const formData = new FormData();

  formData.set("id", itemId);
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

export function EditGalleryForm({
  item,
  action,
  categories = [],
}: EditGalleryFormProps) {
  const router = useRouter();
  const initialValues = useMemo(() => createDefaultValues(item), [item]);

  const [state, dispatchAction, pending] = useActionState(
    action,
    INITIAL_STATE,
  );

  const [priceInput, setPriceInput] = useState(() =>
    formatPriceInput(item.priceCents),
  );
  const [tagsInput, setTagsInput] = useState(() =>
    (item.tags ?? []).join(", "),
  );

  const form = useForm<GalleryFormValues, unknown, GalleryFormInput>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const images = form.watch("images") ?? [];
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
    router.refresh();
  }, [router, state.message, state.success]);

  function resetForm(): void {
    form.reset(initialValues);
    setPriceInput(formatPriceInput(item.priceCents));
    setTagsInput((item.tags ?? []).join(", "));
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
    const formData = createGalleryFormData(item.id, values);

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

            <div>
              <h1 className="text-xl font-bold text-zinc-950 sm:text-2xl">
                Modifier la réalisation
              </h1>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Modifiez les photos, la prestation et la visibilité de cette
                réalisation.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Field
              label="Titre de la réalisation"
              error={form.formState.errors.title?.message}
            >
              <input
                id="gallery-title"
                type="text"
                disabled={pending}
                className={fieldClassName}
                {...form.register("title")}
              />
            </Field>

            <Field
              label="Catégorie"
              error={form.formState.errors.categoryId?.message}
            >
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
                  disabled={pending}
                  className={fieldClassName}
                  {...form.register("categoryId")}
                />
              )}
            </Field>
          </div>

          <Field
            label="Description"
            error={form.formState.errors.description?.message}
          >
            <textarea
              id="gallery-description"
              rows={5}
              disabled={pending}
              className={`${fieldClassName} resize-y`}
              {...form.register("description")}
            />
          </Field>

          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-800">
                Photos de la réalisation
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Ajoutez, supprimez ou réorganisez les médias et choisissez la
                couverture.
              </p>
            </div>

            <Controller
              control={form.control}
              name="images"
              render={({ field }) => (
                <GalleryUploadZone
                  value={field.value ?? []}
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
            <h2 className="text-lg font-bold text-zinc-950">
              Informations complémentaires
            </h2>

            <div className="mt-5 grid gap-6 lg:grid-cols-3">
              <Field
                label="Nom de la prestation"
                error={form.formState.errors.serviceName?.message}
              >
                <div className="relative">
                  <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="gallery-service-name"
                    type="text"
                    disabled={pending}
                    className={`${fieldClassName} pl-11`}
                    {...form.register("serviceName")}
                  />
                </div>
              </Field>

              <Field
                label="Prix indicatif"
                error={form.formState.errors.priceCents?.message}
              >
                <div className="relative">
                  <Euro className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="gallery-price"
                    type="text"
                    inputMode="decimal"
                    value={priceInput}
                    disabled={pending}
                    className={`${fieldClassName} pl-11`}
                    onChange={(event) => updatePrice(event.target.value)}
                  />
                </div>
              </Field>

              <Field
                label="Durée en minutes"
                error={form.formState.errors.durationMinutes?.message}
              >
                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="gallery-duration"
                    type="number"
                    min={1}
                    step={1}
                    disabled={pending}
                    className={`${fieldClassName} pl-11`}
                    {...form.register("durationMinutes", {
                      setValueAs: (value: string) =>
                        value === "" ? undefined : Number(value),
                    })}
                  />
                </div>
              </Field>
            </div>

            <div className="mt-6">
              <Field
                label="Tags"
                error={form.formState.errors.tags?.message}
              >
                <div className="relative">
                  <Tag className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
                  <input
                    id="gallery-tags"
                    type="text"
                    value={tagsInput}
                    disabled={pending}
                    className={`${fieldClassName} pl-11`}
                    onChange={(event) => updateTags(event.target.value)}
                  />
                </div>
              </Field>

              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
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

          <div className="grid gap-4 border-t border-zinc-100 pt-8 md:grid-cols-2">
            <ToggleCard
              title="Mettre en avant"
              description="Afficher cette réalisation dans les sélections vedettes."
              disabled={pending}
              input={form.register("isFeatured")}
            />

            <ToggleCard
              title="Publier"
              description="Rendre cette réalisation visible dans la galerie publique."
              disabled={pending}
              input={form.register("isPublished")}
            />
          </div>

          <div className="grid gap-4 rounded-2xl bg-zinc-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <Summary label="Photos" value={String(images.length)} />
            <Summary
              label="Couverture"
              value={coverImage ? "Sélectionnée" : "À ajouter"}
            />
            <Summary label="Mise en avant" value={isFeatured ? "Oui" : "Non"} />
            <Summary
              label="Statut"
              value={isPublished ? "Publiée" : "Brouillon"}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={pending || !form.formState.isDirty}
              onClick={resetForm}
            >
              <RotateCcw className="h-4 w-4" />
              Annuler les modifications
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={pending || !form.formState.isDirty}
            >
              {pending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-zinc-800">{label}</p>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function ToggleCard({
  title,
  description,
  disabled,
  input,
}: {
  title: string;
  description: string;
  disabled: boolean;
  input: ReturnType<
    ReturnType<typeof useForm<GalleryFormValues>>["register"]
  >;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-zinc-200 p-5 transition hover:border-pink-300 hover:bg-pink-50/40">
      <input
        type="checkbox"
        disabled={disabled}
        className="mt-1 h-4 w-4 accent-pink-600"
        {...input}
      />
      <span>
        <span className="block font-semibold text-zinc-900">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-zinc-500">
          {description}
        </span>
      </span>
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-zinc-950">{value}</p>
    </div>
  );
}