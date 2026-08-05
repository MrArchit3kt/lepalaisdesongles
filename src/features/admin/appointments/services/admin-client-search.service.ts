import "server-only";

import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AdminClientSearchResult = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
};

/* -------------------------------------------------------------------------- */
/*                                CONSTANTES                                  */
/* -------------------------------------------------------------------------- */

const MIN_QUERY_LENGTH = 2;

const MAX_QUERY_LENGTH = 120;

const MAX_RESULTS = 10;

/* -------------------------------------------------------------------------- */
/*                                 RECHERCHE                                  */
/* -------------------------------------------------------------------------- */

/*
 * Recherche parmi les clientes ayant déjà un compte actif, utilisée
 * par l'admin pour créer un rendez-vous manuellement au nom d'une
 * cliente existante (nom, prénom ou e-mail).
 */
export async function searchAdminClients(
  rawQuery: string,
): Promise<AdminClientSearchResult[]> {
  const query = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);

  if (query.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      status: "ACTIVE",

      OR: [
        {
          firstName: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },

    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],

    take: MAX_RESULTS,
  });

  return clients;
}
