import {
  AdminContestForm,
} from "@/features/admin/contests/components/admin-contest-form";

import {
  requireAdminUser,
} from "@/lib/session";

export const dynamic =
  "force-dynamic";

const HOUR_IN_MILLISECONDS =
  60 * 60 * 1000;

const DAY_IN_MILLISECONDS =
  24 * HOUR_IN_MILLISECONDS;

type InitialContestDates = {
  startsAt: string;
  endsAt: string;
  drawAt: string;
};

function createInitialContestDates(): InitialContestDates {
  const startsAt =
    new Date(
      Date.now() +
        DAY_IN_MILLISECONDS,
    );

  const endsAt =
    new Date(
      startsAt.getTime() +
        7 *
          DAY_IN_MILLISECONDS,
    );

  const drawAt =
    new Date(
      endsAt.getTime() +
        HOUR_IN_MILLISECONDS,
    );

  return {
    startsAt:
      startsAt.toISOString(),

    endsAt:
      endsAt.toISOString(),

    drawAt:
      drawAt.toISOString(),
  };
}

export default async function NewAdminContestPage() {
  await requireAdminUser();

  const {
    startsAt,
    endsAt,
    drawAt,
  } = createInitialContestDates();

  return (
    <AdminContestForm
      mode="CREATE"
      initialValue={{
        title:
          "",

        slug:
          "",

        description:
          "",

        rules:
          "",

        prize:
          "",

        imageUrl:
          "",

        status:
          "DRAFT",

        startsAt,

        endsAt,

        drawAt,

        maximumEntries:
          null,

        requiresAccount:
          true,

        showOnHomepage:
          false,
      }}
    />
  );
}
