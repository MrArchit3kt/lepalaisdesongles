"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isLoading, setIsLoading] =
    useState(false);

  async function logout() {
    setIsLoading(true);

    await signOut({
      callbackUrl: "/connexion",
    });
  }

  return (
    <Button
      variant="outline"
      onClick={logout}
      isLoading={isLoading}
      className="border-white/15 bg-white/10 text-white hover:bg-white/15"
    >
      <LogOut className="size-4" />
      Déconnexion
    </Button>
  );
}
