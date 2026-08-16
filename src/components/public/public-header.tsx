"use client";

import { CalendarDays, Menu, UserRound, X } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

type PublicHeaderProps = {
  logoUrl?: string;

  siteTitle?: string;
};

const navigation = [
  {
    label: "Accueil",
    href: "/",
  },
  {
    label: "Prestations",
    href: "/prestations",
  },
  {
    label: "Galerie",
    href: "/galerie",
  },
  {
    label: "Avis",
    href: "/avis",
  },
  {
    label: "Promotions",
    href: "/promotions",
  },
  {
    label: "Concours",
    href: "/concours",
  },
  {
    label: "Cartes cadeaux",
    href: "/carte-cadeau",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export function PublicHeader({
  logoUrl = "",
  siteTitle = "Le Palais des Ongles",
}: PublicHeaderProps) {
  const pathname = usePathname();

  const resolvedLogoUrl =
    logoUrl.trim() || "/images/logo/logo-palais-des-ongles.png";

  const [menuIsOpen, setMenuIsOpen] = useState(false);

  function closeMenu() {
    setMenuIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#241A1D]/7 bg-[#FFF9F8]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <span className="relative block size-14 shrink-0 sm:size-16">
            <Image
              src={resolvedLogoUrl}
              alt={`Logo ${siteTitle}`}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 640px) 56px, 64px"
              className="rounded-full object-contain"
            />
          </span>
        </Link>

        <nav className="hidden items-center gap-7 xl:flex">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative py-2 text-sm font-medium transition",
                  isActive
                    ? "text-[#241A1D]"
                    : "text-[#76636A] hover:text-[#241A1D]",
                )}
              >
                {item.label}

                {isActive ? (
                  <span className="absolute inset-x-0 -bottom-1 mx-auto h-0.5 w-5 rounded-full bg-[#B8899A]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/connexion"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#241A1D]/10 bg-white px-5 text-sm font-medium text-[#241A1D] transition hover:bg-[#FFF1F1]"
          >
            <UserRound className="size-4" />
            Mon compte
          </Link>

          <Link
            href="/reservation"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#241A1D] px-6 text-sm font-medium text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#3B292F]"
          >
            <CalendarDays className="size-4" />
            Réserver
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuIsOpen((current) => !current)}
          className="flex size-11 items-center justify-center rounded-full border border-[#241A1D]/10 bg-white text-[#241A1D] lg:hidden"
          aria-label={menuIsOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {menuIsOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuIsOpen ? (
        <div className="border-t border-[#241A1D]/7 bg-[#FFF9F8] px-5 py-5 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium",
                    isActive
                      ? "bg-[#241A1D] text-white"
                      : "text-[#5F5056] hover:bg-[#FFF0F0]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mx-auto mt-4 grid max-w-7xl gap-3 sm:grid-cols-2">
            <Link
              href="/connexion"
              onClick={closeMenu}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#241A1D]/10 bg-white text-sm font-medium"
            >
              <UserRound className="size-4" />
              Mon compte
            </Link>

            <Link
              href="/reservation"
              onClick={closeMenu}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#241A1D] text-sm font-medium text-white"
            >
              <CalendarDays className="size-4" />
              Prendre rendez-vous
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
