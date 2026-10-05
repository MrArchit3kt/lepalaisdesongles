import "server-only";

import webpush, { WebPushError } from "web-push";

import { prisma } from "@/lib/prisma";
import { isPushNotificationsEnabled } from "@/features/push/services/push-settings.service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type PushNotificationPayload = {
  title: string;
  body: string;
  url: string;
  icon?: string;
};

/* -------------------------------------------------------------------------- */
/*                               CONFIGURATION                                */
/* -------------------------------------------------------------------------- */

let vapidConfigured = false;
let vapidWarned = false;

/*
 * Configuration paresseuse (au premier envoi) : si les clés VAPID ne
 * sont pas renseignées, on log un seul avertissement et tous les
 * envois deviennent silencieusement des no-op — même logique
 * défensive que RESEND_API_KEY manquante dans
 * appointment-email.service.ts. Aucune notification push n'est un
 * prérequis au fonctionnement du site.
 */
function ensureVapidConfigured(): boolean {
  if (vapidConfigured) {
    return true;
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim();

  if (!publicKey || !privateKey || !subject) {
    if (!vapidWarned) {
      console.warn(
        "[PUSH] Clés VAPID absentes : les notifications push sont désactivées.",
      );

      vapidWarned = true;
    }

    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;

  return true;
}

/* -------------------------------------------------------------------------- */
/*                                   ENVOI                                    */
/* -------------------------------------------------------------------------- */

function isGoneError(error: unknown): boolean {
  return (
    error instanceof WebPushError &&
    (error.statusCode === 404 || error.statusCode === 410)
  );
}

/*
 * Envoie une notification push à tous les appareils abonnés d'une
 * utilisatrice. Ne lève jamais d'exception : un échec de push ne
 * doit jamais faire échouer le flux métier qui l'a déclenché (même
 * philosophie que l'envoi d'e-mail).
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload,
): Promise<void> {
  try {
    if (!ensureVapidConfigured()) {
      return;
    }

    if (!(await isPushNotificationsEnabled())) {
      return;
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const payloadJson = JSON.stringify(payload);

    const staleSubscriptionIds: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,

              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payloadJson,
          );
        } catch (error: unknown) {
          if (isGoneError(error)) {
            staleSubscriptionIds.push(subscription.id);
            return;
          }

          console.error("[PUSH_SEND]", {
            subscriptionId: subscription.id,
            error,
          });
        }
      }),
    );

    if (staleSubscriptionIds.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: { id: { in: staleSubscriptionIds } },
      });
    }
  } catch (error: unknown) {
    console.error("[PUSH_SEND_USER]", { userId, error });
  }
}
