import type {
  Metadata,
} from "next";

import {
  Cormorant_Garamond,
  Montserrat,
} from "next/font/google";

import {
  LuxuryFloralBackground,
} from "@/components/theme/luxury-floral-background";

import {
  getPublicWebsiteSettings,
} from "@/features/admin/settings/services/admin-settings.service";

import {
  AppProviders,
} from "@/providers/app-providers";

import "./globals.css";

import {
  StructuredData,
} from "@/components/seo/structured-data";

/* -------------------------------------------------------------------------- */
/*                                   POLICES                                  */
/* -------------------------------------------------------------------------- */

const headingFont =
  Cormorant_Garamond({
    subsets: [
      "latin",
    ],

    variable:
      "--font-heading",

    display:
      "swap",

    weight: [
      "400",
      "500",
      "600",
      "700",
    ],
  });

const bodyFont =
  Montserrat({
    subsets: [
      "latin",
    ],

    variable:
      "--font-body",

    display:
      "swap",

    weight: [
      "400",
      "500",
      "600",
      "700",
    ],
  });

/* -------------------------------------------------------------------------- */
/*                                MÉTADONNÉES                                 */
/* -------------------------------------------------------------------------- */

export async function generateMetadata():
  Promise<Metadata> {
  const websiteSettings =
    await getPublicWebsiteSettings();

  const siteTitle =
    websiteSettings.siteTitle ||
    "Le Palais des Ongles";

  const defaultTitle =
    websiteSettings.seoTitle ||
    siteTitle;

  const description =
    websiteSettings.seoDescription ||
    websiteSettings.siteDescription ||
    "Institut spécialisé en prothésie ongulaire, poses en gel, semi-permanent et nail art personnalisé.";

  const socialImages =
    websiteSettings.socialShareImageUrl
      ? [
          {
            url:
              websiteSettings.socialShareImageUrl,

            width:
              1200,

            height:
              630,

            alt:
              siteTitle,
          },
        ]
      : undefined;

  return {
    metadataBase:
      new URL(
        process.env.NEXT_PUBLIC_APP_URL ??
          "http://localhost:3000",
      ),

    title: {
      default:
        defaultTitle,

      template:
        `%s | ${siteTitle}`,
    },

    description,

    keywords:
      websiteSettings.seoKeywords ||
      undefined,

    applicationName:
      siteTitle,

    icons:
      websiteSettings.faviconUrl
        ? {
            icon: [
              {
                url:
                  websiteSettings.faviconUrl,
              },
            ],

            shortcut:
              websiteSettings.faviconUrl,

            apple:
              websiteSettings.faviconUrl,
          }
        : undefined,

    openGraph: {
      type:
        "website",

      locale:
        "fr_FR",

      siteName:
        siteTitle,

      title:
        defaultTitle,

      description,

      images:
        socialImages,
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        defaultTitle,

      description,

      images:
        websiteSettings.socialShareImageUrl
          ? [
              websiteSettings.socialShareImageUrl,
            ]
          : undefined,
    },

    robots: {
      index:
        !websiteSettings.maintenanceMode,

      follow:
        !websiteSettings.maintenanceMode,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type RootLayoutProps =
  Readonly<{
    children:
      React.ReactNode;
  }>;

/* -------------------------------------------------------------------------- */
/*                                  LAYOUT                                    */
/* -------------------------------------------------------------------------- */

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const websiteSettings =
    await getPublicWebsiteSettings();

  const siteTitle =
    websiteSettings.siteTitle ||
    "Le Palais des Ongles";

  const description =
    websiteSettings.seoDescription ||
    websiteSettings.siteDescription ||
    "Institut spécialisé en prothésie ongulaire, poses en gel, semi-permanent et nail art personnalisé.";

  const siteUrl = (
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  return (
    <html
      lang="fr"
      className={`${headingFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#FFF9F8] font-sans text-[#241A1D] antialiased">
        <AppProviders>

          <StructuredData
            siteUrl={siteUrl}
            siteName={siteTitle}
            description={description}
            logo={websiteSettings.logoUrl}
            image={websiteSettings.socialShareImageUrl}
          />

          <LuxuryFloralBackground />

          <div className="relative z-10 min-h-screen">
            {children}
          </div>

        </AppProviders>
      </body>
    </html>
  );
}
