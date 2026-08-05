import type { Metadata } from "next";

import { EmailStudioClient } from "@/features/notifications/components/email-studio-client";

export const metadata: Metadata = {
  title: "Studio e-mails | Le Palais des Ongles",
};

export const dynamic = "force-dynamic";

export default function AdminEmailsPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <EmailStudioClient />
    </main>
  );
}
