import {
  Quote,
  Sparkles,
  Star,
} from "lucide-react";

const STARS = Array.from({
  length: 5,
});

export function GalleryTestimonial() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 -z-10 h-72 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#F0DCE3]/60 to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-[#F0DCE3] bg-white px-6 py-10 text-center shadow-[0_35px_100px_-45px_rgba(139,64,90,0.35)] sm:px-10 sm:py-14 lg:px-16">
          <div
            aria-hidden="true"
            className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[#F6E7EB]/80 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-[#F2E3BD]/50 blur-3xl"
          />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#AA526E] to-[#8B405A] text-white shadow-lg">
              <Quote className="h-6 w-6" />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#ECD9DF] bg-[#FFF7F9] px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#A44E69]">
              <Sparkles className="h-4 w-4" />

              L’expérience du salon
            </div>

            <blockquote className="mx-auto mt-7 max-w-3xl font-serif text-2xl italic leading-tight tracking-tight text-[#35242B] sm:text-3xl lg:text-4xl">
              “Une pose magnifique,
              réalisée avec beaucoup
              de soin et exactement
              comme je l’imaginais.”
            </blockquote>

            <div className="mt-7 flex justify-center gap-1">
              {STARS.map((_, index) => (
                <Star
                  key={index}
                  className="h-5 w-5 fill-[#A64D69] text-[#A64D69]"
                />
              ))}
            </div>

            <div className="mt-5">
              <p className="font-bold text-[#35242B]">
                Cliente du Palais
                des Ongles
              </p>

              <p className="mt-1 text-sm text-[#8C747D]">
                Avis vérifié
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
