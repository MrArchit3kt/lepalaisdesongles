import type { Metadata } from "next";

import { BookingCta } from "@/components/home/booking-cta";
import { FeaturedReviews } from "@/components/home/featured-reviews";
import { FeaturedServices } from "@/components/home/featured-services";
import { HomeHero } from "@/components/home/home-hero";
import { HomeOffers } from "@/components/home/home-offers";
import { InstagramSection } from "@/features/home/components/instagram-section";
import { getHomePageData } from "@/features/public/services/home.service";

export const metadata: Metadata = {
  title: "Prothésiste ongulaire à Mâcon",
  description:
    "Découvrez Le Palais des Ongles, votre prothésiste ongulaire à Mâcon : gel, semi-permanent, gainage et nail art sur mesure.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <main>
      <HomeHero
        heroImageUrl={
          data.websiteSettings.homeHeroImageUrl
        }
        heroMobileImageUrl={
          data.websiteSettings.homeHeroMobileImageUrl
        }
      />

      <FeaturedServices
        services={data.featuredServices}
      />

      <HomeOffers
        promotion={data.activePromotion}
        contest={data.activeContest}
      />

      <FeaturedReviews
        reviews={data.featuredReviews}
      />

      <InstagramSection
        items={data.galleryItems}
      />

      <BookingCta
        workingHours={
          data.workingHours
        }
        imageUrl={
          data.websiteSettings.bookingCtaImageUrl
        }
      />
    </main>
  );
}