"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  GripVertical,
  ImageIcon,
  LoaderCircle,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";

import Image from "next/image";

import {
  useDropzone,
} from "react-dropzone";

import {
  Button,
} from "@/components/ui/button";

import type {
  AdminServiceImageInput,
} from "@/features/admin/services/schemas/admin-service.schema";

import {
  useUploadThing,
} from "@/lib/uploadthing";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminServiceUploadZoneProps = {
  value: AdminServiceImageInput[];

  onChange: (
    images: AdminServiceImageInput[],
  ) => void;

  disabled?: boolean;

  maxFiles?: number;
};

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
};

/* -------------------------------------------------------------------------- */
/*                                  COMPOSANT                                 */
/* -------------------------------------------------------------------------- */

export function AdminServiceUploadZone({
  value,
  onChange,
  disabled = false,
  maxFiles = 10,
}: AdminServiceUploadZoneProps) {
  const [
    uploading,
    setUploading,
  ] = useState(false);

  const {
    startUpload,
    isUploading,
  } = useUploadThing(
    "serviceUploader",
  );

  const remaining =
    Math.max(
      maxFiles - value.length,
      0,
    );

  const canUpload =
    remaining > 0 &&
    !disabled &&
    !uploading &&
    !isUploading;

  const normalizedImages =
    useMemo(
      () =>
        [...value]
          .sort(
            (
              firstImage,
              secondImage,
            ) =>
              firstImage.sortOrder -
              secondImage.sortOrder,
          )
          .map(
            (
              image,
              index,
            ) => ({
              ...image,

              sortOrder:
                index,
            }),
          ),
      [
        value,
      ],
    );

  const updateImages =
    useCallback(
      (
        images: AdminServiceImageInput[],
      ) => {
        onChange(
          images.map(
            (
              image,
              index,
            ) => ({
              ...image,

              sortOrder:
                index,
            }),
          ),
        );
      },
      [
        onChange,
      ],
    );

  const removeImage =
    useCallback(
      (
        imageId: string,
      ) => {
        const remainingImages =
          normalizedImages.filter(
            (image) =>
              image.id !== imageId,
          );

        if (
          remainingImages.length > 0 &&
          !remainingImages.some(
            (image) =>
              image.isCover,
          )
        ) {
          remainingImages[0] = {
            ...remainingImages[0],

            isCover:
              true,
          };
        }

        updateImages(
          remainingImages,
        );
      },
      [
        normalizedImages,
        updateImages,
      ],
    );

  const setCoverImage =
    useCallback(
      (
        imageId: string,
      ) => {
        updateImages(
          normalizedImages.map(
            (image) => ({
              ...image,

              isCover:
                image.id === imageId,
            }),
          ),
        );
      },
      [
        normalizedImages,
        updateImages,
      ],
    );

  const moveImage =
    useCallback(
      (
        imageId: string,
        direction: -1 | 1,
      ) => {
        const currentIndex =
          normalizedImages.findIndex(
            (image) =>
              image.id === imageId,
          );

        const targetIndex =
          currentIndex + direction;

        if (
          currentIndex < 0 ||
          targetIndex < 0 ||
          targetIndex >=
            normalizedImages.length
        ) {
          return;
        }

        const nextImages =
          [...normalizedImages];

        const [
          movedImage,
        ] =
          nextImages.splice(
            currentIndex,
            1,
          );

        nextImages.splice(
          targetIndex,
          0,
          movedImage,
        );

        updateImages(
          nextImages,
        );
      },
      [
        normalizedImages,
        updateImages,
      ],
    );

  const onDrop =
    useCallback(
      async (
        acceptedFiles: File[],
      ) => {
        if (
          acceptedFiles.length === 0 ||
          !canUpload
        ) {
          return;
        }

        const files =
          acceptedFiles.slice(
            0,
            remaining,
          );

        setUploading(
          true,
        );

        try {
          const response =
            await startUpload(
              files,
            );

          if (!response) {
            return;
          }

          const uploadedImages =
            response.map(
              (
                file,
                index,
              ): AdminServiceImageInput => {
                const serverData =
                  file.serverData;

                if (
                  !serverData?.key ||
                  !serverData.url
                ) {
                  throw new Error(
                    "L’image envoyée n’a pas pu être authentifiée.",
                  );
                }

                return {
                  id:
                    crypto.randomUUID(),

                  /*
                   * L’URL sert uniquement à la
                   * prévisualisation dans le formulaire.
                   *
                   * Le serveur la remplacera par celle
                   * enregistrée dans SecurityUpload.
                   */
                  url:
                    serverData.url,

                  uploadKey:
                    serverData.key,

                  alt:
                    "",

                  sortOrder:
                    normalizedImages.length +
                    index,

                  isCover:
                    normalizedImages.length ===
                      0 &&
                    index === 0,
                };
              },
            );

          updateImages([
            ...normalizedImages,
            ...uploadedImages,
          ]);
        } catch (
          error: unknown
        ) {
          console.error(
            "[ADMIN_SERVICE_IMAGE_UPLOAD]",
            error,
          );
        } finally {
          setUploading(
            false,
          );
        }
      },
      [
        canUpload,
        normalizedImages,
        remaining,
        startUpload,
        updateImages,
      ],
    );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,

    accept:
      ACCEPTED_IMAGE_TYPES,

    maxFiles:
      remaining,

    disabled:
      !canUpload,

    multiple:
      true,
  });

  const uploadLabel =
    uploading ||
    isUploading
      ? "Téléversement en cours…"
      : normalizedImages.length === 0
        ? "Ajoutez les photos de la prestation"
        : "Ajouter d’autres photos";

  return (
    <div className="space-y-5">
      <div
        {...getRootProps()}
        className={[
          "cursor-pointer rounded-[1.75rem] border-2 border-dashed p-8 transition",
          isDragActive
            ? "border-[#B45F7A] bg-[#FFF3F6]"
            : "border-[#E8B4C0] bg-[#FFF8FA] hover:border-[#B45F7A]",
          !canUpload
            ? "cursor-not-allowed opacity-60"
            : "",
        ].join(" ")}
      >
        <input
          {...getInputProps()}
        />

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-white text-[#B45F7A] shadow-sm">
            {uploading ||
            isUploading ? (
              <LoaderCircle className="size-7 animate-spin" />
            ) : (
              <UploadCloud className="size-7" />
            )}
          </div>

          <div>
            <p className="font-semibold text-[#2F2027]">
              {uploadLabel}
            </p>

            <p className="mt-1 text-sm text-[#816D75]">
              JPG, PNG ou WEBP — 8 Mo maximum par image
            </p>

            <p className="mt-1 text-xs text-[#816D75]">
              {normalizedImages.length} / {maxFiles} images
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            disabled={
              !canUpload
            }
          >
            Choisir des images
          </Button>
        </div>
      </div>

      {normalizedImages.length >
      0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {normalizedImages.map(
            (
              image,
              index,
            ) => (
              <article
                key={
                  image.id
                }
                className="overflow-hidden rounded-[1.5rem] border border-[#E8B4C0]/60 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] bg-[#FFF3F6]">
                  <Image
                    src={
                      image.url
                    }
                    alt={
                      image.alt ||
                      "Image de la prestation"
                    }
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />

                  {image.isCover ? (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#2F2027] px-3 py-1.5 text-xs font-semibold text-white shadow">
                      <Star className="size-3.5 fill-current" />

                      Image principale
                    </span>
                  ) : null}
                </div>

                <div className="space-y-3 p-4">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#816D75]">
                      Texte alternatif
                    </span>

                    <input
                      type="text"
                      value={
                        image.alt ??
                        ""
                      }
                      maxLength={
                        160
                      }
                      disabled={
                        disabled
                      }
                      onChange={(
                        event,
                      ) => {
                        updateImages(
                          normalizedImages.map(
                            (
                              currentImage,
                            ) =>
                              currentImage.id ===
                              image.id
                                ? {
                                    ...currentImage,

                                    alt:
                                      event
                                        .target
                                        .value,
                                  }
                                : currentImage,
                          ),
                        );
                      }}
                      placeholder="Ex. Pose rose poudré"
                      className="mt-2 h-10 w-full rounded-xl border border-[#E8B4C0]/70 bg-[#FFFDFC] px-3 text-sm text-[#2F2027] outline-none transition focus:border-[#B45F7A]"
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-2">
                    {!image.isCover ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          disabled
                        }
                        onClick={() =>
                          setCoverImage(
                            image.id,
                          )
                        }
                      >
                        <Star className="size-4" />

                        Principale
                      </Button>
                    ) : null}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="size-9 px-0"
                      disabled={
                        disabled ||
                        index === 0
                      }
                      onClick={() =>
                        moveImage(
                          image.id,
                          -1,
                        )
                      }
                      aria-label="Déplacer l’image vers la gauche"
                    >
                      <GripVertical className="size-4 rotate-90" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="size-9 px-0"
                      disabled={
                        disabled ||
                        index ===
                          normalizedImages.length -
                            1
                      }
                      onClick={() =>
                        moveImage(
                          image.id,
                          1,
                        )
                      }
                      aria-label="Déplacer l’image vers la droite"
                    >
                      <GripVertical className="size-4 -rotate-90" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        disabled
                      }
                      onClick={() =>
                        removeImage(
                          image.id,
                        )
                      }
                      aria-label="Supprimer l’image"
                      className="ml-auto size-9 px-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-[#E8B4C0]/50 bg-white px-4 py-3 text-sm text-[#816D75]">
          <ImageIcon className="size-5 text-[#B45F7A]" />

          Aucune image ajoutée pour le moment.
        </div>
      )}
    </div>
  );
}
