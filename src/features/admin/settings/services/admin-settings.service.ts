import type {
  Prisma,
} from "@/generated/prisma/client";

import type {
  ZodType,
} from "zod";

import {
  DEFAULT_BOOKING_SETTINGS,
  DEFAULT_LEGAL_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PAYMENT_SETTINGS,
  DEFAULT_SALON_SETTINGS,
  DEFAULT_SOCIAL_SETTINGS,
  DEFAULT_WEBSITE_SETTINGS,
} from "@/features/admin/settings/constants/admin-settings.defaults";

import {
  bookingSettingsSchema,
  legalSettingsSchema,
  notificationSettingsSchema,
  paymentSettingsSchema,
  salonSettingsSchema,
  socialSettingsSchema,
  websiteSettingsSchema,
} from "@/features/admin/settings/schemas/admin-settings.schemas";

import type {
  AdminSettingsData,
  AdminSettingsSection,
  BookingSettings,
  LegalSettings,
  NotificationSettings,
  PaymentSettings,
  PaypalConfigurationStatus,
  SalonSettings,
  SocialSettings,
  WebsiteSettings,
} from "@/features/admin/settings/types/admin-settings.types";

import {
  ADMIN_SETTING_KEYS,
} from "@/features/admin/settings/types/admin-settings.types";

import {
  claimWebsiteImageUploads,
  extractWebsiteImageUploadKeys,
  getStoredWebsiteSettings,
  resolveTrustedWebsiteSettings,
  WebsiteSettingsImageSecurityError,
} from "@/features/admin/settings/services/website-settings-image-security.service";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminSettingsSectionMap = {
  SALON: SalonSettings;
  BOOKING: BookingSettings;
  PAYMENTS: PaymentSettings;
  NOTIFICATIONS: NotificationSettings;
  WEBSITE: WebsiteSettings;
  SOCIAL: SocialSettings;
  LEGAL: LegalSettings;
};

type SettingRow = {
  id: string;
  key: string;
  value: Prisma.JsonValue;
  updatedAt: Date;
};

type SectionConfiguration = {
  key: string;
  description: string;
  isPublic: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                  ERREURS                                   */
/* -------------------------------------------------------------------------- */

export class AdminSettingsValidationError extends Error {
  readonly fieldErrors: Record<
    string,
    string[]
  >;

  constructor(
    message: string,
    fieldErrors: Record<
      string,
      string[]
    >,
  ) {
    super(message);

    this.name =
      "AdminSettingsValidationError";

    this.fieldErrors =
      fieldErrors;
  }
}

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

const SECTION_CONFIGURATIONS:
  Record<
    AdminSettingsSection,
    SectionConfiguration
  > = {
    SALON: {
      key:
        ADMIN_SETTING_KEYS.salon,

      description:
        "Informations générales et coordonnées du salon.",

      isPublic:
        true,
    },

    BOOKING: {
      key:
        ADMIN_SETTING_KEYS.booking,

      description:
        "Configuration générale de la réservation en ligne.",

      isPublic:
        true,
    },

    PAYMENTS: {
      key:
        ADMIN_SETTING_KEYS.payments,

      description:
        "Configuration des acomptes et paiements PayPal.",

      isPublic:
        false,
    },

    NOTIFICATIONS: {
      key:
        ADMIN_SETTING_KEYS.notifications,

      description:
        "Configuration des notifications et rappels automatiques.",

      isPublic:
        false,
    },

    WEBSITE: {
      key:
        ADMIN_SETTING_KEYS.website,

      description:
        "Affichage, identité visuelle et référencement du site.",

      isPublic:
        true,
    },

    SOCIAL: {
      key:
        ADMIN_SETTING_KEYS.social,

      description:
        "Liens vers les réseaux sociaux et plateformes externes.",

      isPublic:
        true,
    },

    LEGAL: {
      key:
        ADMIN_SETTING_KEYS.legal,

      description:
        "Informations légales et administratives de l’entreprise.",

      isPublic:
        false,
    },
  };

/* -------------------------------------------------------------------------- */
/*                               OUTILS JSON                                  */
/* -------------------------------------------------------------------------- */

function isJsonObject(
  value: Prisma.JsonValue,
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

function toInputJsonValue(
  value: unknown,
): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(
      value,
    ),
  ) as Prisma.InputJsonValue;
}

function areValuesEqual(
  firstValue: unknown,
  secondValue: unknown,
): boolean {
  return (
    JSON.stringify(
      firstValue,
    ) ===
    JSON.stringify(
      secondValue,
    )
  );
}

function getChangedFields(
  previousValue: Prisma.JsonValue | null,
  nextValue: Record<
    string,
    unknown
  >,
): string[] {
  if (
    previousValue ===
      null ||
    !isJsonObject(
      previousValue,
    )
  ) {
    return Object.keys(
      nextValue,
    );
  }

  return Object.keys(
    nextValue,
  ).filter(
    (field) =>
      !areValuesEqual(
        previousValue[
          field
        ],
        nextValue[
          field
        ],
      ),
  );
}

/* -------------------------------------------------------------------------- */
/*                              OUTILS ZOD                                    */
/* -------------------------------------------------------------------------- */

function normalizeFieldErrors(
  errors: Record<
    string,
    string[] | undefined
  >,
): Record<
  string,
  string[]
> {
  return Object.fromEntries(
    Object.entries(
      errors,
    ).filter(
      (
        entry,
      ): entry is [
        string,
        string[],
      ] =>
        Array.isArray(
          entry[1],
        ) &&
        entry[1].length >
          0,
    ),
  );
}

function parseWithSchema<T>(
  schema: ZodType<T>,
  value: unknown,
): T {
  const result =
    schema.safeParse(
      value,
    );

  if (
    result.success
  ) {
    return result.data;
  }

  throw new AdminSettingsValidationError(
    "Certains champs sont incorrects. Vérifie les informations renseignées.",
    normalizeFieldErrors(
      result.error.flatten()
        .fieldErrors,
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                          VALEURS PAR SECTION                               */
/* -------------------------------------------------------------------------- */

export function getDefaultAdminSettingsSection<
  Section extends AdminSettingsSection,
>(
  section: Section,
): AdminSettingsSectionMap[Section] {
  switch (
    section
  ) {
    case "SALON":
      return structuredClone(
        DEFAULT_SALON_SETTINGS,
      ) as AdminSettingsSectionMap[Section];

    case "BOOKING":
      return structuredClone(
        DEFAULT_BOOKING_SETTINGS,
      ) as AdminSettingsSectionMap[Section];

    case "PAYMENTS":
      return structuredClone(
        DEFAULT_PAYMENT_SETTINGS,
      ) as AdminSettingsSectionMap[Section];

    case "NOTIFICATIONS":
      return structuredClone(
        DEFAULT_NOTIFICATION_SETTINGS,
      ) as AdminSettingsSectionMap[Section];

    case "WEBSITE":
      return structuredClone(
        DEFAULT_WEBSITE_SETTINGS,
      ) as AdminSettingsSectionMap[Section];

    case "SOCIAL":
      return structuredClone(
        DEFAULT_SOCIAL_SETTINGS,
      ) as AdminSettingsSectionMap[Section];

    case "LEGAL":
      return structuredClone(
        DEFAULT_LEGAL_SETTINGS,
      ) as AdminSettingsSectionMap[Section];
  }
}

function parseAdminSettingsSection<
  Section extends AdminSettingsSection,
>(
  section: Section,
  value: unknown,
): AdminSettingsSectionMap[Section] {
  switch (
    section
  ) {
    case "SALON":
      return parseWithSchema(
        salonSettingsSchema,
        value,
      ) as AdminSettingsSectionMap[Section];

    case "BOOKING":
      return parseWithSchema(
        bookingSettingsSchema,
        value,
      ) as AdminSettingsSectionMap[Section];

    case "PAYMENTS":
      return parseWithSchema(
        paymentSettingsSchema,
        value,
      ) as AdminSettingsSectionMap[Section];

    case "NOTIFICATIONS":
      return parseWithSchema(
        notificationSettingsSchema,
        value,
      ) as AdminSettingsSectionMap[Section];

    case "WEBSITE":
      return parseWithSchema(
        websiteSettingsSchema,
        value,
      ) as AdminSettingsSectionMap[Section];

    case "SOCIAL":
      return parseWithSchema(
        socialSettingsSchema,
        value,
      ) as AdminSettingsSectionMap[Section];

    case "LEGAL":
      return parseWithSchema(
        legalSettingsSchema,
        value,
      ) as AdminSettingsSectionMap[Section];
  }
}

/* -------------------------------------------------------------------------- */
/*                         LECTURE DES VALEURS DB                              */
/* -------------------------------------------------------------------------- */

function readStoredSection<T>(
  row: SettingRow | undefined,
  defaultValue: T,
  schema: ZodType<T>,
): T {
  if (
    !row ||
    !isJsonObject(
      row.value,
    )
  ) {
    return structuredClone(
      defaultValue,
    );
  }

  const mergedValue = {
    ...structuredClone(
      defaultValue,
    ),
    ...row.value,
  };

  const result =
    schema.safeParse(
      mergedValue,
    );

  if (
    !result.success
  ) {
    return structuredClone(
      defaultValue,
    );
  }

  return result.data;
}

/* -------------------------------------------------------------------------- */
/*                              STATUT PAYPAL                                 */
/* -------------------------------------------------------------------------- */

function hasEnvironmentValue(
  name: string,
): boolean {
  return Boolean(
    process.env[
      name
    ]?.trim(),
  );
}

function getPaypalConfigurationStatus():
  PaypalConfigurationStatus {
  const configuredEnvironment =
    process.env
      .PAYPAL_ENVIRONMENT
      ?.trim()
      .toLowerCase();

  const environment:
    PaypalConfigurationStatus["environment"] =
    configuredEnvironment ===
    "live"
      ? "LIVE"
      : configuredEnvironment ===
          "sandbox"
        ? "SANDBOX"
        : "UNKNOWN";

  const clientIdConfigured =
    hasEnvironmentValue(
      "PAYPAL_CLIENT_ID",
    );

  const clientSecretConfigured =
    hasEnvironmentValue(
      "PAYPAL_CLIENT_SECRET",
    );

  const webhookIdConfigured =
    hasEnvironmentValue(
      "PAYPAL_WEBHOOK_ID",
    );

  return {
    environment,
    clientIdConfigured,
    clientSecretConfigured,
    webhookIdConfigured,

    fullyConfigured:
      clientIdConfigured &&
      clientSecretConfigured &&
      webhookIdConfigured &&
      environment !==
        "UNKNOWN",
  };
}

/* -------------------------------------------------------------------------- */
/*                              CONTRÔLE ADMIN                                */
/* -------------------------------------------------------------------------- */

async function assertSettingsActor(
  actorId: string,
): Promise<{
  id: string;
}> {
  const actor =
    await prisma.user.findFirst({
      where: {
        id:
          actorId,

        role: {
          in: [
            "SUPER_ADMIN",
            "ADMIN",
          ],
        },

        status:
          "ACTIVE",
      },

      select: {
        id:
          true,
      },
    });

  if (
    !actor
  ) {
    throw new Error(
      "Accès aux paramètres administrateur refusé.",
    );
  }

  return actor;
}

/* -------------------------------------------------------------------------- */
/*                                  LECTURE                                   */
/* -------------------------------------------------------------------------- */

export async function getAdminSettings():
  Promise<AdminSettingsData> {
  const rows =
    await prisma.setting.findMany({
      where: {
        key: {
          in:
            Object.values(
              ADMIN_SETTING_KEYS,
            ),
        },
      },

      select: {
        id:
          true,

        key:
          true,

        value:
          true,

        updatedAt:
          true,
      },
    });

  const settingsByKey =
    new Map<
      string,
      SettingRow
    >(
      rows.map(
        (row) => [
          row.key,
          row,
        ],
      ),
    );

  const salon =
    readStoredSection(
      settingsByKey.get(
        ADMIN_SETTING_KEYS
          .salon,
      ),
      DEFAULT_SALON_SETTINGS,
      salonSettingsSchema,
    );

  const booking =
    readStoredSection(
      settingsByKey.get(
        ADMIN_SETTING_KEYS
          .booking,
      ),
      DEFAULT_BOOKING_SETTINGS,
      bookingSettingsSchema,
    );

  const payments =
    readStoredSection(
      settingsByKey.get(
        ADMIN_SETTING_KEYS
          .payments,
      ),
      DEFAULT_PAYMENT_SETTINGS,
      paymentSettingsSchema,
    );

  const notifications =
    readStoredSection(
      settingsByKey.get(
        ADMIN_SETTING_KEYS
          .notifications,
      ),
      DEFAULT_NOTIFICATION_SETTINGS,
      notificationSettingsSchema,
    );

  const website =
    readStoredSection(
      settingsByKey.get(
        ADMIN_SETTING_KEYS
          .website,
      ),
      DEFAULT_WEBSITE_SETTINGS,
      websiteSettingsSchema,
    );

  const social =
    readStoredSection(
      settingsByKey.get(
        ADMIN_SETTING_KEYS
          .social,
      ),
      DEFAULT_SOCIAL_SETTINGS,
      socialSettingsSchema,
    );

  const legal =
    readStoredSection(
      settingsByKey.get(
        ADMIN_SETTING_KEYS
          .legal,
      ),
      DEFAULT_LEGAL_SETTINGS,
      legalSettingsSchema,
    );

  const latestUpdate =
    rows.reduce<
      Date | null
    >(
      (
        latest,
        row,
      ) => {
        if (
          !latest ||
          row.updatedAt >
            latest
        ) {
          return row.updatedAt;
        }

        return latest;
      },
      null,
    );

  return {
    salon,
    booking,
    payments,
    notifications,
    website,
    social,
    legal,

    paypalStatus:
      getPaypalConfigurationStatus(),

    updatedAt:
      latestUpdate
        ?.toISOString() ??
      null,
  };
}

/* -------------------------------------------------------------------------- */
/*                         LECTURE PUBLIQUE DU SITE                           */
/* -------------------------------------------------------------------------- */

export async function getPublicWebsiteSettings():
  Promise<WebsiteSettings> {
  const row =
    await prisma.setting.findUnique({
      where: {
        key:
          ADMIN_SETTING_KEYS.website,
      },

      select: {
        id:
          true,

        key:
          true,

        value:
          true,

        updatedAt:
          true,
      },
    });

  return readStoredSection(
    row ??
      undefined,
    DEFAULT_WEBSITE_SETTINGS,
    websiteSettingsSchema,
  );
}

/* -------------------------------------------------------------------------- */
/*                              ENREGISTREMENT                                */
/* -------------------------------------------------------------------------- */

export async function saveAdminSettingsSection<
  Section extends AdminSettingsSection,
>(
  section:
    Section,

  rawValue:
    unknown,

  actorId:
    string,
): Promise<
  AdminSettingsSectionMap[Section]
> {
  const actor =
    await assertSettingsActor(
      actorId,
    );

  const configuration =
    SECTION_CONFIGURATIONS[
      section
    ];

  let websiteImageUploadKeys:
    ReturnType<
      typeof extractWebsiteImageUploadKeys
    > = {};

  try {
    if (
      section ===
      "WEBSITE"
    ) {
      websiteImageUploadKeys =
        extractWebsiteImageUploadKeys(
          rawValue,
        );
    }
  } catch (
    error:
      unknown
  ) {
    if (
      error instanceof
      WebsiteSettingsImageSecurityError
    ) {
      throw new AdminSettingsValidationError(
        error.message,
        error.fieldErrors,
      );
    }

    throw error;
  }

  const parsedValue =
    parseAdminSettingsSection(
      section,
      rawValue,
    );

  try {
    return await prisma.$transaction(
      async (
        transaction,
      ) => {
        const previousSetting =
          await transaction.setting.findUnique({
            where: {
              key:
                configuration.key,
            },

            select: {
              id:
                true,

              value:
                true,

              updatedAt:
                true,
            },
          });

        let trustedValue:
          AdminSettingsSectionMap[Section] =
          parsedValue;

        if (
          section ===
          "WEBSITE"
        ) {
          const previousWebsiteSettings =
            getStoredWebsiteSettings(
              previousSetting
                ?.value ??
                null,
            );

          const resolvedWebsiteSettings =
            await resolveTrustedWebsiteSettings({
              transaction,

              actorId:
                actor.id,

              submittedSettings:
                parsedValue as WebsiteSettings,

              previousSettings:
                previousWebsiteSettings,

              uploadKeys:
                websiteImageUploadKeys,
            });

          trustedValue =
            resolvedWebsiteSettings as
              AdminSettingsSectionMap[Section];
        }

        const inputJson =
          toInputJsonValue(
            trustedValue,
          );

        const changedFields =
          getChangedFields(
            previousSetting
              ?.value ??
              null,

            trustedValue as Record<
              string,
              unknown
            >,
          );

        const savedSetting =
          await transaction.setting.upsert({
            where: {
              key:
                configuration.key,
            },

            create: {
              key:
                configuration.key,

              value:
                inputJson,

              description:
                configuration.description,

              isPublic:
                configuration.isPublic,
            },

            update: {
              value:
                inputJson,

              description:
                configuration.description,

              isPublic:
                configuration.isPublic,
            },

            select: {
              id:
                true,
            },
          });

        if (
          section ===
          "WEBSITE"
        ) {
          await claimWebsiteImageUploads({
            transaction,

            actorId:
              actor.id,

            settingId:
              savedSetting.id,

            uploadKeys:
              websiteImageUploadKeys,
          });
        }

        await transaction.auditLog.create({
          data: {
            actorId:
              actor.id,

            action:
              "ADMIN_SETTINGS_UPDATED",

            entityType:
              "Setting",

            entityId:
              savedSetting.id,

            metadata:
              toInputJsonValue({
                section,

                key:
                  configuration.key,

                changedFields,

                websiteImagesClaimed:
                  section ===
                  "WEBSITE"
                    ? Object.keys(
                        websiteImageUploadKeys,
                      )
                    : [],

                previousUpdatedAt:
                  previousSetting
                    ?.updatedAt
                    .toISOString() ??
                  null,
              }),
          },
        });

        return trustedValue;
      },
    );
  } catch (
    error:
      unknown
  ) {
    if (
      error instanceof
      WebsiteSettingsImageSecurityError
    ) {
      throw new AdminSettingsValidationError(
        error.message,
        error.fieldErrors,
      );
    }

    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                            RÉINITIALISATION                                */
/* -------------------------------------------------------------------------- */

export async function resetAdminSettingsSection<
  Section extends AdminSettingsSection,
>(
  section: Section,
  actorId: string,
): Promise<
  AdminSettingsSectionMap[Section]
> {
  const defaultValue =
    getDefaultAdminSettingsSection(
      section,
    );

  const savedValue =
    await saveAdminSettingsSection(
      section,
      defaultValue,
      actorId,
    );

  await prisma.auditLog.create({
    data: {
      actorId,

      action:
        "ADMIN_SETTINGS_RESET",

      entityType:
        "Setting",

      entityId:
        SECTION_CONFIGURATIONS[
          section
        ].key,

      metadata:
        toInputJsonValue({
          section,

          key:
            SECTION_CONFIGURATIONS[
              section
            ].key,
        }),
    },
  });

  return savedValue;
}
