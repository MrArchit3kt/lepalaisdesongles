import type { Metadata } from "next";

import { BookingCta } from "@/components/home/booking-cta";
import { FeaturedReviews } from "@/components/home/featured-reviews";
import { FeaturedServices } from "@/components/home/featured-services";
import { HomeHero } from "@/components/home/home-hero";
import { HomeOffers } from "@/components/home/home-offers";
import { InstagramSection } from "@/features/home/components/instagram-section";
import { getHomePageData } from "@/features/public/services/home.service";

export const metadata: Metadata = {
  title: "Prothésiste ongulaire à Maltat",
  description:
    "Découvrez Le Palais des Ongles, votre prothésiste ongulaire à Maltat : gel, semi-permanent, gainage et nail art sur mesure.",
};

export const dynamic = "force-dynamic";

const DEFAULT_HOME_HERO_IMAGE = "/images/home/hero-nails-premium.jpg";

export default async function HomePage() {
  const data = await getHomePageData();

  const heroImageUrl =
    data.websiteSettings.homeHeroImageUrl || DEFAULT_HOME_HERO_IMAGE;

  const heroMobileImageUrl =
    data.websiteSettings.homeHeroMobileImageUrl ||
    data.websiteSettings.homeHeroImageUrl ||
    DEFAULT_HOME_HERO_IMAGE;

  return (
    <main>
      <HomeHero
        heroImageUrl={heroImageUrl}
        heroMobileImageUrl={heroMobileImageUrl}
      />

      <FeaturedServices services={data.featuredServices} />

      <HomeOffers
        promotion={data.activePromotion}
        contest={data.activeContest}
      />

      <FeaturedReviews reviews={data.featuredReviews} />

      <InstagramSection items={data.galleryItems} />

      <BookingCta
        workingHours={data.workingHours}
        imageUrl={data.websiteSettings.bookingCtaImageUrl}
      />
    </main>
  );
}
