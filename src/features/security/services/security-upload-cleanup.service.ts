import {
  randomUUID,
} from "node:crypto";

import {
  UTApi,
} from "uploadthing/server";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

const uploadThingApi =
  new UTApi();

const MAX_UPLOADS_PER_RUN =
  50;

const CLEANUP_CONCURRENCY =
  5;

const CLEANUP_LOCK_TIMEOUT_MS =
  15 * 60 * 1000;

const MAX_CLEANUP_ATTEMPTS =
  10;

const MAX_ERROR_LENGTH =
  1_000;

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type SecurityUploadCleanupResult = {
  runId:
    string;

  selected:
    number;

  locked:
    number;

  deleted:
    number;

  failed:
    number;

  skipped:
    number;

  deletedBytes:
    number;

  startedAt:
    string;

  completedAt:
    string;
};

type LockedUpload = {
  id:
    string;

  key:
    string;

  purpose:
    string;

  sizeBytes:
    number;
};

/* -------------------------------------------------------------------------- */
/*                                   OUTILS                                   */
/* -------------------------------------------------------------------------- */

function serializeCleanupError(
  reason:
    unknown,
): string {
  const message =
    reason instanceof Error
      ? `${reason.name}: ${reason.message}`
      : String(
          reason,
        );

  return message.slice(
    0,
    MAX_ERROR_LENGTH,
  );
}

async function releaseFailedUpload({
  uploadId,
  runId,
  reason,
}: {
  uploadId:
    string;

  runId:
    string;

  reason:
    unknown;
}): Promise<void> {
  try {
    await prisma.securityUpload.updateMany({
      where: {
        id:
          uploadId,

        cleanupRunId:
          runId,

        claimedAt:
          null,
      },

      data: {
        cleanupRunId:
          null,

        cleanupStartedAt:
          null,

        cleanupLastError:
          serializeCleanupError(
            reason,
          ),
      },
    });
  } catch (
    releaseError:
      unknown
  ) {
    console.error(
      "[SECURITY_UPLOAD_CLEANUP_RELEASE_FAILED]",
      {
        uploadId,
        runId,
        releaseError,
      },
    );
  }
}

async function deleteLockedUpload({
  upload,
  runId,
}: {
  upload:
    LockedUpload;

  runId:
    string;
}): Promise<
  | "DELETED"
  | "FAILED"
  | "SKIPPED"
> {
  try {
    /*
     * Le fichier est supprimé du stockage avant
     * la suppression du registre PostgreSQL.
     *
     * En cas d’arrêt entre les deux opérations,
     * le verrou expirera et le nettoyage pourra
     * être retenté lors d’une prochaine exécution.
     */
    await uploadThingApi.deleteFiles(
      upload.key,
    );

    const deletion =
      await prisma.securityUpload.deleteMany({
        where: {
          id:
            upload.id,

          cleanupRunId:
            runId,

          claimedAt:
            null,
        },
      });

    if (
      deletion.count !==
      1
    ) {
      console.warn(
        "[SECURITY_UPLOAD_CLEANUP_ROW_SKIPPED]",
        {
          uploadId:
            upload.id,

          purpose:
            upload.purpose,

          runId,
        },
      );

      return "SKIPPED";
    }

    return "DELETED";
  } catch (
    reason:
      unknown
  ) {
    console.error(
      "[SECURITY_UPLOAD_CLEANUP_DELETE_FAILED]",
      {
        uploadId:
          upload.id,

        purpose:
          upload.purpose,

        runId,

        reason,
      },
    );

    await releaseFailedUpload({
      uploadId:
        upload.id,

      runId,

      reason,
    });

    return "FAILED";
  }
}

/* -------------------------------------------------------------------------- */
/*                                  NETTOYAGE                                 */
/* -------------------------------------------------------------------------- */

export async function cleanupExpiredSecurityUploads():
  Promise<SecurityUploadCleanupResult> {
  const startedAt =
    new Date();

  const runId =
    randomUUID();

  const staleLockBefore =
    new Date(
      startedAt.getTime() -
        CLEANUP_LOCK_TIMEOUT_MS,
    );

  /*
   * On sélectionne uniquement :
   * - les fichiers non revendiqués ;
   * - dont l’expiration est dépassée ;
   * - qui ne sont pas verrouillés ou dont le
   *   verrou appartient à une exécution abandonnée ;
   * - qui n’ont pas dépassé le nombre de tentatives.
   */
  const candidates =
    await prisma.securityUpload.findMany({
      where: {
        claimedAt:
          null,

        expiresAt: {
          lte:
            startedAt,
        },

        cleanupAttempts: {
          lt:
            MAX_CLEANUP_ATTEMPTS,
        },

        OR: [
          {
            cleanupRunId:
              null,
          },
          {
            cleanupStartedAt:
              null,
          },
          {
            cleanupStartedAt: {
              lte:
                staleLockBefore,
            },
          },
        ],
      },

      orderBy: [
        {
          expiresAt:
            "asc",
        },
        {
          createdAt:
            "asc",
        },
      ],

      take:
        MAX_UPLOADS_PER_RUN,

      select: {
        id:
          true,
      },
    });

  const candidateIds =
    candidates.map(
      (candidate) =>
        candidate.id,
    );

  if (
    candidateIds.length ===
    0
  ) {
    const completedAt =
      new Date();

    return {
      runId,

      selected:
        0,

      locked:
        0,

      deleted:
        0,

      failed:
        0,

      skipped:
        0,

      deletedBytes:
        0,

      startedAt:
        startedAt.toISOString(),

      completedAt:
        completedAt.toISOString(),
    };
  }

  /*
   * Verrouillage optimiste. Deux crons concurrents
   * peuvent sélectionner les mêmes lignes, mais un
   * seul pourra leur attribuer son runId.
   */
  await prisma.securityUpload.updateMany({
    where: {
      id: {
        in:
          candidateIds,
      },

      claimedAt:
        null,

      expiresAt: {
        lte:
          startedAt,
      },

      cleanupAttempts: {
        lt:
          MAX_CLEANUP_ATTEMPTS,
      },

      OR: [
        {
          cleanupRunId:
            null,
        },
        {
          cleanupStartedAt:
            null,
        },
        {
          cleanupStartedAt: {
            lte:
              staleLockBefore,
          },
        },
      ],
    },

    data: {
      cleanupRunId:
        runId,

      cleanupStartedAt:
        startedAt,

      cleanupAttempts: {
        increment:
          1,
      },

      cleanupLastError:
        null,
    },
  });

  const lockedUploads =
    await prisma.securityUpload.findMany({
      where: {
        id: {
          in:
            candidateIds,
        },

        cleanupRunId:
          runId,

        cleanupStartedAt:
          startedAt,

        claimedAt:
          null,
      },

      select: {
        id:
          true,

        key:
          true,

        purpose:
          true,

        sizeBytes:
          true,
      },
    });

  let nextIndex =
    0;

  let deleted =
    0;

  let failed =
    0;

  let skipped =
    0;

  let deletedBytes =
    0;

  async function worker():
    Promise<void> {
    while (
      true
    ) {
      const currentIndex =
        nextIndex;

      nextIndex +=
        1;

      const upload =
        lockedUploads[
          currentIndex
        ];

      if (
        !upload
      ) {
        return;
      }

      const status =
        await deleteLockedUpload({
          upload,

          runId,
        });

      switch (
        status
      ) {
        case "DELETED":
          deleted +=
            1;

          deletedBytes +=
            upload.sizeBytes;

          break;

        case "FAILED":
          failed +=
            1;

          break;

        case "SKIPPED":
          skipped +=
            1;

          break;
      }
    }
  }

  const workerCount =
    Math.min(
      CLEANUP_CONCURRENCY,
      lockedUploads.length,
    );

  await Promise.all(
    Array.from(
      {
        length:
          workerCount,
      },
      () =>
        worker(),
    ),
  );

  const completedAt =
    new Date();

  const result:
    SecurityUploadCleanupResult = {
    runId,

    selected:
      candidateIds.length,

    locked:
      lockedUploads.length,

    deleted,

    failed,

    skipped,

    deletedBytes,

    startedAt:
      startedAt.toISOString(),

    completedAt:
      completedAt.toISOString(),
  };

  try {
    await prisma.auditLog.create({
      data: {
        action:
          "SECURITY_UPLOAD_CLEANUP",

        entityType:
          "SecurityUpload",

        metadata:
          result,
      },
    });
  } catch (
    reason:
      unknown
  ) {
    /*
     * Une panne du journal d’audit ne doit pas
     * faire échouer les suppressions déjà réalisées.
     */
    console.error(
      "[SECURITY_UPLOAD_CLEANUP_AUDIT_FAILED]",
      {
        runId,
        reason,
      },
    );
  }

  return result;
}
