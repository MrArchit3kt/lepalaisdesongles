import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  CalendarClock,
  CalendarDays,
  Clock3,
  CreditCard,
  Gavel,
  Gift,
  Handshake,
  KeyRound,
  RefreshCcw,
  Scale,
  ScrollText,
  ShieldAlert,
  Tag,
} from "lucide-react";

const LAST_UPDATED = "16 août 2026";

const EMAIL = "contact@lepalaisdesongles.fr";
const PHONE_DISPLAY = "07 49 85 31 88";
const PHONE_LINK = "tel:+33749853188";
const ADDRESS = "31 route d’Autun, 71140 Maltat";

const sections = [
  { id: "objet", label: "1. Objet" },
  { id: "acceptation", label: "2. Champ d’application" },
  { id: "prestations", label: "3. Prestations et tarifs" },
  { id: "compte", label: "4. Compte client" },
  { id: "reservation", label: "5. Réservation en ligne" },
  { id: "paiement", label: "6. Acompte et paiement" },
  { id: "annulation", label: "7. Annulation et retard" },
  { id: "cartes-cadeaux", label: "8. Cartes cadeaux" },
  { id: "fidelite", label: "9. Fidélité, avis et concours" },
  { id: "responsabilite", label: "10. Responsabilité" },
  { id: "mediation", label: "11. Réclamation et médiation" },
  { id: "modification", label: "12. Modification des CGV" },
  { id: "droit", label: "13. Droit applicable" },
];

export const metadata: Metadata = {
  title: "Conditions générales | Le Palais des Ongles",
  description:
    "Conditions générales de vente et d’utilisation du site Le Palais des Ongles : réservation en ligne, acompte, annulation, cartes cadeaux.",
};

export default function ConditionsGeneralesPage() {
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
              Conditions générales
            </div>

            <h1 className="mx-auto mt-6 max-w-[20ch] font-serif text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] text-[#35242B] sm:text-[3.6rem]">
              Conditions générales
              <span className="mt-1 block bg-gradient-to-r from-[#A64D69] via-[#C47890] to-[#8B3E59] bg-clip-text italic text-transparent">
                de vente et d’utilisation
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#79636C]">
              Les présentes conditions régissent la réservation de
              prestations, l’usage de l’espace client, les cartes cadeaux et
              plus largement l’utilisation du site Le Palais des Ongles.
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
                Pour toute question sur une réservation en cours, contactez
                directement le salon.
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
              <section id="objet" className="scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Handshake className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    1. Objet
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Les présentes conditions générales de vente et
                  d’utilisation (« CGV ») ont pour objet de définir les
                  modalités et conditions dans lesquelles Pauline Dettling,
                  entrepreneure individuelle exerçant sous le nom « Le
                  Palais des Ongles » ({ADDRESS}, SIRET 844 412 254 00029),
                  propose la réservation en ligne de prestations de
                  manucure, pédicure et pose d’ongles, ainsi que l’achat de
                  cartes cadeaux et l’utilisation de l’espace client
                  accessible sur{" "}
                  <span className="font-semibold text-[#35242B]">
                    lepalaisdesongles.fr
                  </span>
                  .
                </p>
              </section>

              <section id="acceptation" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <ScrollText className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    2. Champ d’application et acceptation
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Ces CGV s’appliquent à toute réservation de prestation, tout
                  achat de carte cadeau et toute utilisation du site, qu’elle
                  soit effectuée avec ou sans création de compte client. Le
                  fait de réserver une prestation, d’acheter une carte
                  cadeau ou de créer un compte vaut acceptation pleine et
                  entière des présentes CGV, sans réserve.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Le Palais des Ongles se réserve le droit d’adapter ces CGV
                  à tout moment ; la version applicable est celle en vigueur
                  à la date de la réservation ou de l’achat.
                </p>
              </section>

              <section id="prestations" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Tag className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    3. Prestations et tarifs
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Les prestations proposées, leurs descriptifs et leurs
                  tarifs sont présentés sur la page{" "}
                  <Link
                    href="/prestations"
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    Prestations
                  </Link>
                  . Les tarifs sont indiqués en euros, toutes taxes
                  comprises (TVA non applicable, article 293 B du Code
                  général des impôts). Le Palais des Ongles se réserve le
                  droit de modifier ses tarifs à tout moment ; le prix
                  applicable à une réservation est celui affiché au moment
                  de celle-ci.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  La durée des rendez-vous est donnée à titre indicatif et
                  peut varier légèrement selon la prestation réalisée et la
                  nature de l’ongle naturel de la cliente.
                </p>
              </section>

              <section id="compte" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <KeyRound className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    4. Compte client et espace client
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  La création d’un compte client permet de suivre ses
                  rendez-vous, ses cartes cadeaux, ses avis, ses photos
                  d’inspiration et son solde de fidélité depuis l’espace
                  client. Chaque cliente est responsable de la
                  confidentialité de ses identifiants et de toute activité
                  effectuée depuis son compte. Toute suspicion d’utilisation
                  non autorisée doit être signalée sans délai au salon.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Le Palais des Ongles se réserve le droit de suspendre ou
                  clôturer un compte en cas d’usage abusif, frauduleux ou
                  contraire aux présentes CGV.
                </p>
              </section>

              <section id="reservation" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <CalendarClock className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    5. Réservation en ligne
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  La réservation s’effectue directement sur le site, en
                  choisissant une ou plusieurs prestations, une date et un
                  créneau disponible dans l’agenda du salon. La cliente peut
                  joindre des photos d’inspiration à sa réservation.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Une réservation effectuée en ligne n’est définitivement
                  confirmée qu’après réception, le cas échéant, de l’acompte
                  demandé (voir article 6). Tant que l’acompte n’est pas
                  réglé, le créneau reste provisoire et peut expirer
                  automatiquement après un court délai afin de rester
                  disponible pour d’autres clientes.
                </p>
              </section>

              <section id="paiement" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <CreditCard className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    6. Acompte et modalités de paiement
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Pour toute prestation dont le montant total est supérieur
                  à 35 €, un acompte fixe de{" "}
                  <span className="font-semibold text-[#35242B]">35 €</span>{" "}
                  est demandé afin de bloquer définitivement le créneau dans
                  l’agenda du salon. Pour les prestations d’un montant total
                  inférieur ou égal à 35 €, le règlement intégral peut être
                  demandé en ligne.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Le paiement en ligne s’effectue de manière sécurisée via
                  PayPal (carte bancaire ou compte PayPal). Le solde de la
                  prestation, déduction faite de l’acompte déjà réglé, est
                  payable directement au salon le jour du rendez-vous
                  (espèces, carte bancaire ou tout autre moyen accepté sur
                  place).
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Ces modalités (montant de l’acompte, moyens de paiement
                  acceptés) peuvent évoluer ; les conditions applicables sont
                  celles affichées au moment de la réservation.
                </p>
              </section>

              <section id="annulation" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Clock3 className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    7. Annulation, modification et retard
                  </h2>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#F0C8D4] bg-[#FFF0F4] p-5">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#A64D69]" />

                  <p className="text-sm leading-7 text-[#6F5962]">
                    Toute annulation effectuée{" "}
                    <span className="font-semibold text-[#35242B]">
                      moins de 48 heures
                    </span>{" "}
                    avant l’heure du rendez-vous entraîne la perte de
                    l’acompte versé. Ce délai peut être ajusté par le salon
                    et sera dans tous les cas rappelé lors de la
                    confirmation de rendez-vous.
                  </p>
                </div>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Une annulation effectuée plus de 48 heures avant le
                  rendez-vous, ou une annulation par le salon lui-même,
                  donne droit au remboursement ou au report de l’acompte
                  versé.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Toute modification de rendez-vous (date, heure,
                  prestation) est à demander dans les meilleurs délais,
                  directement depuis l’espace client lorsque cela est
                  possible, ou en contactant le salon.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  En cas de retard important non signalé, le salon se
                  réserve le droit de réduire la prestation, de la reporter
                  ou de l’annuler afin de ne pas pénaliser les rendez-vous
                  suivants, sans que l’acompte versé ne soit remboursé.
                </p>
              </section>

              <section id="cartes-cadeaux" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Gift className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    8. Cartes cadeaux
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Les cartes cadeaux achetées sur le site sont valables{" "}
                  <span className="font-semibold text-[#35242B]">
                    12 mois
                  </span>{" "}
                  à compter de leur date d’achat, sauf durée différente
                  précisée au moment de l’achat. Elles sont utilisables pour
                  tout ou partie du règlement d’une prestation au sein du
                  salon, dans la limite du solde disponible.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Une carte cadeau n’est ni remboursable, ni échangeable
                  contre des espèces, sauf disposition légale contraire. En
                  cas de perte du code de la carte, la cliente peut
                  retrouver ses cartes cadeaux depuis son espace client ou
                  contacter le salon.
                </p>
              </section>

              <section id="fidelite" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <BadgePercent className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    9. Programme de fidélité, avis et concours
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Le Palais des Ongles propose un programme de fidélité
                  permettant de cumuler des points ou avantages à
                  l’occasion des rendez-vous, ainsi que des concours
                  ponctuels accessibles depuis la page{" "}
                  <Link
                    href="/concours"
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    Concours
                  </Link>
                  . Ces avantages n’ont aucune valeur monétaire, ne sont ni
                  cessibles ni remboursables en espèces, et leurs règles
                  (modalités d’obtention, récompenses, durée) peuvent être
                  ajustées par le salon à tout moment.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Les avis publiés sur le site (page{" "}
                  <Link
                    href="/avis"
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    Avis
                  </Link>
                  ) doivent refléter une expérience réelle vécue au salon.
                  Le Palais des Ongles se réserve le droit de modérer ou de
                  retirer tout avis manifestement abusif, injurieux ou sans
                  lien avec une prestation effectivement réalisée.
                </p>
              </section>

              <section id="responsabilite" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <ShieldAlert className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    10. Responsabilité
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Le Palais des Ongles s’engage à réaliser les prestations
                  réservées avec soin et professionnalisme. La cliente est
                  invitée à signaler avant sa prestation toute allergie,
                  sensibilité cutanée, pathologie ou traitement en cours
                  pouvant avoir une incidence sur la réalisation de la
                  prestation.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Le site s’efforce d’assurer un accès continu et un
                  fonctionnement optimal (agenda, paiement, espace client),
                  mais ne saurait être tenu responsable d’une indisponibilité
                  temporaire liée à une maintenance, une panne technique ou
                  un cas de force majeure.
                </p>
              </section>

              <section id="mediation" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Scale className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    11. Réclamation et médiation
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  En cas de désaccord, la cliente est invitée à contacter en
                  priorité le salon par téléphone au{" "}
                  <a href={PHONE_LINK} className="font-semibold text-[#A64D69] hover:text-[#35242B]">
                    {PHONE_DISPLAY}
                  </a>{" "}
                  ou par e-mail à{" "}
                  <a
                    href={`mailto:${EMAIL}`}
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    {EMAIL}
                  </a>{" "}
                  afin de trouver une solution amiable.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Conformément aux articles L.616-1 et R.616-1 du Code de la
                  consommation, si aucune solution amiable n’a pu être
                  trouvée dans un délai raisonnable, la cliente a le droit
                  de recourir gratuitement à un médiateur de la
                  consommation. Le Palais des Ongles n’a pas encore désigné
                  de médiateur de la consommation à ce jour ; les
                  coordonnées du médiateur compétent seront ajoutées ici dès
                  qu’un dispositif de médiation aura été souscrit.
                </p>
              </section>

              <section id="modification" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <RefreshCcw className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    12. Modification des CGV
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Le Palais des Ongles se réserve le droit de modifier les
                  présentes CGV à tout moment, notamment pour tenir compte
                  d’évolutions légales, techniques ou commerciales. La
                  version en vigueur au moment d’une réservation ou d’un
                  achat est celle applicable à cette réservation ou cet
                  achat.
                </p>
              </section>

              <section id="droit" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Gavel className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    13. Droit applicable et litiges
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Les présentes CGV sont soumises au droit français. En cas
                  de litige et à défaut d’accord amiable ou de solution par
                  médiation, les tribunaux français compétents seront seuls
                  habilités à trancher le litige.
                </p>
              </section>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
