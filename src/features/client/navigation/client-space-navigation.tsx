"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import {
  Bell,
  CalendarDays,
  Crown,
  Home,
  LogOut,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { usePathname } from "next/navigation";

import { signOut } from "next-auth/react";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type ClientNavigationIcon =
  "HOME" | "APPOINTMENTS" | "VIP" | "MESSAGES" | "NOTIFICATIONS";

export type ClientNavigationItem = {
  label: string;
  href: string;
  icon: ClientNavigationIcon;
  badge?: number;
  exact?: boolean;
};

type ClientSpaceNavigationProps = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };

  navigation: ClientNavigationItem[];

  children: ReactNode;
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function getInitials(firstName: string, lastName: string): string {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`
    .toUpperCase()
    .trim();

  return initials || "CL";
}

function isNavigationItemActive(
  pathname: string,
  item: ClientNavigationItem,
): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavigationIcon({ icon }: { icon: ClientNavigationIcon }) {
  if (icon === "APPOINTMENTS") {
    return <CalendarDays className="size-[18px]" />;
  }

  if (icon === "VIP") {
    return <Crown className="size-[18px]" />;
  }

  if (icon === "MESSAGES") {
    return <MessageCircle className="size-[18px]" />;
  }

  if (icon === "NOTIFICATIONS") {
    return <Bell className="size-[18px]" />;
  }

  return <Home className="size-[18px]" />;
}

/* -------------------------------------------------------------------------- */
/*                                COMPOSANT                                   */
/* -------------------------------------------------------------------------- */

export function ClientSpaceNavigation({
  user,
  navigation,
  children,
}: ClientSpaceNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FFF8FA]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-48 -top-48 z-0 size-[520px] rounded-full bg-[#E8B4C0]/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-56 left-1/4 z-0 size-[520px] rounded-full bg-[#D6B679]/10 blur-3xl"
      />

      <header className="sticky top-0 z-50 border-b border-[#EFDDE3] bg-[#FFFDFC]/95 shadow-[0_8px_35px_rgba(96,48,65,0.07)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-[76px] items-center justify-between gap-4">
            <Link
              href="/espace-client"
              className="group flex min-w-0 items-center gap-3"
            >
              <span className="relative grid size-12 shrink-0 place-items-center rounded-[1.1rem] bg-gradient-to-br from-[#C97992] via-[#B45F7A] to-[#843F59] text-white shadow-[0_12px_30px_rgba(132,63,89,0.28)] transition duration-300 group-hover:-translate-y-0.5">
                <Sparkles className="size-5" />

                <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-[#FFFDFC] bg-[#D6B679]" />
              </span>

              <span className="hidden min-w-0 sm:block">
                <span className="block truncate font-serif text-[1.05rem] font-semibold text-[#2F2027]">
                  Le Palais des Ongles
                </span>

                <span className="mt-0.5 block truncate text-[10px] font-black uppercase tracking-[0.17em] text-[#A27384]">
                  Espace cliente
                </span>
              </span>
            </Link>

            <nav
              aria-label="Navigation de l’espace cliente"
              className="hidden items-center gap-1.5 rounded-[1.25rem] border border-[#EFDDE3] bg-[#FFF8FA] p-1.5 shadow-inner lg:flex"
            >
              {navigation.map((item) => {
                const active = isNavigationItemActive(pathname, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex h-11 items-center gap-2 overflow-hidden rounded-2xl px-4 text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-[#B45F7A] to-[#843F59] text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]"
                        : "text-[#705D65] hover:bg-white hover:text-[#843F59]"
                    }`}
                  >
                    <NavigationIcon icon={item.icon} />

                    <span>{item.label}</span>

                    {item.badge && item.badge > 0 ? (
                      <span
                        className={`flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                          active
                            ? "bg-white text-[#843F59]"
                            : "bg-[#B45F7A] text-white"
                        }`}
                      >
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-3 rounded-[1.15rem] border border-[#EFDDE3] bg-white px-3 py-2 shadow-sm sm:flex">
                <span className="grid size-10 place-items-center rounded-2xl border border-[#E5C8D1] bg-gradient-to-br from-[#F9DCE4] to-[#E8B4C0] text-xs font-black text-[#843F59]">
                  {getInitials(user.firstName, user.lastName)}
                </span>

                <span className="hidden min-w-0 xl:block">
                  <span className="block max-w-36 truncate text-sm font-bold text-[#2F2027]">
                    {user.firstName} {user.lastName}
                  </span>

                  <span className="block max-w-36 truncate text-[11px] text-[#8E747E]">
                    {user.email}
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  void signOut({
                    callbackUrl: "/",
                  })
                }
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className="grid size-11 place-items-center rounded-2xl border border-[#EFDDE3] bg-white text-[#9A737F] shadow-sm transition hover:border-[#DDBAC5] hover:bg-[#FFF0F4] hover:text-[#843F59]"
              >
                <LogOut className="size-[18px]" />
              </button>
            </div>
          </div>

          <nav
            aria-label="Navigation mobile de l’espace cliente"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
          >
            {navigation.map((item) => {
              const active = isNavigationItemActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition ${
                    active
                      ? "bg-gradient-to-r from-[#B45F7A] to-[#843F59] text-white shadow-[0_8px_20px_rgba(132,63,89,0.22)]"
                      : "border border-[#EFDDE3] bg-white text-[#705D65]"
                  }`}
                >
                  <NavigationIcon icon={item.icon} />

                  <span>{item.label}</span>

                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                        active
                          ? "bg-white text-[#843F59]"
                          : "bg-[#B45F7A] text-white"
                      }`}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
