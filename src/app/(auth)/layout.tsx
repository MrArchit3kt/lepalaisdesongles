import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFAFB]">
      <div className="absolute inset-0">
        <div className="absolute -left-36 -top-36 size-[420px] rounded-full bg-[#E8B3C3]/20 blur-3xl" />
        <div className="absolute -bottom-44 -right-32 size-[460px] rounded-full bg-[#C9A36A]/15 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-10 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-[#35242B]/8 bg-white shadow-2xl shadow-[#4A2A3A]/10 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="relative hidden min-h-[760px] overflow-hidden bg-[#35242B] p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,180,184,0.35),transparent_40%)]" />

            <div className="relative">
              <Link
                href="/"
                className="inline-flex items-center gap-3"
              >
                <span className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10">
                  <Sparkles className="size-5 text-[#E8B3C3]" />
                </span>

                <span className="font-serif text-2xl tracking-wide">
                  Le Palais des Ongles
                </span>
              </Link>
            </div>

            <div className="relative max-w-md">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-[#E8B3C3]">
                Votre espace beauté
              </p>

              <h2 className="font-serif text-5xl leading-[1.05]">
                L’élégance jusqu’au bout des ongles.
              </h2>

              <p className="mt-6 max-w-sm leading-7 text-white/65">
                Réservez vos prestations, envoyez vos
                inspirations et échangez directement avec
                votre prothésiste ongulaire.
              </p>
            </div>

            <p className="relative text-xs text-white/45">
              © {new Date().getFullYear()} Le Palais des
              Ongles
            </p>
          </section>

          <section className="flex min-h-[700px] items-center justify-center px-5 py-10 sm:px-10 lg:px-16">
            <div className="w-full max-w-lg">
              <Link
                href="/"
                className="mb-10 inline-flex items-center gap-3 lg:hidden"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-[#35242B] text-white">
                  <Sparkles className="size-4" />
                </span>

                <span className="font-serif text-xl">
                  Le Palais des Ongles
                </span>
              </Link>

              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
