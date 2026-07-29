import type { UserRole } from "@/generated/prisma/client";

export const ADMIN_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "STAFF",
];

export function isAdminRole(role: UserRole | string | null | undefined): boolean {
  if (!role) {
    return false;
  }

  return ADMIN_ROLES.includes(role as UserRole);
}

export function isSuperAdminRole(
  role: UserRole | string | null | undefined,
): boolean {
  return role === "SUPER_ADMIN";
}

export function isClientRole(
  role: UserRole | string | null | undefined,
): boolean {
  return role === "CLIENT";
}

export function getRoleLabel(
  role: UserRole | string | null | undefined,
): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super administrateur";

    case "ADMIN":
      return "Administrateur";

    case "STAFF":
      return "Membre de l’équipe";

    case "CLIENT":
      return "Cliente";

    default:
      return "Utilisateur";
  }
}
