import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { isAdminRole } from "@/lib/roles";

export default async function PostLoginRedirectPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/connexion");
  }

  if (isAdminRole(user.role)) {
    redirect("/admin/dashboard");
  }

  redirect("/espace-client");
}
