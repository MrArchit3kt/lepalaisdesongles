import { Mail, MapPin, Phone, Sparkles } from "lucide-react";
import Link from "next/link";

const INSTAGRAM_URL = "https://www.instagram.com/le_palais_des_ongles71/";

const FACEBOOK_URL =
  "https://www.facebook.com/p/Le-palais-des-ongles-by-Pauline-61573637075857/";

const links = [
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
    label: "Réserver",
    href: "/reservation",
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

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />

      <circle cx="12" cy="12" r="4" />

      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4"
      fill="currentColor"
    >
      <path d="M13.7 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.7V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.5V13h2.8v8h3.4Z" />
    </svg>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[#241A1D] text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[#E8B4B8]">
                <Sparkles className="size-5" />
              </span>

              <span className="font-serif text-2xl">Le Palais des Ongles</span>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/60">
              Un espace dédié à la beauté, à l&apos;élégance et à la créativité
              jusqu&apos;au bout des ongles.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group flex size-11 items-center justify-center rounded-full border border-pink-400/20 bg-pink-500/10 text-pink-300 transition-all duration-300 hover:-translate-y-1 hover:border-pink-400 hover:bg-pink-500 hover:text-white hover:shadow-lg hover:shadow-pink-500/30"
              >
                <InstagramIcon />
              </a>

              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group flex size-11 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-blue-300 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30"
              >
                <FacebookIcon />
              </a>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/60">
              Retrouvez toutes nos réalisations, nos nouveautés, nos promotions
              et nos jeux concours sur nos réseaux sociaux.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-xl">Navigation</h2>

            <ul className="mt-5 space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition hover:text-[#E8B4B8]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl">Informations</h2>

            <ul className="mt-5 space-y-4 text-sm text-white/60">
              <li>
                <Link
                  href="/conditions-generales"
                  className="transition hover:text-white"
                >
                  Conditions générales
                </Link>
              </li>

              <li>
                <Link
                  href="/politique-de-confidentialite"
                  className="transition hover:text-white"
                >
                  Politique de confidentialité
                </Link>
              </li>

              <li>
                <Link
                  href="/mentions-legales"
                  className="transition hover:text-white"
                >
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-xl">Nous contacter</h2>

            <ul className="mt-5 space-y-4 text-sm text-white/60">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[#E8B4B8]" />

                <span>
                  Mâcon et alentours
                  <br />
                  Saône-et-Loire
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-[#E8B4B8]" />

                <a
                  href="tel:+33749853188"
                  className="transition hover:text-white"
                >
                  07&nbsp;49&nbsp;85&nbsp;31&nbsp;88
                </a>
              </li>

              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-[#E8B4B8]" />

                <a
                  href="mailto:contact@lepalaisdesongles.fr"
                  className="break-all transition hover:text-white"
                >
                  contact@lepalaisdesongles.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Le Palais des Ongles. Tous droits
            réservés.
          </p>

          <p>Site conçu avec soin pour sublimer votre beauté.</p>
        </div>
      </div>
    </footer>
  );
}
