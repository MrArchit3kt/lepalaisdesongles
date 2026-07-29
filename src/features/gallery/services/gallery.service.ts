import {
  MediaType,
  Prisma,
} from "@/generated/prisma/client";

import type {
  GalleryFormInput,
} from "@/features/gallery/schemas/gallery.schema";

import {
  prisma,
} from "@/lib/prisma";

import {
  ensureGallerySlug,
  regenerateGallerySlug,
} from "./gallery-slug.service";

export class GalleryValidationError extends Error {
  constructor(
    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      "GalleryValidationError";
  }
}

type ExistingGalleryMedia = {
  id:
    string;

  type:
    MediaType;

  url:
    string;

  thumbnailUrl:
    string |
    null;

  alt:
    string |
    null;

  width:
    number |
    null;

  height:
    number |
    null;
};

type TrustedGalleryImage = {
  sourceId:
    string;

  uploadKey:
    string |
    null;

  type:
    MediaType;

  url:
    string;

  thumbnailUrl:
    string |
    null;

  alt:
    string |
    null;

  width:
    number |
    null;

  height:
    number |
    null;

  sortOrder:
    number;

  isCover:
    boolean;
};

function throwGalleryValidation(
  message:
    string,
): never {
  throw new GalleryValidationError(
    message,
  );
}

async function assertGalleryActor(
  actorId:
    string,
): Promise<void> {
  const actor =
    await prisma.user.findFirst({
      where: {
        id:
          actorId,

        status:
          "ACTIVE",

        role: {
          in: [
            "SUPER_ADMIN",
            "ADMIN",
          ],
        },
      },

      select: {
        id:
          true,
      },
    });

  if (
    !actor
  ) {
    throwGalleryValidation(
      "Accès à la gestion de la galerie refusé.",
    );
  }
}

async function assertGalleryCategory(
  categoryId:
    string,
): Promise<void> {
  const category =
    await prisma.galleryCategory.findUnique({
      where: {
        id:
          categoryId,
      },

      select: {
        id:
          true,
      },
    });

  if (
    !category
  ) {
    throwGalleryValidation(
      "La catégorie sélectionnée est introuvable.",
    );
  }
}

function normalizeGalleryInput(
  input:
    GalleryFormInput,
): GalleryFormInput {
  return {
    ...input,

    title:
      input.title.trim(),

    description:
      input.description.trim(),

    categoryId:
      input.categoryId.trim(),

    serviceName:
      input.serviceName?.trim() ||
      "",

    tags:
      Array.from(
        new Set(
          input.tags
            .map(
              (tag) =>
                tag.trim(),
            )
            .filter(
              Boolean,
            ),
        ),
      ).slice(
        0,
        20,
      ),

    images:
      [...input.images]
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

            uploadKey:
              image.uploadKey?.trim() ||
              null,

            alt:
              image.alt?.trim() ||
              null,

            sortOrder:
              index,
          }),
        ),
  };
}

async function resolveTrustedGalleryImages({
  transaction,
  actorId,
  images,
  existingMedia,
}: {
  transaction:
    Prisma.TransactionClient;

  actorId:
    string;

  images:
    GalleryFormInput["images"];

  existingMedia:
    ExistingGalleryMedia[];
}): Promise<TrustedGalleryImage[]> {
  const existingMediaById =
    new Map(
      existingMedia.map(
        (media) => [
          media.id,
          media,
        ],
      ),
    );

  const seenIds =
    new Set<string>();

  const seenUploadKeys =
    new Set<string>();

  const uploadKeys:
    string[] =
    [];

  for (
    const image
    of images
  ) {
    if (
      seenIds.has(
        image.id,
      )
    ) {
      throwGalleryValidation(
        "Un même média apparaît plusieurs fois.",
      );
    }

    seenIds.add(
      image.id,
    );

    const uploadKey =
      image.uploadKey?.trim() ||
      null;

    if (
      uploadKey
    ) {
      if (
        seenUploadKeys.has(
          uploadKey,
        )
      ) {
        throwGalleryValidation(
          "Une même image envoyée apparaît plusieurs fois.",
        );
      }

      seenUploadKeys.add(
        uploadKey,
      );

      uploadKeys.push(
        uploadKey,
      );

      continue;
    }

    if (
      !existingMediaById.has(
        image.id,
      )
    ) {
      throwGalleryValidation(
        "Un média de la galerie n’a pas pu être authentifié.",
      );
    }
  }

  const validationDate =
    new Date();

  const registeredUploads =
    uploadKeys.length >
    0
      ? await transaction.securityUpload.findMany({
          where: {
            key: {
              in:
                uploadKeys,
            },

            uploadedById:
              actorId,

            purpose:
              "GALLERY",

            claimedAt:
              null,

            expiresAt: {
              gt:
                validationDate,
            },
          },

          select: {
            key:
              true,

            url:
              true,
          },
        })
      : [];

  if (
    registeredUploads.length !==
    uploadKeys.length
  ) {
    throwGalleryValidation(
      "Une image est expirée, déjà utilisée ou n’appartient pas à votre compte.",
    );
  }

  const registeredUploadByKey =
    new Map(
      registeredUploads.map(
        (upload) => [
          upload.key,
          upload,
        ],
      ),
    );

  return images.map(
    (
      image,
    ): TrustedGalleryImage => {
      const uploadKey =
        image.uploadKey?.trim() ||
        null;

      if (
        uploadKey
      ) {
        const upload =
          registeredUploadByKey.get(
            uploadKey,
          );

        if (
          !upload
        ) {
          throwGalleryValidation(
            "Une image envoyée n’a pas pu être vérifiée.",
          );
        }

        return {
          sourceId:
            image.id,

          uploadKey,

          type:
            MediaType.IMAGE,

          url:
            upload.url,

          thumbnailUrl:
            upload.url,

          alt:
            image.alt?.trim() ||
            null,

          /*
           * Les dimensions déclarées par le
           * navigateur ne sont pas considérées
           * comme fiables.
           */
          width:
            null,

          height:
            null,

          sortOrder:
            image.sortOrder,

          isCover:
            image.isCover,
        };
      }

      const existing =
        existingMediaById.get(
          image.id,
        );

      if (
        !existing
      ) {
        throwGalleryValidation(
          "Un média existant est invalide.",
        );
      }

      return {
        sourceId:
          existing.id,

        uploadKey:
          null,

        type:
          existing.type,

        /*
         * Toutes les métadonnées sensibles
         * viennent de la base et non du client.
         */
        url:
          existing.url,

        thumbnailUrl:
          existing.thumbnailUrl,

        alt:
          image.alt?.trim() ||
          null,

        width:
          existing.width,

        height:
          existing.height,

        sortOrder:
          image.sortOrder,

        isCover:
          image.isCover,
      };
    },
  );
}

function getGalleryCover(
  images:
    TrustedGalleryImage[],
): TrustedGalleryImage {
  const cover =
    images.find(
      (image) =>
        image.isCover,
    ) ??
    images[0];

  if (
    !cover
  ) {
    throwGalleryValidation(
      "Ajoutez au moins une image à la réalisation.",
    );
  }

  return cover;
}

async function claimGalleryUploads({
  transaction,
  actorId,
  galleryItemId,
  images,
}: {
  transaction:
    Prisma.TransactionClient;

  actorId:
    string;

  galleryItemId:
    string;

  images:
    TrustedGalleryImage[];
}): Promise<void> {
  const uploadKeys =
    images.flatMap(
      (image) =>
        image.uploadKey
          ? [
              image.uploadKey,
            ]
          : [],
    );

  if (
    uploadKeys.length ===
    0
  ) {
    return;
  }

  const claimedAt =
    new Date();

  const claimResult =
    await transaction.securityUpload.updateMany({
      where: {
        key: {
          in:
            uploadKeys,
        },

        uploadedById:
          actorId,

        purpose:
          "GALLERY",

        claimedAt:
          null,

        expiresAt: {
          gt:
            claimedAt,
        },
      },

      data: {
        claimedAt,

        claimedEntityType:
          "GalleryItem",

        claimedEntityId:
          galleryItemId,
      },
    });

  if (
    claimResult.count !==
    uploadKeys.length
  ) {
    throwGalleryValidation(
      "Une image vient déjà d’être utilisée. Rechargez la page puis recommencez.",
    );
  }
}

export async function createGalleryItem({
  actorId,
  input,
}: {
  actorId:
    string;

  input:
    GalleryFormInput;
}) {
  await assertGalleryActor(
    actorId,
  );

  const normalizedInput =
    normalizeGalleryInput(
      input,
    );

  await assertGalleryCategory(
    normalizedInput.categoryId,
  );

  const slug =
    await ensureGallerySlug(
      normalizedInput.title,
    );

  return prisma.$transaction(
    async (
      transaction,
    ) => {
      const trustedImages =
        await resolveTrustedGalleryImages({
          transaction,

          actorId,

          images:
            normalizedInput.images,

          existingMedia:
            [],
        });

      const cover =
        getGalleryCover(
          trustedImages,
        );

      const created =
        await transaction.galleryItem.create({
          data: {
            title:
              normalizedInput.title,

            slug,

            description:
              normalizedInput.description,

            categoryId:
              normalizedInput.categoryId,

            serviceName:
              normalizedInput.serviceName ||
              null,

            coverUrl:
              cover.url,

            alt:
              cover.alt,

            priceCents:
              normalizedInput.priceCents ??
              null,

            durationMinutes:
              normalizedInput.durationMinutes ??
              null,

            tags:
              normalizedInput.tags,

            isFeatured:
              normalizedInput.isFeatured,

            isPublished:
              normalizedInput.isPublished,

            publishedAt:
              normalizedInput.isPublished
                ? new Date()
                : null,

            createdById:
              actorId,

            media: {
              create:
                trustedImages.map(
                  (image) => ({
                    type:
                      image.type,

                    url:
                      image.url,

                    thumbnailUrl:
                      image.thumbnailUrl,

                    alt:
                      image.alt,

                    width:
                      image.width,

                    height:
                      image.height,

                    sortOrder:
                      image.sortOrder,
                  }),
                ),
            },
          },

          include: {
            category:
              true,

            media:
              true,

            createdBy:
              true,
          },
        });

      await claimGalleryUploads({
        transaction,

        actorId,

        galleryItemId:
          created.id,

        images:
          trustedImages,
      });

      return created;
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );
}

export async function updateGalleryItem({
  actorId,
  galleryItemId,
  input,
}: {
  actorId:
    string;

  galleryItemId:
    string;

  input:
    GalleryFormInput;
}) {
  await assertGalleryActor(
    actorId,
  );

  const normalizedInput =
    normalizeGalleryInput(
      input,
    );

  await assertGalleryCategory(
    normalizedInput.categoryId,
  );

  const current =
    await prisma.galleryItem.findUnique({
      where: {
        id:
          galleryItemId,
      },

      select: {
        id:
          true,

        title:
          true,

        slug:
          true,

        publishedAt:
          true,

        media: {
          select: {
            id:
              true,

            type:
              true,

            url:
              true,

            thumbnailUrl:
              true,

            alt:
              true,

            width:
              true,

            height:
              true,
          },
        },
      },
    });

  if (
    !current
  ) {
    throwGalleryValidation(
      "Cette réalisation est introuvable.",
    );
  }

  const slug =
    normalizedInput.title !==
    current.title
      ? await regenerateGallerySlug(
          normalizedInput.title,
          galleryItemId,
        )
      : current.slug;

  return prisma.$transaction(
    async (
      transaction,
    ) => {
      const trustedImages =
        await resolveTrustedGalleryImages({
          transaction,

          actorId,

          images:
            normalizedInput.images,

          existingMedia:
            current.media,
        });

      const cover =
        getGalleryCover(
          trustedImages,
        );

      const updated =
        await transaction.galleryItem.update({
          where: {
            id:
              galleryItemId,
          },

          data: {
            title:
              normalizedInput.title,

            slug,

            description:
              normalizedInput.description,

            categoryId:
              normalizedInput.categoryId,

            serviceName:
              normalizedInput.serviceName ||
              null,

            coverUrl:
              cover.url,

            alt:
              cover.alt,

            priceCents:
              normalizedInput.priceCents ??
              null,

            durationMinutes:
              normalizedInput.durationMinutes ??
              null,

            tags:
              normalizedInput.tags,

            isFeatured:
              normalizedInput.isFeatured,

            isPublished:
              normalizedInput.isPublished,

            publishedAt:
              normalizedInput.isPublished
                ? current.publishedAt ??
                  new Date()
                : null,

            media: {
              deleteMany:
                {},

              create:
                trustedImages.map(
                  (image) => ({
                    id:
                      image.uploadKey
                        ? undefined
                        : image.sourceId,

                    type:
                      image.type,

                    url:
                      image.url,

                    thumbnailUrl:
                      image.thumbnailUrl,

                    alt:
                      image.alt,

                    width:
                      image.width,

                    height:
                      image.height,

                    sortOrder:
                      image.sortOrder,
                  }),
                ),
            },
          },

          include: {
            category:
              true,

            media:
              true,

            createdBy:
              true,
          },
        });

      await claimGalleryUploads({
        transaction,

        actorId,

        galleryItemId:
          updated.id,

        images:
          trustedImages,
      });

      return updated;
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel
          .Serializable,
    },
  );
}

export async function deleteGalleryItem(
    id: string,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.galleryMedia.deleteMany({
        where: {
          galleryItemId: id,
        },
      });
  
      return tx.galleryItem.delete({
        where: {
          id,
        },
      });
    });
  }
  
  export async function publishGalleryItem(
    id: string,
  ) {
    return prisma.galleryItem.update({
      where: {
        id,
      },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }
  
  export async function unpublishGalleryItem(
    id: string,
  ) {
    return prisma.galleryItem.update({
      where: {
        id,
      },
      data: {
        isPublished: false,
        publishedAt: null,
      },
    });
  }
  
  export async function togglePublishedGalleryItem(
    id: string,
  ) {
    const item = await prisma.galleryItem.findUnique({
      where: {
        id,
      },
      select: {
        isPublished: true,
        publishedAt: true,
      },
    });
  
    if (!item) {
      throw new Error("Galerie introuvable.");
    }
  
    return prisma.galleryItem.update({
      where: {
        id,
      },
      data: {
        isPublished: !item.isPublished,
        publishedAt: item.isPublished
          ? null
          : item.publishedAt ?? new Date(),
      },
    });
  }
  
  export async function toggleFeaturedGalleryItem(
    id: string,
  ) {
    const item = await prisma.galleryItem.findUnique({
      where: {
        id,
      },
      select: {
        isFeatured: true,
      },
    });
  
    if (!item) {
      throw new Error("Galerie introuvable.");
    }
  
    return prisma.galleryItem.update({
      where: {
        id,
      },
      data: {
        isFeatured: !item.isFeatured,
      },
    });
  }
  
  export async function incrementGalleryViewCount(
    id: string,
  ) {
    return prisma.galleryItem.update({
      where: {
        id,
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        viewCount: true,
      },
    });
  }export async function updateGallerySortOrder(
    items: Array<{
      id: string;
      sortOrder: number;
    }>,
  ) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.galleryItem.update({
          where: {
            id: item.id,
          },
          data: {
            sortOrder: item.sortOrder,
          },
        }),
      ),
    );
  }
  
  export async function createGalleryMedia(
    galleryItemId: string,
    media: {
      type?: MediaType;
      url: string;
      thumbnailUrl?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
      sortOrder?: number;
    },
  ) {
    return prisma.galleryMedia.create({
      data: {
        galleryItemId,
        type: media.type ?? MediaType.IMAGE,
        url: media.url,
        thumbnailUrl: media.thumbnailUrl,
        alt: media.alt,
        width: media.width,
        height: media.height,
        sortOrder: media.sortOrder ?? 0,
      },
    });
  }
  
  export async function createGalleryMediaMany(
    galleryItemId: string,
    media: Array<{
      type?: MediaType;
      url: string;
      thumbnailUrl?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
      sortOrder?: number;
    }>,
  ) {
    if (media.length === 0) {
      return;
    }
  
    return prisma.galleryMedia.createMany({
      data: media.map((item, index) => ({
        galleryItemId,
        type: item.type ?? MediaType.IMAGE,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        alt: item.alt,
        width: item.width,
        height: item.height,
        sortOrder: item.sortOrder ?? index,
      })),
    });
  }
  
  export async function deleteGalleryMedia(
    mediaId: string,
  ) {
    return prisma.galleryMedia.delete({
      where: {
        id: mediaId,
      },
    });
  }
  
  export async function reorderGalleryMedia(
    galleryItemId: string,
    media: Array<{
      id: string;
      sortOrder: number;
    }>,
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.galleryMedia.findMany({
        where: {
          galleryItemId,
        },
        select: {
          id: true,
        },
      });
  
      const allowedIds = new Set(existing.map((m) => m.id));
  
      for (const item of media) {
        if (!allowedIds.has(item.id)) {
          continue;
        }
  
        await tx.galleryMedia.update({
          where: {
            id: item.id,
          },
          data: {
            sortOrder: item.sortOrder,
          },
        });
      }
  
      return true;
    });
  }export async function replaceGalleryMedia(
    galleryItemId: string,
    media: Array<{
      type?: MediaType;
      url: string;
      thumbnailUrl?: string | null;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    }>,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.galleryMedia.deleteMany({
        where: {
          galleryItemId,
        },
      });
  
      if (media.length === 0) {
        return [];
      }
  
      await tx.galleryMedia.createMany({
        data: media.map((item, index) => ({
          galleryItemId,
          type: item.type ?? MediaType.IMAGE,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          alt: item.alt,
          width: item.width,
          height: item.height,
          sortOrder: index,
        })),
      });
  
      return tx.galleryMedia.findMany({
        where: {
          galleryItemId,
        },
        orderBy: {
          sortOrder: "asc",
        },
      });
    });
  }
  
  export async function duplicateGalleryItem(
    id: string,
    createdById?: string,
  ) {
    const item = await prisma.galleryItem.findUnique({
      where: {
        id,
      },
      include: {
        media: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
  
    if (!item) {
      throw new Error("Galerie introuvable.");
    }
  
    const slug = await ensureGallerySlug(`${item.title} copie`);
  
    return prisma.$transaction(async (tx) => {
      const created = await tx.galleryItem.create({
        data: {
          title: `${item.title} (Copie)`,
          slug,
          description: item.description,
          categoryId: item.categoryId,
          coverUrl: item.coverUrl,
          alt: item.alt,
          serviceName: item.serviceName,
          priceCents: item.priceCents,
          durationMinutes: item.durationMinutes,
          tags: item.tags,
          isFeatured: false,
          isPublished: false,
          publishedAt: null,
          createdById,
        },
      });
  
      if (item.media.length > 0) {
        await tx.galleryMedia.createMany({
          data: item.media.map((media) => ({
            galleryItemId: created.id,
            type: media.type,
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
            alt: media.alt,
            width: media.width,
            height: media.height,
            sortOrder: media.sortOrder,
          })),
        });
      }
  
      return tx.galleryItem.findUnique({
        where: {
          id: created.id,
        },
        include: {
          category: true,
          media: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          createdBy: true,
        },
      });
    });
  }
  
  export async function galleryItemExists(
    id: string,
  ): Promise<boolean> {
    const item = await prisma.galleryItem.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
  
    return item !== null;
  }
  
  export async function gallerySlugExists(
    slug: string,
  ): Promise<boolean> {
    const item = await prisma.galleryItem.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });
  
    return item !== null;
  }
  
  export async function countGalleryItems() {
    return prisma.galleryItem.count();
  }
  
  export async function countPublishedGalleryItems() {
    return prisma.galleryItem.count({
      where: {
        isPublished: true,
      },
    });
  }
  
  export async function countFeaturedGalleryItems() {
    return prisma.galleryItem.count({
      where: {
        isFeatured: true,
      },
    });
  }