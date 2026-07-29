import { ReservationWizard } from "@/features/booking/components/reservation-wizard";
import { getPublicBookingCatalog } from "@/features/booking/services/public-booking-catalog.service";

export const dynamic = "force-dynamic";

export default async function ReservationPage() {
  const catalog = await getPublicBookingCatalog();

  return (
    <ReservationWizard
      categories={catalog.categories}
      staffMembers={catalog.staffMembers}
    />
  );
}
