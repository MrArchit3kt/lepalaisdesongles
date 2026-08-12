"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireClientUser } from "@/lib/session";

export type ToggleFavoriteServiceResult = {
  isFavorited: boolean;
};

/*
 * Appelée directement depuis un gestionnaire onClick côté client (pas
 * via <form action>) : requireClientUser() redirige vers /connexion
 * si la visiteuse n'est pas authentifiée, comme partout ailleurs
 * dans l'espace client.
 */
export async function toggleFavoriteServiceAction(
  serviceId: string,
): Promise<ToggleFavoriteServiceResult> {
  const user = await requireClientUser();

  const cleanServiceId = serviceId.trim();

  if (!cleanServiceId) {
    throw new Error("Cette prestation est invalide.");
  }

  const existing = await prisma.favoriteService.findUnique({
    where: {
      userId_serviceId: {
        userId: user.id,
        serviceId: cleanServiceId,
      },
    },

    select: { id: true },
  });

  if (existing) {
    await prisma.favoriteService.delete({
      where: { id: existing.id },
    });

    revalidatePath("/espace-client/favoris");
    revalidatePath("/espace-client");

    return { isFavorited: false };
  }

  const service = await prisma.service.findFirst({
    where: { id: cleanServiceId, isActive: true },
    select: { id: true },
  });

  if (!service) {
    throw new Error("Cette prestation est introuvable.");
  }

  try {
    await prisma.favoriteService.create({
      data: {
        userId: user.id,
        serviceId: cleanServiceId,
      },
    });
  } catch (error: unknown) {
    /*
     * Contrainte unique (double clic concurrent) : déjà en favori,
     * on ne fait pas échouer l'action pour autant.
     */
    console.error("[TOGGLE_FAVORITE_SERVICE]", error);
  }

  revalidatePath("/espace-client/favoris");
  revalidatePath("/espace-client");

  return { isFavorited: true };
}
