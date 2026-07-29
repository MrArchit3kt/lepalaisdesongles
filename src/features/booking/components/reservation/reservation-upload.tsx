"use client";

import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";

export type UploadedAppointmentImage = {
  url: string;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  key: string | null;
};

type ReservationUploadProps = {
  files: File[];
  uploadedImages: UploadedAppointmentImage[];
  disabled?: boolean;
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
  onUploadedImagesChange: (
    images: UploadedAppointmentImage[],
  ) => void;
};

type LocalPreview = {
  file: File;
  url: string;
};

function formatFileSize(sizeBytes: number): string {
  return `${(sizeBytes / 1024 / 1024).toFixed(2)} Mo`;
}

export function ReservationUpload({
  files,
  uploadedImages,
  disabled = false,
  maxFiles = 5,
  onFilesChange,
  onUploadedImagesChange,
}: ReservationUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadError, setUploadError] =
    useState<string | null>(null);

  const previews = useMemo<LocalPreview[]>(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [previews]);

  const { startUpload, isUploading } = useUploadThing(
    "appointmentInspirations",
    {
      onClientUploadComplete: (results) => {
        const images: UploadedAppointmentImage[] =
          results
            .map((result) => result.serverData)
            .filter((image) => Boolean(image?.url))
            .map((image) => ({
              url: image!.url,
              fileName: image!.fileName ?? null,
              mimeType: image!.mimeType ?? null,
              sizeBytes: image!.sizeBytes ?? null,
              key: image!.key ?? null,
            }));

        onUploadedImagesChange(images);
        onFilesChange([]);
        setUploadError(null);

        toast.success(
          images.length > 1
            ? "Les photos ont bien été envoyées."
            : "La photo a bien été envoyée.",
        );
      },

      onUploadError: (error) => {
        const message =
          error.message ||
          "Impossible d’envoyer les photos.";

        setUploadError(message);
        toast.error(message);
      },

      onUploadBegin: () => {
        setUploadError(null);
      },
    },
  );

  const totalSelected =
    files.length + uploadedImages.length;

  function addFiles(fileList: FileList | null) {
    if (!fileList || disabled || isUploading) {
      return;
    }

    const availableCount = Math.max(
      0,
      maxFiles - uploadedImages.length,
    );

    const selectedFiles = Array.from(fileList);
    const validFiles: File[] = [];

    let invalidTypeFound = false;
    let oversizedFileFound = false;

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        invalidTypeFound = true;
        continue;
      }

      if (file.size > 8 * 1024 * 1024) {
        oversizedFileFound = true;
        continue;
      }

      if (validFiles.length >= availableCount) {
        break;
      }

      validFiles.push(file);
    }

    if (invalidTypeFound) {
      toast.error(
        "Seuls les fichiers image sont autorisés.",
      );
    }

    if (oversizedFileFound) {
      toast.error(
        "Chaque image doit peser au maximum 8 Mo.",
      );
    }

    if (selectedFiles.length > availableCount) {
      toast.error(
        `Vous pouvez ajouter jusqu’à ${maxFiles} photos.`,
      );
    }

    onFilesChange(validFiles);
    onUploadedImagesChange([]);
    setUploadError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeLocalFile(index: number) {
    onFilesChange(
      files.filter(
        (_, fileIndex) => fileIndex !== index,
      ),
    );

    onUploadedImagesChange([]);
    setUploadError(null);
  }

  function clearUploadedImages() {
    onUploadedImagesChange([]);
    onFilesChange([]);
    setUploadError(null);
  }

  async function handleUpload() {
    if (
      files.length === 0 ||
      disabled ||
      isUploading
    ) {
      return;
    }

    const result = await startUpload(files);

    if (!result) {
      setUploadError(
        "L’envoi des photos n’a pas pu être terminé.",
      );
    }
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[#EFDEE4] bg-white/95 p-6 shadow-[0_22px_58px_rgba(85,38,55,0.09)] backdrop-blur">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/40 bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_28px_rgba(132,63,89,0.24)]">
            <ImagePlus className="size-5" />
          </span>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#A5526D]">
              Inspirations
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2F2027]">
              Ajoutez vos photos
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#816D75]">
              Envoyez quelques photos de modèles,
              d&apos;inspirations ou de vos ongles
              actuels afin que nous préparions au mieux
              votre rendez-vous.
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-4 py-2 text-xs font-black text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]">
          {totalSelected} / {maxFiles}
        </span>
      </header>

      {uploadedImages.length === 0 && (
        <label
          className={cn(
            "group flex flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed border-[#D9B4C0] bg-gradient-to-br from-white to-[#FFF4F7] px-8 py-12 text-center shadow-[0_14px_34px_rgba(85,38,55,0.05)] transition",
            !disabled &&
              !isUploading &&
              totalSelected < maxFiles &&
              "cursor-pointer hover:-translate-y-0.5 hover:border-[#B45F7A] hover:bg-[#FFF0F4] hover:shadow-[0_18px_42px_rgba(132,63,89,0.09)]",
            (disabled ||
              isUploading ||
              totalSelected >= maxFiles) &&
              "cursor-not-allowed opacity-60",
          )}
        >
          <UploadCloud className="size-10 text-[#A5526D] transition duration-300 group-hover:scale-110" />

          <p className="mt-5 font-serif text-xl font-semibold text-[#2F2027]">
            Glissez vos images ici
          </p>

          <p className="mt-2 text-center text-sm text-[#816D75]">
            ou cliquez pour sélectionner vos photos
          </p>

          <p className="mt-3 rounded-full border border-[#EFDEE4] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#A68C96]">
            PNG • JPG • WEBP • 8 Mo maximum
          </p>

          <input
            ref={inputRef}
            type="file"
            hidden
            multiple
            accept="image/png,image/jpeg,image/webp"
            disabled={
              disabled ||
              isUploading ||
              totalSelected >= maxFiles
            }
            onChange={(event) => {
              addFiles(event.target.files);
            }}
          />
        </label>
      )}

      {files.length > 0 && (
        <>
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-black text-[#A5526D]">
              <CheckCircle2 className="size-4" />
              Photos sélectionnées
            </div>

            <button
              type="button"
              disabled={disabled || isUploading}
              onClick={() => {
                void handleUpload();
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#B45F7A] to-[#843F59] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(132,63,89,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(132,63,89,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <UploadCloud className="size-4" />
                  Envoyer les photos
                </>
              )}
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((preview, index) => (
              <div
                key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
                className="group overflow-hidden rounded-[1.5rem] border border-[#EFDEE4] bg-white shadow-[0_12px_30px_rgba(85,38,55,0.06)] transition hover:-translate-y-0.5 hover:border-[#DDBAC5] hover:shadow-[0_18px_40px_rgba(132,63,89,0.10)]"
              >
                <div className="relative aspect-square">
                  <Image
                    src={preview.url}
                    alt={preview.file.name}
                    fill
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#2F2027]">
                      {preview.file.name}
                    </p>

                    <p className="text-xs text-[#8E747E]">
                      {formatFileSize(
                        preview.file.size,
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={() =>
                      removeLocalFile(index)
                    }
                    aria-label={`Supprimer ${preview.file.name}`}
                    className="grid size-10 shrink-0 place-items-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {uploadedImages.length > 0 && (
        <>
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="size-4" />
              Photos envoyées
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={clearUploadedImages}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="size-4" />
              Tout supprimer
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploadedImages.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                className="group overflow-hidden rounded-[1.5rem] border border-emerald-200 bg-white shadow-[0_12px_30px_rgba(16,185,129,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(16,185,129,0.12)]"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={
                      image.fileName ??
                      `Photo d’inspiration ${index + 1}`
                    }
                    fill
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />

                  <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                    <CheckCircle2 className="size-5" />
                  </span>
                </div>

                <div className="p-4">
                  <p className="truncate text-sm font-black text-[#2F2027]">
                    {image.fileName ??
                      `Photo ${index + 1}`}
                  </p>

                  {typeof image.sizeBytes ===
                    "number" && (
                    <p className="mt-1 text-xs text-[#8E747E]">
                      {formatFileSize(
                        image.sizeBytes,
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {uploadError && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-[1.25rem] border border-red-200 bg-gradient-to-br from-red-50 to-white p-4 text-sm font-semibold text-red-700 shadow-[0_12px_30px_rgba(220,38,38,0.06)]"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <p>{uploadError}</p>
        </div>
      )}

      <p className="mt-5 rounded-[1.25rem] border border-[#EFDEE4] bg-[#FFF9FA] px-4 py-3 text-xs leading-6 text-[#816D75]">
        Les photos sont facultatives. Une fois
        sélectionnées, cliquez sur « Envoyer les photos »
        avant de confirmer votre réservation.
      </p>
    </section>
  );
}