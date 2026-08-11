"use client";

import type { ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import {
  CalendarClock,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Gift,
  Home,
  ImageIcon,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquareHeart,
  Settings,
  Settings2,
  Sparkles,
  Star,
  Tags,
  Trophy,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { signOut } from "next-auth/react";

import { usePathname } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { AdminNotificationCenter } from "@/features/notifications/components/admin-notification-center";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type AdminNavigationProps = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    image?: string | null;
  };

  unreadMessageCount?: number;

  children: ReactNode;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
};

/* -------------------------------------------------------------------------- */
/*                               NAVIGATION                                   */
/* -------------------------------------------------------------------------- */

const MAIN_NAVIGATION: NavigationItem[] = [
  {
    label: "Tableau de bord",

    href: "/admin/dashboard",

    icon: Home,

    exact: true,
  },
  {
    label: "Agenda",

    href: "/admin/agenda",

    icon: CalendarDays,
  },
  {
    label: "Cartes cadeaux",
    href: "/admin/cartes-cadeaux",
    icon: Gift,
  },
  {
    label: "Rendez-vous",

    href: "/admin/rendez-vous",

    icon: CalendarClock,
  },
  {
    label: "Messages",

    href: "/admin/messages",

    icon: MessageCircle,
  },
  {
    label: "Prestations",

    href: "/admin/prestations",

    icon: Sparkles,
  },
  {
    label: "Galerie",

    href: "/admin/galerie",

    icon: ImageIcon,
  },
  {
    label: "Équipe",

    href: "/admin/equipe",

    icon: UsersRound,
  },
];

const MARKETING_NAVIGATION: NavigationItem[] = [
  {
    label: "Promotions",

    href: "/admin/promotions",

    icon: Tags,
  },
  {
    label: "Avis clientes",

    href: "/admin/avis",

    icon: MessageSquareHeart,
  },
  {
    label: "Programme fidélité",

    href: "/admin/fidelite",

    icon: Crown,

    exact: true,
  },
  {
    label: "Membres VIP",

    href: "/admin/fidelite/membres",

    icon: UsersRound,
  },
  {
    label: "Niveaux VIP",

    href: "/admin/fidelite/niveaux",

    icon: Star,
  },
  {
    label: "Récompenses VIP",

    href: "/admin/fidelite/recompenses",

    icon: Gift,
  },
  {
    label: "Automatisations VIP",

    href: "/admin/fidelite/automatisations",

    icon: Settings2,
  },
  {
    label: "Concours",

    href: "/admin/concours",

    icon: Trophy,
  },
];

const HOURS_NAVIGATION: NavigationItem[] = [
  {
    label: "Horaires du salon",

    href: "/admin/horaires",

    icon: Clock3,

    exact: true,
  },
  {
    label: "Horaires de l’équipe",

    href: "/admin/horaires/equipe",

    icon: UserRound,
  },
  {
    label: "Absences et exceptions",

    href: "/admin/horaires/exceptions",

    icon: CalendarClock,
  },
];

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function isItemActive(pathname: string, item: NavigationItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function getInitials(firstName: string, lastName: string): string {
  const firstInitial = firstName.trim().charAt(0);

  const lastInitial = lastName.trim().charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase() || "A";
}

/* -------------------------------------------------------------------------- */
/*                              LOGO DU SALON                                 */
/* -------------------------------------------------------------------------- */

function SalonLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/admin/dashboard"
      className={`group flex min-w-0 items-center gap-3 ${
        compact ? "lg:justify-center" : ""
      }`}
    >
      <span className="relative block size-12 shrink-0 overflow-hidden rounded-[1.1rem] border border-[#EFDDE3] bg-white shadow-[0_12px_30px_rgba(132,63,89,0.16)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_16px_34px_rgba(132,63,89,0.24)]">
        <Image
          src="/images/logo/logo-palais-des-ongles.png"
          alt="Le Palais des Ongles"
          fill
          sizes="48px"
          className="object-contain p-1.5"
        />
      </span>

      <span className={`min-w-0 ${compact ? "lg:hidden" : ""}`}>
        <span className="block truncate font-serif text-[1.05rem] font-semibold text-[#2F2027]">
          Le Palais des Ongles
        </span>

        <span className="mt-0.5 block truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A27384]">
          Administration
        </span>
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                              COMPOSANT                                     */
/* -------------------------------------------------------------------------- */

export function AdminNavigation({
  user,
  unreadMessageCount = 0,
  children,
}: AdminNavigationProps) {
  const pathname = usePathname();

  const mainNavigation = MAIN_NAVIGATION.map((item) =>
    item.href === "/admin/messages"
      ? {
          ...item,
          badge: unreadMessageCount,
        }
      : item,
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  function closeMobileMenu(): void {
    setMobileOpen(false);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FFF8FA]">
      {/* Décor général */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-48 -top-48 z-0 size-[520px] rounded-full bg-[#E8B4C0]/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-56 left-1/4 z-0 size-[520px] rounded-full bg-[#D6B679]/10 blur-3xl"
      />

      <AdminNotificationCenter className="fixed right-16 top-3 z-[70] lg:right-7 lg:top-5" />

      {/* ------------------------------------------------------------------ */}
      {/*                           MOBILE HEADER                            */}
      {/* ------------------------------------------------------------------ */}

      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#EFDDE3] bg-[#FFFDFC]/95 px-4 shadow-[0_8px_30px_rgba(96,48,65,0.06)] backdrop-blur-xl lg:hidden">
        <SalonLogo />

        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="size-10" />

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid size-11 place-items-center rounded-2xl border border-[#EFDDE3] bg-white text-[#843F59] shadow-sm transition hover:border-[#DDBAC5] hover:bg-[#FFF4F7]"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/*                         MOBILE OVERLAY                             */}
      {/* ------------------------------------------------------------------ */}

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-[#2F2027]/55 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/*                              SIDEBAR                               */}
      {/* ------------------------------------------------------------------ */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#EFDDE3] bg-[#FFFDFC]/98 shadow-[18px_0_50px_rgba(75,35,51,0.12)] backdrop-blur-xl transition-all duration-300 lg:z-40 lg:shadow-[8px_0_40px_rgba(75,35,51,0.05)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-24" : "w-[310px] lg:w-72"}`}
      >
        {/* Logo */}

        <div
          className={`flex h-[88px] items-center border-b border-[#F1E2E7] px-5 ${
            collapsed ? "lg:justify-center lg:px-3" : "justify-between"
          }`}
        >
          <SalonLogo compact={collapsed} />

          <button
            type="button"
            onClick={closeMobileMenu}
            className="grid size-10 place-items-center rounded-2xl text-[#8E747E] transition hover:bg-[#FFF1F5] hover:text-[#843F59] lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-color:#E8B4C0_transparent] [scrollbar-width:thin]">
          <NavigationSection
            title="Gestion du salon"
            items={mainNavigation}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={closeMobileMenu}
          />

          <NavigationSection
            title="Marketing & fidélité"
            items={MARKETING_NAVIGATION}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={closeMobileMenu}
          />

          <NavigationSection
            title="Disponibilités"
            items={HOURS_NAVIGATION}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={closeMobileMenu}
          />

          <div className="mt-6 border-t border-[#F1E2E7] pt-5">
            <NavigationLink
              item={{
                label: "Paramètres",

                href: "/admin/parametres",

                icon: Settings,
              }}
              active={isItemActive(pathname, {
                label: "Paramètres",

                href: "/admin/parametres",

                icon: Settings,
              })}
              collapsed={collapsed}
              onNavigate={closeMobileMenu}
            />
          </div>
        </nav>

        {/* ---------------------------------------------------------------- */}
        {/*                               USER                               */}
        {/* ---------------------------------------------------------------- */}

        <div className="border-t border-[#F1E2E7] bg-[#FFF9FA] p-3">
          <UserMenu user={user} collapsed={collapsed} />

          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="mt-3 hidden h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#E9D4DB] bg-white text-sm font-semibold text-[#816D75] shadow-sm transition hover:border-[#DDBAC5] hover:bg-[#FFF3F6] hover:text-[#843F59] lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="size-4" />
                Réduire le menu
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/*                              CONTENT                               */}
      {/* ------------------------------------------------------------------ */}

      <div
        className={`relative z-10 min-h-screen transition-[padding] duration-300 ${
          collapsed ? "lg:pl-24" : "lg:pl-72"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       MENU UTILISATEUR (DÉCONNEXION)                       */
/* -------------------------------------------------------------------------- */

type UserMenuProps = {
  user: AdminNavigationProps["user"];
  collapsed: boolean;
};

function UserMenu({ user, collapsed }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  const [signingOut, setSigningOut] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent): void {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleSignOut(): Promise<void> {
    setSigningOut(true);

    await signOut({ callbackUrl: "/connexion" });
  }

  return (
    <div ref={containerRef} className="relative">
      {open ? (
        <div className="absolute inset-x-0 bottom-full z-20 mb-2 overflow-hidden rounded-[1.25rem] border border-[#EFDDE3] bg-white shadow-[0_18px_44px_rgba(75,35,51,0.16)]">
          <div className="border-b border-[#F1E2E7] px-4 py-3">
            <p className="truncate text-sm font-bold text-[#2F2027]">
              {user.firstName} {user.lastName}
            </p>

            <p className="mt-0.5 truncate text-xs text-[#8E747E]">
              {user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex h-12 w-full items-center gap-3 px-4 text-sm font-semibold text-[#A5526D] transition hover:bg-[#FFF0F4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="size-4" />
            {signingOut ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`relative w-full overflow-hidden rounded-[1.35rem] border border-[#EFDDE3] bg-white p-3 shadow-[0_10px_25px_rgba(92,42,60,0.06)] transition hover:border-[#DDBAC5] ${
          collapsed ? "lg:flex lg:justify-center" : ""
        }`}
      >
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-8 size-20 rounded-full bg-[#E8B4C0]/20 blur-2xl"
        />

        <div
          className={`relative flex items-center gap-3 ${
            collapsed ? "lg:justify-center" : ""
          }`}
        >
          <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#E5C8D1] bg-gradient-to-br from-[#F9DCE4] to-[#E8B4C0] text-sm font-black text-[#843F59] shadow-sm">
            {user.image ? (
              <img
                src={user.image}
                alt={`${user.firstName} ${user.lastName}`}
                className="size-full object-cover"
              />
            ) : (
              getInitials(user.firstName, user.lastName)
            )}
          </div>

          <div className={`min-w-0 flex-1 text-left ${collapsed ? "lg:hidden" : ""}`}>
            <p className="truncate text-sm font-bold text-[#2F2027]">
              {user.firstName} {user.lastName}
            </p>

            <p className="mt-0.5 truncate text-xs text-[#8E747E]">
              {user.email}
            </p>

            <span className="mt-2 inline-flex rounded-full bg-[#FFF0F4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#A5526D]">
              Administrateur
            </span>
          </div>

          <ChevronDown
            className={`relative size-4 shrink-0 text-[#A68C96] transition ${
              open ? "rotate-180" : ""
            } ${collapsed ? "lg:hidden" : ""}`}
          />
        </div>
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         NAVIGATION SECTION                                 */
/* -------------------------------------------------------------------------- */

type NavigationSectionProps = {
  title: string;
  items: NavigationItem[];
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
};

function NavigationSection({
  title,
  items,
  pathname,
  collapsed,
  onNavigate,
}: NavigationSectionProps) {
  return (
    <section className="mb-7">
      <div
        className={`mb-2.5 flex items-center gap-2 px-3 ${
          collapsed ? "lg:hidden" : ""
        }`}
      >
        <span className="h-px w-4 bg-[#D6B679]" />

        <p className="text-[10px] font-black uppercase tracking-[0.19em] text-[#A68C96]">
          {title}
        </p>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <NavigationLink
            key={item.href}
            item={item}
            active={isItemActive(pathname, item)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                           NAVIGATION LINK                                  */
/* -------------------------------------------------------------------------- */

type NavigationLinkProps = {
  item: NavigationItem;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
};

function NavigationLink({
  item,
  active,
  collapsed,
  onNavigate,
}: NavigationLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={`group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-[1rem] px-3 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-[#B45F7A] to-[#843F59] text-white shadow-[0_10px_24px_rgba(132,63,89,0.24)]"
          : "text-[#705D65] hover:bg-[#FFF0F4] hover:text-[#843F59]"
      } ${collapsed ? "lg:justify-center" : ""}`}
    >
      {active ? (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
          />

          <span
            aria-hidden="true"
            className="absolute -right-5 -top-7 size-16 rounded-full bg-white/10 blur-xl"
          />
        </>
      ) : null}

      <span
        className={`relative grid size-9 shrink-0 place-items-center rounded-xl transition ${
          active
            ? "bg-white/12 text-white"
            : "bg-[#FFF7F9] text-[#B06A80] group-hover:bg-white group-hover:text-[#843F59]"
        }`}
      >
        <Icon className="size-[18px]" />
      </span>

      <span className={`relative truncate ${collapsed ? "lg:hidden" : ""}`}>
        {item.label}
      </span>

      {item.badge && item.badge > 0 ? (
        <span
          className={`relative ml-auto flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black ${
            active ? "bg-white text-[#843F59]" : "bg-[#B45F7A] text-white"
          } ${collapsed ? "lg:absolute lg:right-1 lg:top-1" : ""}`}
        >
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      ) : null}

      {active ? (
        <span
          className={`relative ml-auto flex size-5 items-center justify-center ${
            collapsed ? "lg:hidden" : ""
          }`}
        >
          <span className="size-1.5 rounded-full bg-[#F3D79A] shadow-[0_0_8px_rgba(243,215,154,0.9)]" />
        </span>
      ) : (
        <ChevronRight
          className={`relative ml-auto size-4 text-[#C7AEB7] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 ${
            collapsed ? "lg:hidden" : ""
          }`}
        />
      )}
    </Link>
  );
}
