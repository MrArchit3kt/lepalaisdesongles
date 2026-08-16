import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Baby,
  CalendarDays,
  Clock3,
  Cookie,
  Database,
  ExternalLink,
  FileText,
  Lock,
  Mail,
  RefreshCcw,
  Share2,
  ShieldCheck,
  Target,
  UserCheck,
} from "lucide-react";

const LAST_UPDATED = "16 août 2026";

const EMAIL = "contact@lepalaisdesongles.fr";
const PHONE_DISPLAY = "07 49 85 31 88";
const PHONE_LINK = "tel:+33749853188";
const ADDRESS = "31 route d’Autun, 71140 Maltat";

const sections = [
  { id: "responsable", label: "1. Responsable du traitement" },
  { id: "donnees", label: "2. Données collectées" },
  { id: "finalites", label: "3. Finalités et bases légales" },
  { id: "destinataires", label: "4. Destinataires des données" },
  { id: "conservation", label: "5. Durée de conservation" },
  { id: "cookies", label: "6. Cookies" },
  { id: "securite", label: "7. Sécurité des données" },
  { id: "droits", label: "8. Vos droits" },
  { id: "mineurs", label: "9. Mineurs" },
  { id: "modification", label: "10. Modification de la politique" },
];

export const metadata: Metadata = {
  title: "Politique de confidentialité | Le Palais des Ongles",
  description:
    "Politique de confidentialité du site Le Palais des Ongles : données collectées, finalités, durée de conservation et droits RGPD.",
};

export default function PolitiqueConfidentialitePage() {
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
              <ShieldCheck className="size-4" />
              Vie privée &amp; RGPD
            </div>

            <h1 className="mx-auto mt-6 max-w-[18ch] font-serif text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] text-[#35242B] sm:text-[3.6rem]">
              Politique de
              <span className="ml-3 bg-gradient-to-r from-[#A64D69] via-[#C47890] to-[#8B3E59] bg-clip-text italic text-transparent">
                confidentialité
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#79636C]">
              Nous accordons une grande importance à la protection de vos
              données personnelles. Cette page explique quelles données
              sont collectées sur ce site, pourquoi, et quels sont vos
              droits.
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
                Exercer vos droits
              </p>

              <p className="mt-3 text-sm leading-6 text-[#6F5962]">
                Écrivez-nous à tout moment pour accéder, corriger ou
                supprimer vos données.
              </p>

              <a
                href={`mailto:${EMAIL}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#A64D69] transition hover:text-[#35242B]"
              >
                {EMAIL}
                <ArrowRight className="size-4" />
              </a>
            </div>
          </aside>

          <div className="min-w-0 rounded-[2rem] border border-[#F0DCE3] bg-white p-7 shadow-[0_25px_70px_-45px_rgba(139,64,90,0.35)] sm:p-10">
            <article className="max-w-none text-[#4A3B41]">
              <section id="responsable" className="scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <UserCheck className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    1. Responsable du traitement
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Le responsable du traitement des données personnelles
                  collectées sur ce site est{" "}
                  <span className="font-semibold text-[#35242B]">
                    Pauline Dettling
                  </span>
                  , entrepreneure individuelle exerçant sous le nom « Le
                  Palais des Ongles », domiciliée au {ADDRESS} (SIRET 844
                  412 254 00029).
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Pour toute question relative à vos données personnelles,
                  vous pouvez nous contacter à{" "}
                  <a
                    href={`mailto:${EMAIL}`}
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    {EMAIL}
                  </a>{" "}
                  ou au{" "}
                  <a
                    href={PHONE_LINK}
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    {PHONE_DISPLAY}
                  </a>
                  .
                </p>
              </section>

              <section id="donnees" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Database className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    2. Données collectées
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Selon votre utilisation du site, nous pouvons collecter :
                </p>

                <ul className="mt-4 space-y-3 text-sm leading-7 text-[#6F5962]">
                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        Données d’identification et de contact
                      </span>{" "}
                      : nom, prénom, adresse e-mail, numéro de téléphone,
                      mot de passe (stocké de façon chiffrée) lors de la
                      création d’un compte client ou d’une réservation.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        Données de réservation
                      </span>{" "}
                      : prestations choisies, dates et horaires de
                      rendez-vous, historique des rendez-vous, photos
                      d’inspiration éventuellement transmises, motifs
                      d’annulation.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        Données de paiement
                      </span>{" "}
                      : les paiements en ligne (acomptes, cartes cadeaux)
                      sont traités directement par PayPal. Le Palais des
                      Ongles ne stocke jamais vos coordonnées bancaires ; il
                      conserve uniquement l’identifiant de transaction et le
                      statut du paiement.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        Cartes cadeaux et fidélité
                      </span>{" "}
                      : solde, historique d’utilisation, points de
                      fidélité, participations aux concours.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        Avis
                      </span>{" "}
                      : contenu des avis que vous publiez volontairement sur
                      votre expérience au salon.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        Messages
                      </span>{" "}
                      : contenu des messages échangés via le formulaire de
                      contact ou la messagerie de l’espace client.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        Données techniques
                      </span>{" "}
                      : cookie de session nécessaire à la connexion à
                      l’espace client (voir article 6).
                    </span>
                  </li>
                </ul>
              </section>

              <section id="finalites" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Target className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    3. Finalités et bases légales
                  </h2>
                </div>

                <div className="mt-5 overflow-x-auto rounded-2xl border border-[#F0DCE3]">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-[#FFF0F4] text-[#35242B]">
                        <th className="px-5 py-3 font-semibold">
                          Finalité
                        </th>
                        <th className="px-5 py-3 font-semibold">
                          Base légale
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#F0DCE3] text-[#6F5962]">
                      <tr>
                        <td className="px-5 py-3">
                          Gestion des réservations et du compte client
                        </td>
                        <td className="px-5 py-3">
                          Exécution du contrat (relation client)
                        </td>
                      </tr>

                      <tr>
                        <td className="px-5 py-3">
                          Encaissement des acomptes et des cartes cadeaux
                        </td>
                        <td className="px-5 py-3">
                          Exécution du contrat
                        </td>
                      </tr>

                      <tr>
                        <td className="px-5 py-3">
                          Envoi d’e-mails de confirmation, de rappel ou de
                          notification
                        </td>
                        <td className="px-5 py-3">
                          Exécution du contrat / intérêt légitime
                        </td>
                      </tr>

                      <tr>
                        <td className="px-5 py-3">
                          Programme de fidélité et concours
                        </td>
                        <td className="px-5 py-3">
                          Consentement / exécution du contrat
                        </td>
                      </tr>

                      <tr>
                        <td className="px-5 py-3">
                          Publication et modération des avis clients
                        </td>
                        <td className="px-5 py-3">
                          Consentement
                        </td>
                      </tr>

                      <tr>
                        <td className="px-5 py-3">
                          Réponse aux demandes de contact
                        </td>
                        <td className="px-5 py-3">
                          Intérêt légitime
                        </td>
                      </tr>

                      <tr>
                        <td className="px-5 py-3">
                          Respect des obligations comptables et fiscales
                        </td>
                        <td className="px-5 py-3">
                          Obligation légale
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="destinataires" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Share2 className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    4. Destinataires des données
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Vos données sont traitées par Le Palais des Ongles et,
                  pour les besoins strictement nécessaires au fonctionnement
                  du site, par les prestataires techniques suivants :
                </p>

                <ul className="mt-4 space-y-3 text-sm leading-7 text-[#6F5962]">
                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        Hostinger
                      </span>{" "}
                      — hébergement du site et de la base de données.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        PayPal
                      </span>{" "}
                      — traitement sécurisé des paiements en ligne (acomptes
                      et cartes cadeaux).
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        Resend
                      </span>{" "}
                      — envoi des e-mails transactionnels (confirmation de
                      rendez-vous, rappels, notifications).
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        UploadThing
                      </span>{" "}
                      — stockage sécurisé des photos d’inspiration ou de
                      réalisations transmises via le site.
                    </span>
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#A64D69]" />
                    <span>
                      <span className="font-semibold text-[#35242B]">
                        Google (Places API)
                      </span>{" "}
                      — affichage des avis Google publics sur la page{" "}
                      <Link
                        href="/avis"
                        className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                      >
                        Avis
                      </Link>
                      . Aucune donnée personnelle du site n’est transmise à
                      Google dans ce cadre.
                    </span>
                  </li>
                </ul>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Ces prestataires n’utilisent vos données que pour le
                  compte du Palais des Ongles et dans le cadre strict des
                  services fournis. Vos données ne sont ni vendues, ni
                  louées, ni utilisées à des fins publicitaires par des
                  tiers.
                </p>
              </section>

              <section id="conservation" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Clock3 className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    5. Durée de conservation
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Les données de votre compte client et l’historique de vos
                  rendez-vous sont conservés pendant toute la durée de la
                  relation commerciale, puis archivés le temps des délais
                  légaux de prescription et des obligations comptables
                  applicables (jusqu’à 10 ans pour les documents comptables
                  liés aux paiements). Vous pouvez à tout moment demander la
                  clôture de votre compte et la suppression de vos données,
                  sous réserve des obligations légales de conservation.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Les données de connexion (cookie de session) sont
                  conservées le temps de la session ou selon la durée de
                  connexion choisie, puis supprimées automatiquement.
                </p>
              </section>

              <section id="cookies" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Cookie className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    6. Cookies
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Le site utilise un unique cookie strictement nécessaire au
                  fonctionnement du service : le cookie de session qui vous
                  maintient connectée à votre espace client une fois
                  identifiée. Ce cookie est indispensable au bon
                  fonctionnement du site et n’est soumis à aucun
                  consentement préalable, conformément à l’article 82 de la
                  loi Informatique et Libertés.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Le site ne dépose aucun cookie de mesure d’audience, de
                  publicité ciblée ou de traçage tiers.
                </p>
              </section>

              <section id="securite" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Lock className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    7. Sécurité des données
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Le Palais des Ongles met en œuvre des mesures techniques
                  et organisationnelles raisonnables pour protéger vos
                  données contre l’accès non autorisé, la perte ou
                  l’altération : connexion chiffrée (HTTPS), mots de passe
                  stockés sous forme chiffrée, accès restreint aux données
                  administratives, limitation du nombre de tentatives de
                  connexion.
                </p>
              </section>

              <section id="droits" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <FileText className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    8. Vos droits
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Conformément au RGPD et à la loi Informatique et Libertés,
                  vous disposez des droits suivants sur vos données
                  personnelles :
                </p>

                <ul className="mt-4 grid gap-3 text-sm leading-7 text-[#6F5962] sm:grid-cols-2">
                  <li className="rounded-xl bg-[#FFFAFB] px-4 py-3">
                    Droit d’accès à vos données
                  </li>
                  <li className="rounded-xl bg-[#FFFAFB] px-4 py-3">
                    Droit de rectification
                  </li>
                  <li className="rounded-xl bg-[#FFFAFB] px-4 py-3">
                    Droit à l’effacement
                  </li>
                  <li className="rounded-xl bg-[#FFFAFB] px-4 py-3">
                    Droit à la limitation du traitement
                  </li>
                  <li className="rounded-xl bg-[#FFFAFB] px-4 py-3">
                    Droit d’opposition
                  </li>
                  <li className="rounded-xl bg-[#FFFAFB] px-4 py-3">
                    Droit à la portabilité des données
                  </li>
                </ul>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Pour exercer l’un de ces droits, écrivez-nous à{" "}
                  <a
                    href={`mailto:${EMAIL}`}
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    {EMAIL}
                  </a>{" "}
                  en précisant votre nom et l’objet de votre demande. Une
                  réponse vous sera apportée dans un délai maximum d’un
                  mois.
                </p>

                <p className="mt-4 text-sm leading-7 text-[#6F5962]">
                  Si vous estimez, après nous avoir contactés, que vos
                  droits ne sont pas respectés, vous pouvez introduire une
                  réclamation auprès de la Commission Nationale de
                  l’Informatique et des Libertés (
                  <a
                    href="https://www.cnil.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    cnil.fr
                    <ExternalLink className="size-3.5" />
                  </a>
                  ).
                </p>
              </section>

              <section id="mineurs" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <Baby className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    9. Mineurs
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Le site n’est pas destiné aux mineurs de moins de 15 ans.
                  La création d’un compte client par un mineur de moins de
                  15 ans nécessite le consentement d’un titulaire de
                  l’autorité parentale.
                </p>
              </section>

              <section id="modification" className="mt-12 scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFF0F4] text-[#A64D69]">
                    <RefreshCcw className="size-5" />
                  </span>

                  <h2 className="font-serif text-2xl text-[#35242B] sm:text-3xl">
                    10. Modification de la politique
                  </h2>
                </div>

                <p className="mt-5 text-sm leading-7 text-[#6F5962]">
                  Cette politique de confidentialité peut être mise à jour
                  à tout moment, notamment pour s’adapter aux évolutions
                  légales, réglementaires ou techniques. La date de
                  dernière mise à jour est indiquée en haut de cette page.
                  Nous vous invitons à la consulter régulièrement.
                </p>
              </section>

              <div className="mt-12 flex flex-col gap-3 rounded-2xl border border-[#F0DCE3] bg-[#FFFAFB] p-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-[#6F5962]">
                  Retrouvez également nos{" "}
                  <Link
                    href="/mentions-legales"
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    mentions légales
                  </Link>{" "}
                  et nos{" "}
                  <Link
                    href="/conditions-generales"
                    className="font-semibold text-[#A64D69] hover:text-[#35242B]"
                  >
                    conditions générales
                  </Link>
                  .
                </p>

                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#35242B] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#4A2E38]"
                >
                  <Mail className="size-4" />
                  Nous écrire
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
