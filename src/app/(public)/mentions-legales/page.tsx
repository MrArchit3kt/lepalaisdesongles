import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Copyright,
  ExternalLink,
  FileText,
  Gavel,
  Globe,
  Mail,
  MapPin,
  Phone,
  ScrollText,
  Server,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const LAST_UPDATED = "16 août 2026";

const PHONE_DISPLAY = "07 49 85 31 88";
const PHONE_LINK = "tel:+33749853188";
const EMAIL = "contact@lepalaisdesongles.fr";
const ADDRESS = "31 route d’Autun, 71140 Maltat";

const sections = [
  { id: "editeur", label: "Éditeur du site" },
  { id: "publication", label: "Direction de la publication" },
  { id: "hebergeur", label: "Hébergement" },
  { id: "propriete", label: "Propriété intellectuelle" },
  { id: "donnees", label: "Données personnelles" },
  { id: "cookies", label: "Cookies" },
  { id: "liens", label: "Liens hypertextes" },
  { id: "litiges", label: "Droit applicable et litiges" },
];

export const metadata: Metadata = {
  title: "Mentions légales | Le Palais des Ongles",
  description:
    "Mentions légales du site Le Palais des Ongles : éditeur, hébergeur, propriété intellectuelle et informations légales.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="overflow-hidden bg-[#FFFAFB]">
      <section className="relative border-b border-[#35242B]/5 px-5 py-16 sm:py-20 lg:px-8 lg:py-24">
        <div
          aria-hidden="true"
          className="absolute -left-40 top-0 size-[420px] rounded-full bg-[#E8B3C3]/30 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -right-40 bottom-0 size-[460px] rounded-full bg-[#D6B778]/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/60 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69] shadow-sm backdrop-blur-xl">
              <ScrollText className="size-4" />
              Informations légales
            </div>

            <h1 className="mx-auto mt-6 max-w-[18ch] font-serif text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] text-[#35242B] sm:text-[3.6rem]">
              Mentions
              <span className="ml-3 bg-gradient-to-r from-[#A64D69] via-[#C47890] to-[#8B3E59] bg-clip-text italic text-transparent">
                légales
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#79636C]">
              Conformément à la loi n°2004-575 du 21 juin 2004 pour la
              confiance dans l’économie numérique, voici les informations
              légales relatives à l’éditeur et à l’hébergeur de ce site.
            </p>

            <p className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#A44E69]/80">
              <CalendarDays className="size-3.5" />
              Dernière mise à jour : {LAST_UPDATED}
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.32fr_0.68fr]">
          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-[1.75rem] border border-[#F0DCE3] bg-white p-6 shadow-[0_25px_70px_-45px_rgba(139,64,90,0.35)]">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69]">
                Sommaire
              </p>

              <nav className="mt-4">
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block rounded-xl px-3 py-2 text-sm text-[#6F5962] transition hover:bg-[#FFF0F4] hover:text-[#A64D69]"
                      >
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-[#F0DCE3] bg-white p-6 shadow-[0_25px_70px_-45px_rgba(139,64,90,0.35)]">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69]">
                Une question ?
              </p>

              <p className="mt-3 text-sm leading-6 text-[#6F5962]">
                Pour toute question sur ces mentions légales, contactez-nous.
              </p>

              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A64D69] transition hover:text-[#35242B]"
              >
                Nous contacter
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>

          <div className="min-w-0 rounded-[2rem] border border-[#F0DCE3] bg-white p-7 shadow-[0_25px_70px_-45px_rgba(139,64,90,0.35)] sm:p-10">
            <article className="max-w-none text-[#4A3B41]">
              <section id="editeur" className="scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Building2 className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    1. Éditeur du site
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Le présent site, accessible à l’adresse{" "}
                  <span className="font-semibold text-[#35242B]">
                    lepalaisdesongles.fr
                  </span>
                  , est édité par :
                </p>

                <div className="mt-5 grid gap-3 rounded-2xl bg-[#FFFAFB] p-5 text-sm leading-7 text-[#4A3B41] sm:grid-cols-2">
                  <div className="flex gap-3">
                    <UserRound className="mt-0.5 size-4 shrink-0 text-[#A64D69]" />
                    <span>
                      <span className="block font-semibold text-[#35242B]">
                        Pauline Dettling
                      </span>
                      Entrepreneure individuelle (micro-entreprise), exerçant
                      sous le nom commercial « Le Palais des Ongles »
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <FileText className="mt-0.5 size-4 shrink-0 text-[#A64D69]" />
                    <span>
                      <span className="block font-semibold text-[#35242B]">
                        SIRET
                      </span>
                      844 412 254 00029
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-[#A64D69]" />
                    <span>
                      <span className="block font-semibold text-[#35242B]">
                        Siège social
                      </span>
                      {ADDRESS}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <ScrollText className="mt-0.5 size-4 shrink-0 text-[#A64D69]" />
                    <span>
                      <span className="block font-semibold text-[#35242B]">
                        TVA
                      </span>
                      TVA non applicable, article 293 B du Code général des
                      impôts (franchise en base de TVA)
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-[#A64D69]" />
                    <span>
                      <span className="block font-semibold text-[#35242B]">
                        Téléphone
                      </span>
                      <a href={PHONE_LINK} className="hover:text-[#A64D69]">
                        {PHONE_DISPLAY}
                      </a>
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-[#A64D69]" />
                    <span>
                      <span className="block font-semibold text-[#35242B]">
                        E-mail
                      </span>
                      <a
                        href={`mailto:${EMAIL}`}
                        className="break-all hover:text-[#A64D69]"
                      >
                        {EMAIL}
                      </a>
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  En tant qu’entrepreneure individuelle, Pauline Dettling
                  n’est pas immatriculée au Registre du Commerce et des
                  Sociétés en tant que société commerciale ; l’activité est
                  déclarée auprès du guichet unique de l’INPI sous le numéro
                  SIRET ci-dessus.
                </p>
              </section>

              <section id="publication" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <UserRound className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    2. Direction de la publication
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  La directrice de la publication est{" "}
                  <span className="font-semibold text-[#35242B]">
                    Pauline Dettling
                  </span>
                  , en sa qualité d’exploitante du salon Le Palais des
                  Ongles. Elle peut être contactée aux coordonnées indiquées
                  ci-dessus ou via la{" "}
                  <Link
                    href="/contact"
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    page contact
                  </Link>
                  {" "}du site.
                </p>
              </section>

              <section id="hebergeur" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Server className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    3. Hébergement
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Le site est hébergé par :
                </p>

                <div className="mt-5 rounded-2xl bg-[#FFFAFB] p-5 text-sm leading-7 text-[#4A3B41]">
                  <span className="block font-semibold text-[#35242B]">
                    Hostinger
                  </span>
                  Hostinger International Ltd. — 61 Lordou Vironos Street,
                  6023 Larnaca, Chypre
                  <br />
                  Site web :{" "}
                  <a
                    href="https://www.hostinger.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    hostinger.fr
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>

                <p className="mt-4 text-xs leading-6 text-[#8A767E]">
                  Ces informations d’hébergement correspondent au prestataire
                  utilisé au moment de la mise à jour de cette page. En cas de
                  changement d’hébergeur, cette section sera actualisée.
                </p>
              </section>

              <section id="propriete" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Copyright className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    4. Propriété intellectuelle
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  L’ensemble des éléments présents sur ce site (textes,
                  photographies, illustrations, logos, mises en page,
                  charte graphique, réalisations présentées en galerie) est
                  protégé par le droit d’auteur et le droit des marques et
                  reste la propriété exclusive de Pauline Dettling / Le
                  Palais des Ongles, sauf mention contraire.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Toute reproduction, représentation, modification,
                  publication ou adaptation de tout ou partie des éléments du
                  site, quel que soit le moyen ou le procédé utilisé, est
                  interdite sans autorisation écrite préalable, sous peine de
                  poursuites conformément aux articles L.335-2 et suivants du
                  Code de la propriété intellectuelle.
                </p>
              </section>

              <section id="donnees" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <ShieldCheck className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    5. Données personnelles
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Le traitement des données personnelles collectées sur ce
                  site (compte client, réservation, avis, cartes cadeaux…)
                  est décrit en détail dans notre{" "}
                  <Link
                    href="/politique-de-confidentialite"
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    politique de confidentialité
                  </Link>
                  , conformément au Règlement général sur la protection des
                  données (RGPD) et à la loi Informatique et Libertés du 6
                  janvier 1978 modifiée.
                </p>
              </section>

              <section id="cookies" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Globe className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    6. Cookies
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Le site utilise uniquement des cookies strictement
                  nécessaires à son fonctionnement (notamment la session de
                  connexion à l’espace client). Aucun cookie de mesure
                  d’audience ou de publicité tiers n’est déposé. Le détail
                  figure dans la{" "}
                  <Link
                    href="/politique-de-confidentialite"
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </section>

              <section id="liens" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <ExternalLink className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    7. Liens hypertextes
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Ce site peut contenir des liens vers des sites tiers
                  (Instagram, Facebook, Google Maps, PayPal). Le Palais des
                  Ongles n’exerce aucun contrôle sur ces sites et décline
                  toute responsabilité quant à leur contenu ou à leurs
                  pratiques en matière de données personnelles.
                </p>
              </section>

              <section id="litiges" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Gavel className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    8. Droit applicable et litiges
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Les présentes mentions légales sont soumises au droit
                  français. En cas de litige et à défaut d’accord amiable,
                  les tribunaux français seront seuls compétents.
                </p>
              </section>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
