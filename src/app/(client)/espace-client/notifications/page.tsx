import { requireClientUser } from "@/lib/session";
import { NotificationsClient } from "@/features/notifications/components/notifications-client";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requireClientUser();

  return <NotificationsClient />;
}
