"use server";

import { revalidatePath } from "next/cache";

import { setPushNotificationsEnabled } from "@/features/push/services/push-settings.service";
import { requireAdminUser } from "@/lib/session";

export async function updatePushNotificationsEnabledAction(
  enabled: boolean,
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdminUser();
    await setPushNotificationsEnabled(enabled);

    revalidatePath("/admin/parametres");

    return {
      success: true,
      message: enabled
        ? "Les notifications push sont activées."
        : "Les notifications push sont désactivées.",
    };
  } catch (error: unknown) {
    console.error("[PUSH_SETTINGS_UPDATE]", error);

    return {
      success: false,
      message: "Impossible de modifier ce réglage.",
    };
  }
}
