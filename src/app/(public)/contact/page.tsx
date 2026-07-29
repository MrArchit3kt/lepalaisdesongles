import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Route,
  Sparkles,
  Star,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa6";

const PHONE_DISPLAY = "07 49 85 31 88";
const PHONE_LINK = "tel:+33749853188";

const EMAIL =
  "contact@lepalaisdesongles.fr";

const ADDRESS =
  "31 route d’Autun, 71140 Maltat";

const INSTAGRAM_URL =
  "https://www.instagram.com/le_palais_des_ongles71/";

const FACEBOOK_URL =
  "https://www.facebook.com/p/Le-palais-des-ongles-by-Pauline-61573637075857";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=31+route+d%27Autun+71140+Maltat";

const APPLE_MAPS_URL =
  "https://maps.apple.com/?q=31+route+d%27Autun+71140+Maltat";

const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps?q=31+route+d%27Autun+71140+Maltat&output=embed";

const faqItems = [
  {
    question:
      "Où se situe Le Palais des Ongles ?",
    answer:
      "Le salon se trouve au 31 route d’Autun, 71140 Maltat, en Saône-et-Loire.",
  },
  {
    question:
      "Comment lancer directement l’itinéraire ?",
    answer:
      "Utilisez les boutons Google Maps ou Apple Plans présents sous la carte. Votre application GPS s’ouvrira directement avec l’adresse du salon.",
  },
  {
    question:
      "Puis-je réserver mon rendez-vous en ligne ?",
    answer:
      "Oui. La réservation en ligne vous permet de choisir votre prestation, votre date, votre horaire et d’ajouter une photo d’inspiration.",
  },
  {
    question:
      "Puis-je envoyer une photo avant mon rendez-vous ?",
    answer:
      "Oui. Vous pouvez joindre une ou plusieurs inspirations pendant votre réservation afin de préparer votre future pose.",
  },
  {
    question:
      "Comment poser une question avant de réserver ?",
    answer:
      "Vous pouvez appeler directement le salon ou envoyer un message via Instagram ou Facebook.",
  },
];

export const metadata: Metadata = {
  title:
    "Contact et accès | Le Palais des Ongles",
  description:
    "Contactez Le Palais des Ongles, retrouvez l’adresse du salon à Maltat et ouvrez directement votre itinéraire dans Google Maps ou Apple Plans.",
};

export default function ContactPage() {
  return (
    <main className="overflow-hidden bg-[#FFF9F8]">
      <section className="relative border-b border-[#241A1D]/5 px-5 py-20 sm:py-24 lg:px-8 lg:py-28">
        <div
          aria-hidden="true"
          className="absolute -left-40 top-0 size-[420px] rounded-full bg-[#E8B4B8]/25 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -right-40 bottom-0 size-[460px] rounded-full bg-[#C9A36A]/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B8899A]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#916777] shadow-sm">
              <MessageCircle className="size-4" />
              Contact et accès
            </div>

            <h1 className="mt-7 font-serif text-5xl leading-tight text-[#241A1D] sm:text-6xl lg:text-7xl">
              Une question avant
              <span className="text-[#B8899A]">
                {" "}
                votre rendez-vous ?
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#75636A] sm:text-lg">
              Retrouvez toutes les informations
              utiles pour contacter Le Palais des
              Ongles, rejoindre le salon et préparer
              votre prochaine prestation.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={PHONE_LINK}
                className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#241A1D] px-7 text-sm font-semibold text-white shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#3A292F]"
              >
                <Phone className="size-5" />
                Appeler le salon
              </a>

              <Link
                href="/reservation"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-[#241A1D]/10 bg-white px-7 text-sm font-semibold text-[#241A1D] transition hover:-translate-y-0.5 hover:bg-[#FFF0F0]"
              >
                <CalendarDays className="size-5" />
                Réserver en ligne
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[2rem] border border-[#241A1D]/7 bg-white p-7 shadow-[0_25px_70px_-45px_rgba(36,26,29,0.35)]">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#F8E6E8] text-[#A87587]">
              <MapPin className="size-5" />
            </span>

            <h2 className="mt-6 font-serif text-2xl text-[#241A1D]">
              Adresse
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#75636A]">
              31 route d’Autun
              <br />
              71140 Maltat
            </p>

            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A87587] transition hover:text-[#241A1D]"
            >
              Voir l’itinéraire
              <ArrowRight className="size-4" />
            </a>
          </article>

          <article className="rounded-[2rem] border border-[#241A1D]/7 bg-white p-7 shadow-[0_25px_70px_-45px_rgba(36,26,29,0.35)]">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#F8E6E8] text-[#A87587]">
              <Phone className="size-5" />
            </span>

            <h2 className="mt-6 font-serif text-2xl text-[#241A1D]">
              Téléphone
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#75636A]">
              Une question rapide ou besoin d’un
              conseil avant votre réservation ?
            </p>

            <a
              href={PHONE_LINK}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A87587] transition hover:text-[#241A1D]"
            >
              {PHONE_DISPLAY}
              <ArrowRight className="size-4" />
            </a>
          </article>

          <article className="rounded-[2rem] border border-[#241A1D]/7 bg-white p-7 shadow-[0_25px_70px_-45px_rgba(36,26,29,0.35)]">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#F8E6E8] text-[#A87587]">
              <Mail className="size-5" />
            </span>

            <h2 className="mt-6 font-serif text-2xl text-[#241A1D]">
              E-mail
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#75636A]">
              Pour toute demande complémentaire
              concernant le salon ou une prestation.
            </p>

            <a
              href={`mailto:${EMAIL}`}
              className="mt-5 inline-flex break-all text-sm font-semibold text-[#A87587] transition hover:text-[#241A1D]"
            >
              {EMAIL}
            </a>
          </article>

          <article className="rounded-[2rem] border border-[#241A1D]/7 bg-[#241A1D] p-7 text-white shadow-[0_25px_70px_-35px_rgba(36,26,29,0.6)]">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#E8B4B8]">
              <CalendarDays className="size-5" />
            </span>

            <h2 className="mt-6 font-serif text-2xl">
              Réservation
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/65">
              Choisissez votre prestation, votre
              créneau et ajoutez vos inspirations
              directement en ligne.
            </p>

            <Link
              href="/reservation"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#E8B4B8] transition hover:text-white"
            >
              Réserver maintenant
              <ArrowRight className="size-4" />
            </Link>
          </article>
        </div>
      </section>

      <section className="px-5 pb-20 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#A87587]">
              <Navigation className="size-4" />
              Nous trouver
            </div>

            <h2 className="mt-4 font-serif text-4xl text-[#241A1D] sm:text-5xl">
              Votre itinéraire en un clic
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-8 text-[#75636A]">
              Ouvrez directement l’adresse du salon
              dans votre application GPS préférée.
            </p>
          </div>

          <div className="overflow-hidden rounded-[2.5rem] border border-[#241A1D]/7 bg-white shadow-[0_35px_90px_-50px_rgba(36,26,29,0.45)]">
            <div className="relative aspect-[16/9] min-h-[360px] w-full lg:aspect-[21/8]">
              <iframe
                src={GOOGLE_MAPS_EMBED_URL}
                title={`Carte de ${ADDRESS}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
              />
            </div>

            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F8E6E8] text-[#A87587]">
                  <Route className="size-5" />
                </span>

                <div>
                  <h3 className="font-serif text-2xl text-[#241A1D]">
                    Le Palais des Ongles
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#75636A]">
                    31 route d’Autun
                    <br />
                    71140 Maltat
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#241A1D] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3A292F]"
                >
                  <Navigation className="size-4" />
                  Google Maps
                  <ExternalLink className="size-3.5" />
                </a>

                <a
                  href={APPLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#241A1D]/10 bg-white px-6 text-sm font-semibold text-[#241A1D] transition hover:-translate-y-0.5 hover:bg-[#FFF0F0]"
                >
                  <MapPin className="size-4" />
                  Apple Plans
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-[#241A1D]/7 bg-white px-5 py-4 text-sm text-[#5F5056]">
              <Car className="size-5 text-[#A87587]" />
              Accès simple en voiture
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#241A1D]/7 bg-white px-5 py-4 text-sm text-[#5F5056]">
              <Navigation className="size-5 text-[#A87587]" />
              GPS disponible en un clic
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#241A1D]/7 bg-white px-5 py-4 text-sm text-[#5F5056]">
              <CheckCircle2 className="size-5 text-[#A87587]" />
              Adresse complète enregistrée
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#241A1D]/5 bg-white px-5 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#A87587]">
              <Sparkles className="size-4" />
              Réseaux sociaux
            </div>

            <h2 className="mt-4 font-serif text-4xl text-[#241A1D] sm:text-5xl">
              Suivez toute l’actualité du salon
            </h2>

            <p className="mt-4 text-base leading-8 text-[#75636A]">
              Découvrez les dernières réalisations,
              les nouveautés, les promotions et les
              jeux concours du Palais des Ongles.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="group relative overflow-hidden rounded-[2.25rem] border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-8 shadow-[0_30px_80px_-50px_rgba(236,72,153,0.45)] sm:p-10">
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 size-64 rounded-full bg-pink-200/40 blur-3xl"
              />

              <div className="relative">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white shadow-lg shadow-pink-200">
                  <FaInstagram className="size-6" />
                </span>

                <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-pink-600">
                  Instagram
                </p>

                <h3 className="mt-2 font-serif text-3xl text-[#241A1D]">
                  @le_palais_des_ongles71
                </h3>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#75636A]">
                  Retrouvez les dernières poses, les
                  inspirations, les nouveautés et les
                  coulisses du salon.
                </p>

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-pink-600 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-pink-700"
                >
                  <FaInstagram className="size-4" />
                  Suivre sur Instagram
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-[2.25rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 shadow-[0_30px_80px_-50px_rgba(59,130,246,0.4)] sm:p-10">
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 size-64 rounded-full bg-blue-200/40 blur-3xl"
              />

              <div className="relative">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-[#1877F2] text-white shadow-lg shadow-blue-200">
                  <FaFacebookF className="size-6" />
                </span>

                <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Facebook
                </p>

                <h3 className="mt-2 font-serif text-3xl text-[#241A1D]">
                  Le Palais des Ongles by Pauline
                </h3>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#75636A]">
                  Consultez les actualités, échangez
                  avec le salon et ne manquez aucune
                  publication.
                </p>

                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1877F2] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1264CF]"
                >
                  <FaFacebookF className="size-4" />
                  Voir la page Facebook
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2.5rem] bg-[#241A1D] p-8 text-white shadow-2xl shadow-black/15 sm:p-10">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-[#E8B4B8]">
              <Star className="size-6 fill-current" />
            </span>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#E8B4B8]">
              Besoin d’aide ?
            </p>

            <h2 className="mt-3 font-serif text-4xl">
              Une question avant votre rendez-vous ?
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/65">
              Contactez directement le salon par
              téléphone ou via les réseaux sociaux.
              Nous vous aiderons à choisir la
              prestation la plus adaptée.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <a
                href={PHONE_LINK}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#241A1D] transition hover:-translate-y-0.5"
              >
                <Phone className="size-4" />
                {PHONE_DISPLAY}
              </a>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <FaInstagram className="size-4" />
                Écrire sur Instagram
              </a>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-[#241A1D]/7 bg-white p-8 shadow-[0_30px_80px_-50px_rgba(36,26,29,0.35)] sm:p-10">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#F8E6E8] text-[#A87587]">
                <HelpCircle className="size-5" />
              </span>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#A87587]">
                  Questions fréquentes
                </p>

                <h2 className="mt-1 font-serif text-3xl text-[#241A1D]">
                  Tout savoir avant de venir
                </h2>
              </div>
            </div>

            <div className="mt-8 divide-y divide-[#241A1D]/8">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="group py-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-[#241A1D]">
                    {item.question}

                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0F0] text-[#A87587] transition group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <p className="mt-3 max-w-2xl pr-10 text-sm leading-7 text-[#75636A]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 lg:px-8 lg:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-[#E8B4B8] via-[#C999A8] to-[#9D6D7F] px-6 py-14 text-center text-white shadow-2xl shadow-[#9D6D7F]/25 sm:px-10 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute -left-24 -top-24 size-72 rounded-full bg-white/15 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-32 -right-20 size-80 rounded-full bg-[#241A1D]/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
              <Sparkles className="size-6" />
            </div>

            <h2 className="mt-6 font-serif text-4xl sm:text-5xl">
              Prête à sublimer vos ongles ?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Choisissez votre prestation et
              réservez votre prochain moment beauté
              directement en ligne.
            </p>

            <Link
              href="/reservation"
              className="mt-8 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-8 text-sm font-semibold text-[#6E4452] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#FFF9F8]"
            >
              <CalendarDays className="size-5" />
              Réserver maintenant
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}