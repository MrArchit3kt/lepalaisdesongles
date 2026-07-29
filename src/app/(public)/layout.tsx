import type {
  ReactNode,
} from "react";

import {
  PublicFooter,
} from "@/components/public/public-footer";

import {
  PublicHeader,
} from "@/components/public/public-header";

import {
  getPublicWebsiteSettings,
} from "@/features/admin/settings/services/admin-settings.service";

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type PublicLayoutProps = {
  children:
    ReactNode;
};

/* -------------------------------------------------------------------------- */
/*                                  LAYOUT                                    */
/* -------------------------------------------------------------------------- */

export default async function PublicLayout({
  children,
}: PublicLayoutProps) {
  const websiteSettings =
    await getPublicWebsiteSettings();

  return (
    <>
      <PublicHeader
        logoUrl={
          websiteSettings.logoUrl
        }
        siteTitle={
          websiteSettings.siteTitle
        }
      />

      {children}

      <PublicFooter />
    </>
  );
}
