import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://lepalaisdesongles.fr";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",

    name: "Le Palais des Ongles",

    short_name: "Le Palais",

    description:
      "Institut spécialisé en prothésie ongulaire, Nail Art, Gel, Semi-permanent et soins des ongles.",

    start_url: "/",

    scope: "/",

    display: "standalone",

    orientation: "portrait",

    background_color: "#FFF9F8",

    theme_color: "#D4AF37",

    lang: "fr",

    categories: [
      "beauty",
      "lifestyle",
      "business",
    ],

    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],

    screenshots: [],

    shortcuts: [
      {
        name: "Réserver",

        short_name: "Réserver",

        url: "/reservation",
      },
      {
        name: "Prestations",

        short_name: "Prestations",

        url: "/prestations",
      },
      {
        name: "Galerie",

        short_name: "Galerie",

        url: "/galerie",
      },
    ],
  };
}