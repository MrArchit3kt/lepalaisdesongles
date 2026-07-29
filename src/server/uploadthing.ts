import {
  createUploadthing,
  type FileRouter,
} from "uploadthing/next";
import {
  UTApi,
  UploadThingError,
} from "uploadthing/server";

import {
  requireApiUser,
} from "@/lib/api-session";
import {
  prisma,
} from "@/lib/prisma";
import {
  isAdminRole,
} from "@/lib/roles";
import {
  consumeSecurityRateLimit,
  getClientIpAddress,
} from "@/lib/security/rate-limit";
import {
  isTrustedRequestOrigin,
} from "@/lib/security/request-origin";

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

const upload =
  createUploadthing();

const uploadThingApi =
  new UTApi();

const MAX_IMAGE_SIZE_BYTES =
  8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const ADMIN_UPLOAD_MAX_BATCHES =
  40;

const CLIENT_UPLOAD_MAX_BATCHES =
  12;

const IP_UPLOAD_MAX_BATCHES =
  80;

const UPLOAD_WINDOW_MS =
  60 * 60 * 1000;

const UPLOAD_BLOCK_MS =
  2 * 60 * 60 * 1000;

const APPOINTMENT_UPLOAD_EXPIRATION_MS =
  24 * 60 * 60 * 1000;

const ADMIN_UPLOAD_EXPIRATION_MS =
  30 * 24 * 60 * 60 * 1000;

type UploadPurpose =
  | "GALLERY"
  | "SERVICE"
  | "SITE_SETTINGS"
  | "APPOINTMENT_INSPIRATION";

type UploadedImageFile = {
  key:
    string;

  ufsUrl:
    string;

  name:
    string;

  type:
    string;

  size:
    number;
};

/* -------------------------------------------------------------------------- */
/*                              AUTHENTIFICATION                              */
/* -------------------------------------------------------------------------- */

async function requireAuthenticatedUser() {
  const {
    user,
    response,
  } =
    await requireApiUser();

  if (
    response ||
    !user
  ) {
    throw new UploadThingError(
      "Vous devez être connectée avec un compte actif pour envoyer des images.",
    );
  }

  return {
    userId:
      user.id,

    role:
      user.role,
  };
}

async function requireAdminUser() {
  const user =
    await requireAuthenticatedUser();

  if (
    !isAdminRole(
      user.role,
    )
  ) {
    throw new UploadThingError(
      "Vous n’êtes pas autorisée à envoyer ces images.",
    );
  }

  return user;
}

async function requireClientUser() {
  const user =
    await requireAuthenticatedUser();

  if (
    user.role !==
      "CLIENT"
  ) {
    throw new UploadThingError(
      "Seules les clientes peuvent envoyer des photos de réservation.",
    );
  }

  return user;
}

/* -------------------------------------------------------------------------- */
/*                         PROTECTION DES TÉLÉVERSEMENTS                       */
/* -------------------------------------------------------------------------- */

async function enforceUploadSecurity({
  request,
  userId,
  purpose,
  maxUserBatches,
}: {
  request:
    Request;

  userId:
    string;

  purpose:
    UploadPurpose;

  maxUserBatches:
    number;
}): Promise<void> {
  if (
    !isTrustedRequestOrigin(
      request,
    )
  ) {
    throw new UploadThingError(
      "L’origine de la requête n’est pas autorisée.",
    );
  }

  const ipAddress =
    getClientIpAddress(
      request.headers,
    );

  const [
    userLimit,
    ipLimit,
  ] =
    await Promise.all([
      consumeSecurityRateLimit({
        action:
          `UPLOAD_${purpose}_USER`,

        subject:
          userId,

        maxAttempts:
          maxUserBatches,

        windowMs:
          UPLOAD_WINDOW_MS,

        blockMs:
          UPLOAD_BLOCK_MS,
      }),

      consumeSecurityRateLimit({
        action:
          "UPLOAD_GLOBAL_IP",

        subject:
          ipAddress,

        maxAttempts:
          IP_UPLOAD_MAX_BATCHES,

        windowMs:
          UPLOAD_WINDOW_MS,

        blockMs:
          UPLOAD_BLOCK_MS,
      }),
    ]);

  if (
    !userLimit.allowed ||
    !ipLimit.allowed
  ) {
    throw new UploadThingError(
      "Trop d’envois ont été effectués. Réessayez plus tard.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                          VALIDATION DES FICHIERS                            */
/* -------------------------------------------------------------------------- */

function sanitizeFileName(
  value:
    string,
): string {
  const sanitized =
    value
      .normalize(
        "NFKC",
      )
      .replace(
        /[\u0000-\u001F\u007F]/g,
        "",
      )
      .replace(
        /[\\/]/g,
        "-",
      )
      .replace(
        /\s+/g,
        " ",
      )
      .trim()
      .slice(
        0,
        180,
      );

  return (
    sanitized ||
    "image"
  );
}

async function deleteRejectedFile(
  fileKey:
    string,
): Promise<void> {
  try {
    await uploadThingApi.deleteFiles(
      fileKey,
    );
  } catch (
    error: unknown
  ) {
    console.error(
      "[UPLOADTHING_REJECTED_FILE_DELETE]",
      {
        fileKey,
        error,
      },
    );
  }
}

async function validateUploadedImage(
  file:
    UploadedImageFile,
): Promise<void> {
  const normalizedType =
    file.type
      .trim()
      .toLowerCase();

  const validType =
    ALLOWED_IMAGE_TYPES.has(
      normalizedType,
    );

  const validSize =
    Number.isInteger(
      file.size,
    ) &&
    file.size >
      0 &&
    file.size <=
      MAX_IMAGE_SIZE_BYTES;

  const validKey =
    typeof file.key ===
      "string" &&
    file.key.trim().length >
      0 &&
    file.key.length <=
      500;

  if (
    validType &&
    validSize &&
    validKey
  ) {
    return;
  }

  if (
    validKey
  ) {
    await deleteRejectedFile(
      file.key,
    );
  }

  throw new UploadThingError(
    "Le fichier envoyé n’est pas une image JPEG, PNG ou WEBP valide de moins de 8 Mo.",
  );
}

function getUploadExpirationDate(
  purpose:
    UploadPurpose,
): Date {
  const expirationDelay =
    purpose ===
    "APPOINTMENT_INSPIRATION"
      ? APPOINTMENT_UPLOAD_EXPIRATION_MS
      : ADMIN_UPLOAD_EXPIRATION_MS;

  return new Date(
    Date.now() +
      expirationDelay,
  );
}

async function createUploadResult({
  metadata,
  file,
  purpose,
}: {
  metadata: {
    userId:
      string;
  };

  file:
    UploadedImageFile;

  purpose:
    UploadPurpose;
}) {
  await validateUploadedImage(
    file,
  );

  const fileName =
    sanitizeFileName(
      file.name,
    );

  const mimeType =
    file.type
      .trim()
      .toLowerCase();

  const expiresAt =
    getUploadExpirationDate(
      purpose,
    );

  /*
   * Cette écriture est exécutée depuis
   * le callback serveur signé d’UploadThing.
   *
   * Le navigateur ne peut donc pas choisir
   * arbitrairement le propriétaire, la taille,
   * le type MIME ou la clé du fichier.
   */
  const registeredUpload =
    await prisma.securityUpload.upsert({
      where: {
        key:
          file.key,
      },

      create: {
        key:
          file.key,

        url:
          file.ufsUrl,

        uploadedById:
          metadata.userId,

        purpose,

        fileName,
        mimeType,

        sizeBytes:
          file.size,

        expiresAt,
      },

      /*
       * Un callback UploadThing peut être rejoué.
       * On prolonge uniquement l’expiration, sans
       * modifier le propriétaire ni l’utilisation
       * éventuelle du fichier.
       */
      update: {
        expiresAt,
      },

      select: {
        uploadedById:
          true,

        purpose:
          true,

        claimedAt:
          true,
      },
    });

  if (
    registeredUpload.uploadedById !==
      metadata.userId ||
    registeredUpload.purpose !==
      purpose
  ) {
    console.error(
      "[UPLOADTHING_REGISTRY_CONFLICT]",
      {
        fileKey:
          file.key,

        expectedUserId:
          metadata.userId,

        registeredUserId:
          registeredUpload.uploadedById,

        expectedPurpose:
          purpose,

        registeredPurpose:
          registeredUpload.purpose,

        alreadyClaimed:
          Boolean(
            registeredUpload.claimedAt,
          ),
      },
    );

    throw new UploadThingError(
      "Le fichier envoyé ne peut pas être enregistré.",
    );
  }

  return {
    uploadedBy:
      metadata.userId,

    purpose,

    url:
      file.ufsUrl,

    fileName,
    mimeType,

    sizeBytes:
      file.size,

    key:
      file.key,
  };
}

/* -------------------------------------------------------------------------- */
/*                              ROUTEUR UPLOAD                                */
/* -------------------------------------------------------------------------- */

export const uploadRouter = {
  galleryUploader: upload({
    image: {
      maxFileSize:
        "8MB",

      maxFileCount:
        10,

      contentDisposition:
        "inline",
    },
  })
    .middleware(
      async ({
        req,
      }) => {
        const user =
          await requireAdminUser();

        await enforceUploadSecurity({
          request:
            req,

          userId:
            user.userId,

          purpose:
            "GALLERY",

          maxUserBatches:
            ADMIN_UPLOAD_MAX_BATCHES,
        });

        return {
          userId:
            user.userId,
        };
      },
    )
    .onUploadComplete(
      async ({
        metadata,
        file,
      }) =>
        createUploadResult({
          metadata,
          file,
          purpose:
            "GALLERY",
        }),
    ),

  serviceUploader: upload({
    image: {
      maxFileSize:
        "8MB",

      maxFileCount:
        10,

      contentDisposition:
        "inline",
    },
  })
    .middleware(
      async ({
        req,
      }) => {
        const user =
          await requireAdminUser();

        await enforceUploadSecurity({
          request:
            req,

          userId:
            user.userId,

          purpose:
            "SERVICE",

          maxUserBatches:
            ADMIN_UPLOAD_MAX_BATCHES,
        });

        return {
          userId:
            user.userId,
        };
      },
    )
    .onUploadComplete(
      async ({
        metadata,
        file,
      }) =>
        createUploadResult({
          metadata,
          file,
          purpose:
            "SERVICE",
        }),
    ),

  siteSettingsUploader: upload({
    image: {
      maxFileSize:
        "8MB",

      maxFileCount:
        10,

      contentDisposition:
        "inline",
    },
  })
    .middleware(
      async ({
        req,
      }) => {
        const user =
          await requireAdminUser();

        await enforceUploadSecurity({
          request:
            req,

          userId:
            user.userId,

          purpose:
            "SITE_SETTINGS",

          maxUserBatches:
            ADMIN_UPLOAD_MAX_BATCHES,
        });

        return {
          userId:
            user.userId,
        };
      },
    )
    .onUploadComplete(
      async ({
        metadata,
        file,
      }) =>
        createUploadResult({
          metadata,
          file,
          purpose:
            "SITE_SETTINGS",
        }),
    ),

  appointmentInspirations: upload({
    image: {
      maxFileSize:
        "8MB",

      maxFileCount:
        5,

      contentDisposition:
        "inline",
    },
  })
    .middleware(
      async ({
        req,
      }) => {
        const user =
          await requireClientUser();

        await enforceUploadSecurity({
          request:
            req,

          userId:
            user.userId,

          purpose:
            "APPOINTMENT_INSPIRATION",

          maxUserBatches:
            CLIENT_UPLOAD_MAX_BATCHES,
        });

        return {
          userId:
            user.userId,
        };
      },
    )
    .onUploadComplete(
      async ({
        metadata,
        file,
      }) =>
        createUploadResult({
          metadata,
          file,
          purpose:
            "APPOINTMENT_INSPIRATION",
        }),
    ),
} satisfies FileRouter;

export type UploadRouter =
  typeof uploadRouter;
