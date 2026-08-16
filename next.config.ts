import type {
  NextConfig,
} from "next";

/* -------------------------------------------------------------------------- */
/*                       CONTENT SECURITY POLICY                              */
/* -------------------------------------------------------------------------- */

const isDevelopment =
  process.env.NODE_ENV !==
  "production";

const paypalSources = [
  "https://paypal.com",
  "https://*.paypal.com",
  "https://paypalobjects.com",
  "https://*.paypalobjects.com",
  "https://venmo.com",
  "https://*.venmo.com",
];

const uploadThingConnectSources = [
  "https://ingest.uploadthing.com",
  /*
   * Les URL présignées pointent vers un sous-domaine régional à
   * deux niveaux (ex. sea1.ingest.uploadthing.com) : un caractère
   * générique ne couvre qu’un seul niveau de sous-domaine en CSP,
   * "*.uploadthing.com" ne matche donc pas "sea1.ingest.uploadthing.com".
   */
  "https://*.ingest.uploadthing.com",
  "https://api.uploadthing.com",
  "https://ufs.sh",
  "https://*.ufs.sh",
  "https://utfs.io",
  "https://*.utfs.io",
  "https://uploadthing.com",
  "https://*.uploadthing.com",
];

function createContentSecurityPolicy():
  string {
  const developmentScriptSources =
    isDevelopment
      ? [
          "'unsafe-eval'",
        ]
      : [];

  const developmentConnectSources =
    isDevelopment
      ? [
          "http://localhost:*",
          "http://127.0.0.1:*",
          "ws://localhost:*",
          "ws://127.0.0.1:*",
        ]
      : [];

  const developmentImageSources =
    isDevelopment
      ? [
          "http:",
        ]
      : [];

  const directives = [
    [
      "default-src",
      "'self'",
    ],

    [
      "base-uri",
      "'self'",
    ],

    [
      "object-src",
      "'none'",
    ],

    [
      "frame-ancestors",
      "'none'",
    ],

    [
      "form-action",
      "'self'",
      ...paypalSources,
    ],

    /*
     * Next.js génère actuellement des scripts
     * d’hydratation inline.
     *
     * PayPal recommande également unsafe-inline
     * lorsqu’aucun nonce CSP ne lui est transmis.
     */
    [
      "script-src",
      "'self'",
      "'unsafe-inline'",
      ...developmentScriptSources,
      ...paypalSources,
    ],

    /*
     * Les composants React, Tailwind et PayPal
     * utilisent des styles inline.
     */
    [
      "style-src",
      "'self'",
      "'unsafe-inline'",
      ...paypalSources,
    ],

    [
      "font-src",
      "'self'",
      "data:",
    ],

    /*
     * Certaines zones administratives acceptent
     * encore des URL HTTPS configurables pour les
     * concours, promotions et éléments VIP.
     *
     * La directive reste donc ouverte à HTTPS pour
     * les images uniquement. Les scripts et les
     * connexions réseau restent strictement limités.
     */
    [
      "img-src",
      "'self'",
      "data:",
      "blob:",
      "https:",
      ...developmentImageSources,
    ],

    [
      "media-src",
      "'self'",
      "blob:",
      "https:",
    ],

    [
      "connect-src",
      "'self'",
      ...paypalSources,
      ...uploadThingConnectSources,
      ...developmentConnectSources,
    ],

    [
      "frame-src",
      "'self'",
      "https://www.google.com",
      "https://maps.google.com",
      ...paypalSources,
    ],

    /*
     * PayPal documente encore child-src pour ses
     * fenêtres et cadres de paiement.
     */
    [
      "child-src",
      "'self'",
      "blob:",
      ...paypalSources,
    ],

    [
      "worker-src",
      "'self'",
      "blob:",
    ],

    [
      "manifest-src",
      "'self'",
    ],
  ];

  if (
    !isDevelopment
  ) {
    directives.push([
      "upgrade-insecure-requests",
    ]);
  }

  return directives
    .map(
      (directive) =>
        directive.join(
          " ",
        ),
    )
    .join(
      "; ",
    );
}

const contentSecurityPolicy =
  createContentSecurityPolicy();

/* -------------------------------------------------------------------------- */
/*                           EN-TÊTES DE SÉCURITÉ                              */
/* -------------------------------------------------------------------------- */

const globalSecurityHeaders = [
  {
    key:
      "Content-Security-Policy",

    value:
      contentSecurityPolicy,
  },

  {
    key:
      "Strict-Transport-Security",

    value:
      "max-age=31536000",
  },

  {
    key:
      "X-Content-Type-Options",

    value:
      "nosniff",
  },

  {
    key:
      "X-Frame-Options",

    value:
      "DENY",
  },

  {
    key:
      "Referrer-Policy",

    value:
      "strict-origin-when-cross-origin",
  },

  {
    key:
      "Permissions-Policy",

    value:
      [
        "camera=()",
        "microphone=()",
        "geolocation=()",
        "usb=()",
        "serial=()",
        "bluetooth=()",
        "browsing-topics=()",
      ].join(
        ", ",
      ),
  },

  {
    /*
     * same-origin strict casserait certains
     * parcours utilisant une fenêtre PayPal.
     */
    key:
      "Cross-Origin-Opener-Policy",

    value:
      "same-origin-allow-popups",
  },

  {
    key:
      "Cross-Origin-Resource-Policy",

    value:
      "same-site",
  },

  {
    key:
      "X-Permitted-Cross-Domain-Policies",

    value:
      "none",
  },

  {
    key:
      "X-Download-Options",

    value:
      "noopen",
  },

  {
    key:
      "Origin-Agent-Cluster",

    value:
      "?1",
  },

  {
    key:
      "X-DNS-Prefetch-Control",

    value:
      "off",
  },
];

const sensitiveAreaHeaders = [
  {
    key:
      "Cache-Control",

    value:
      "private, no-store, no-cache, max-age=0, must-revalidate",
  },

  {
    key:
      "Pragma",

    value:
      "no-cache",
  },

  {
    key:
      "Expires",

    value:
      "0",
  },

  {
    key:
      "X-Robots-Tag",

    value:
      "noindex, nofollow, noarchive, nosnippet",
  },
];

/* -------------------------------------------------------------------------- */
/*                              CONFIGURATION                                 */
/* -------------------------------------------------------------------------- */

const nextConfig: NextConfig = {
  poweredByHeader:
    false,

  compress:
    true,

  /*
   * Les images téléversées (galerie, prestations,
   * paramètres du site, photos d’inspiration) sont
   * hébergées par UploadThing et affichées via
   * next/image, qui exige une liste explicite
   * d’hôtes distants autorisés.
   */
  images: {
    /*
     * Par défaut, Next régénère les variantes optimisées au bout de
     * 60 secondes. Nos images (photos de galerie, hero, logo) ne
     * changent que lors d'une action admin explicite ; les laisser
     * en cache 30 jours évite de retranscoder (coûteux en CPU sur le
     * VPS) une image déjà générée à chaque expiration, ce qui a un
     * impact direct sur le LCP mobile en cas de cache froid.
     */
    minimumCacheTTL: 2_592_000,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },

      {
        protocol: "https",
        hostname: "ufs.sh",
      },

      {
        protocol: "https",
        hostname: "*.utfs.io",
      },

      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },

  async headers() {
    return [
      {
        source:
          "/:path*",

        headers:
          globalSecurityHeaders,
      },

      {
        source:
          "/admin/:path*",

        headers:
          sensitiveAreaHeaders,
      },

      {
        source:
          "/espace-client/:path*",

        headers:
          sensitiveAreaHeaders,
      },

      {
        source:
          "/api/:path*",

        headers:
          sensitiveAreaHeaders,
      },

      {
        source:
          "/reservation/paiement/:path*",

        headers:
          sensitiveAreaHeaders,
      },

      {
        source:
          "/reservation/confirmation/:path*",

        headers:
          sensitiveAreaHeaders,
      },
    ];
  },
};

export default nextConfig;
