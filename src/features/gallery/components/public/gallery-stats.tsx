import {
  Award,
  Camera,
  Heart,
  Sparkles,
} from "lucide-react";

type GalleryStatsProps = {
  totalImages: number;
};

export function GalleryStats({
  totalImages,
}: GalleryStatsProps) {
  const cards = [
    {
      icon: Camera,
      label: "Réalisations",
      value: totalImages.toString(),
    },
    {
      icon: Heart,
      label: "Passion",
      value: "100%",
    },
    {
      icon: Sparkles,
      label: "Créativité",
      value: "Illimitée",
    },
    {
      icon: Award,
      label: "Qualité",
      value: "Premium",
    },
  ];

  return (
    <section className="relative bg-[#FFFAFB] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[#F0DCE3] bg-white p-6 shadow-[0_18px_50px_-30px_rgba(139,64,90,0.35)] transition duration-300 hover:-translate-y-1"
              >
                <div
                  aria-hidden="true"
                  className="absolute right-0 top-0 h-28 w-28 -translate-y-6 translate-x-6 rounded-full bg-[#E8B3C3]/25 blur-2xl"
                />

                <div className="relative">
                  <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#AA526E] via-[#BD7088] to-[#8B405A] text-white shadow-[0_10px_25px_rgba(139,64,90,0.3)]">
                    <Icon className="size-5" />
                  </span>

                  <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-[#8C747D]">
                    {card.label}
                  </p>

                  <p className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#35242B]">
                    {card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
