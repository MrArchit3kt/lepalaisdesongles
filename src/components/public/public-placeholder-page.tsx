import {
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type PublicPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PublicPlaceholderPage({
  eyebrow,
  title,
  description,
}: PublicPlaceholderPageProps) {
  return (
    <main className="min-h-[70vh] bg-[#FFF9F8] px-5 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[40px] border border-[#241A1D]/7 bg-white p-8 shadow-sm sm:p-14 lg:p-20">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#9D6F80]">
            <Sparkles className="size-5" />
          </span>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-[#A06F81]">
            {eyebrow}
          </p>

          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight text-[#241A1D]">
            {title}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#75636A]">
            {description}
          </p>

          <Link
            href="/reservation"
            className="mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#241A1D] px-7 text-sm font-semibold text-white"
          >
            Prendre rendez-vous
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
