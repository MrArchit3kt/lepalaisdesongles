"use client";

import type { ReactNode } from "react";
import { Toaster as SonnerToaster } from "sonner";

import { QueryProvider } from "@/providers/query-provider";
import { AppSessionProvider } from "@/providers/session-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <AppSessionProvider>
      <QueryProvider>
        {children}

        <SonnerToaster
          position="top-right"
          richColors
          closeButton
        />
      </QueryProvider>
    </AppSessionProvider>
  );
}
