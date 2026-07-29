import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  DEFAULT_WEBSITE_SETTINGS,
} from "@/features/admin/settings/constants/admin-settings.defaults";

import {
  websiteSettingsSchema,
} from "@/features/admin/settings/schemas/admin-settings.schemas";

import {
  WEBSITE_IMAGE_FIELDS,
} from "@/features/admin/settings/types/admin-settings.types";

import type {
  WebsiteImageField,
  WebsiteImageUploadKeys,
  WebsiteSettings,
} from "@/features/admin/settings/types/admin-settings.types";

/* -------------------------------------------------------------------------- */
/*                                   ERREUR                                   */
/* -------------------------------------------------------------------------- */

export class WebsiteSettingsImageSecurityError extends Error {
  readonly fieldErrors:
    Record<
      string,
      string[]
    >;

  constructor(
    message:
      string,

    fieldErrors:
      Record<
        string,
        string[]
      >,
  ) {
    super(
      message,
    );

    this.name =
      "WebsiteSettingsImageSecurityError";

    this.fieldErrors =
      fieldErrors;
  }
}

/* -------------------------------------------------------------------------- */
/*                                   OUTILS                                   */
/* -------------------------------------------------------------------------- */

const WEBSITE_IMAGE_FIELD_SET =
  new Set<string>(
    WEBSITE_IMAGE_FIELDS,
  );

function failImage(
  field:
    WebsiteImageField,

  message:
    string,
): never {
  throw new WebsiteSettingsImageSecurityError(
    "Une image des paramètres du site est invalide.",
    {
      [field]: [
        message,
      ],
    },
  );
}

function isJsonObject(
  value:
    Prisma.JsonValue |
    null |
    undefined,
): value is Prisma.JsonObject {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  );
}

/* -------------------------------------------------------------------------- */
/*                        EXTRACTION DES CLÉS CLIENT                          */
/* -------------------------------------------------------------------------- */

export function extractWebsiteImageUploadKeys(
  rawValue:
    unknown,
): WebsiteImageUploadKeys {
  if (
    typeof rawValue !==
      "object" ||
    rawValue ===
      null ||
    Array.isArray(
      rawValue,
    )
  ) {
    return {};
  }

  const payload =
    rawValue as
      Record<
        string,
        unknown
      >;

  const rawKeys =
    payload.imageUploadKeys;

  if (
    rawKeys ===
      undefined ||
    rawKeys ===
      null
  ) {
    return {};
  }

  if (
    typeof rawKeys !==
      "object" ||
    Array.isArray(
      rawKeys,
    )
  ) {
    throw new WebsiteSettingsImageSecurityError(
      "Les clés des images du site sont invalides.",
      {
        website: [
          "Rechargez la page puis envoyez de nouveau les images.",
        ],
      },
    );
  }

  const result:
    WebsiteImageUploadKeys =
    {};

  for (
    const [
      rawField,
      rawKey,
    ]
    of Object.entries(
      rawKeys,
    )
  ) {
    if (
      !WEBSITE_IMAGE_FIELD_SET.has(
        rawField,
      )
    ) {
      throw new WebsiteSettingsImageSecurityError(
        "Un champ d’image du site est invalide.",
        {
          website: [
            "Rechargez la page puis recommencez.",
          ],
        },
      );
    }

    const field =
      rawField as
        WebsiteImageField;

    if (
      rawKey ===
        undefined ||
      rawKey ===
        null ||
      rawKey ===
        ""
    ) {
      continue;
    }

    if (
      typeof rawKey !==
        "string"
    ) {
      failImage(
        field,
        "La clé de cette image est invalide.",
      );
    }

    const key =
      rawKey.trim();

    if (
      key.length ===
        0 ||
      key.length >
        500
    ) {
      failImage(
        field,
        "La clé de cette image est invalide.",
      );
    }

    result[field] =
      key;
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*                        ANCIENNES VALEURS FIABLES                           */
/* -------------------------------------------------------------------------- */

export function getStoredWebsiteSettings(
  value:
    Prisma.JsonValue |
    null |
    undefined,
): WebsiteSettings {
  const candidate =
    isJsonObject(
      value,
    )
      ? {
          ...DEFAULT_WEBSITE_SETTINGS,
          ...value,
        }
      : {
          ...DEFAULT_WEBSITE_SETTINGS,
        };

  const parsed =
    websiteSettingsSchema.safeParse(
      candidate,
    );

  return parsed.success
    ? parsed.data
    : {
        ...DEFAULT_WEBSITE_SETTINGS,
      };
}

/* -------------------------------------------------------------------------- */
/*                        RÉSOLUTION DES URL FIABLES                          */
/* -------------------------------------------------------------------------- */

export async function resolveTrustedWebsiteSettings({
  transaction,
  actorId,
  submittedSettings,
  previousSettings,
  uploadKeys,
}: {
  transaction:
    Prisma.TransactionClient;

  actorId:
    string;

  submittedSettings:
    WebsiteSettings;

  previousSettings:
    WebsiteSettings;

  uploadKeys:
    WebsiteImageUploadKeys;
}): Promise<WebsiteSettings> {
  const trustedSettings:
    WebsiteSettings = {
    ...submittedSettings,
  };

  const uniqueUploadKeys =
    new Set<string>();

  for (
    const field
    of WEBSITE_IMAGE_FIELDS
  ) {
    const uploadKey =
      uploadKeys[field];

    if (
      !uploadKey
    ) {
      continue;
    }

    if (
      uniqueUploadKeys.has(
        uploadKey,
      )
    ) {
      failImage(
        field,
        "Une même image ne peut pas être utilisée dans plusieurs champs.",
      );
    }

    uniqueUploadKeys.add(
      uploadKey,
    );

    if (
      submittedSettings[
        field
      ].trim() ===
      ""
    ) {
      failImage(
        field,
        "L’image envoyée a été retirée du formulaire.",
      );
    }
  }

  const validationDate =
    new Date();

  const registeredUploads =
    uniqueUploadKeys.size >
    0
      ? await transaction.securityUpload.findMany({
          where: {
            key: {
              in:
                Array.from(
                  uniqueUploadKeys,
                ),
            },

            uploadedById:
              actorId,

            purpose:
              "SITE_SETTINGS",

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
    uniqueUploadKeys.size
  ) {
    throw new WebsiteSettingsImageSecurityError(
      "Une image du site est expirée, déjà utilisée ou n’appartient pas à votre compte.",
      {
        website: [
          "Supprimez l’image concernée puis envoyez-la de nouveau.",
        ],
      },
    );
  }

  const registeredByKey =
    new Map(
      registeredUploads.map(
        (upload) => [
          upload.key,
          upload,
        ],
      ),
    );

  for (
    const field
    of WEBSITE_IMAGE_FIELDS
  ) {
    const submittedUrl =
      submittedSettings[
        field
      ].trim();

    const previousUrl =
      previousSettings[
        field
      ].trim();

    const uploadKey =
      uploadKeys[field];

    if (
      uploadKey
    ) {
      const registeredUpload =
        registeredByKey.get(
          uploadKey,
        );

      if (
        !registeredUpload
      ) {
        failImage(
          field,
          "Cette image n’a pas pu être vérifiée.",
        );
      }

      /*
       * L’URL du navigateur est ignorée.
       * Seule l’URL enregistrée par le callback
       * signé UploadThing est conservée.
       */
      trustedSettings[
        field
      ] =
        registeredUpload.url;

      continue;
    }

    /*
     * Sans clé UploadThing :
     * - l’ancienne URL peut être conservée ;
     * - le champ peut être vidé ;
     * - une autre URL ne peut pas être injectée.
     */
    if (
      submittedUrl !==
        "" &&
      submittedUrl !==
        previousUrl
    ) {
      failImage(
        field,
        "Toute nouvelle image doit être envoyée depuis ce formulaire.",
      );
    }

    trustedSettings[
      field
    ] =
      submittedUrl;
  }

  return trustedSettings;
}

/* -------------------------------------------------------------------------- */
/*                         REVENDICATION ATOMIQUE                             */
/* -------------------------------------------------------------------------- */

export async function claimWebsiteImageUploads({
  transaction,
  actorId,
  settingId,
  uploadKeys,
}: {
  transaction:
    Prisma.TransactionClient;

  actorId:
    string;

  settingId:
    string;

  uploadKeys:
    WebsiteImageUploadKeys;
}): Promise<void> {
  const keys =
    Array.from(
      new Set(
        Object.values(
          uploadKeys,
        ).filter(
          (
            key,
          ): key is string =>
            typeof key ===
              "string" &&
            key.length >
              0,
        ),
      ),
    );

  if (
    keys.length ===
    0
  ) {
    return;
  }

  const claimedAt =
    new Date();

  const result =
    await transaction.securityUpload.updateMany({
      where: {
        key: {
          in:
            keys,
        },

        uploadedById:
          actorId,

        purpose:
          "SITE_SETTINGS",

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
          "WebsiteSettings",

        claimedEntityId:
          settingId,
      },
    });

  if (
    result.count !==
    keys.length
  ) {
    throw new WebsiteSettingsImageSecurityError(
      "Une image du site vient déjà d’être utilisée.",
      {
        website: [
          "Rechargez la page puis envoyez de nouveau l’image.",
        ],
      },
    );
  }
}
