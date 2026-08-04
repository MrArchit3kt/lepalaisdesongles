import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://lepalaisdesongles.fr";

/*
 * Un seul bloc générique couvre déjà tous les robots,
 * Googlebot et Bingbot compris.
 *
 * Un bloc dédié à un user-agent précis n’hérite PAS
 * du disallow du bloc générique : il le remplace
 * entièrement. Ajouter des blocs "Googlebot: allow /"
 * autoriserait donc explicitement ce robot à explorer
 * /admin/, /api/ et /espace-client/.
 */
const DISALLOWED_PATHS = [
  "/admin/",
  "/api/",
  "/connexion",
  "/inscription",
  "/redirection-apres-connexion",
  "/espace-client/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",

        allow: [
          "/",
          "/prestations",
          "/prestations/",
          "/galerie",
          "/promotions",
          "/concours",
          "/contact",
          "/reservation",
          "/carte-cadeau",
          "/avis",
        ],

        disallow: DISALLOWED_PATHS,
      },
    ],

    sitemap: `${SITE_URL}/sitemap.xml`,

    host: SITE_URL,
  };
}