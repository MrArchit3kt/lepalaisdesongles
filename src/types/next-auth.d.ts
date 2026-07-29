import type { DefaultSession } from "next-auth";
import type { UserRole, UserStatus } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
      firstName: string;
      lastName: string;
      authVersion: number;
      sessionInvalidated: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    status: UserStatus;
    firstName: string;
    lastName: string;
    authVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    firstName: string;
    lastName: string;
    authVersion: number;
    sessionInvalidated?: boolean;
  }
}
