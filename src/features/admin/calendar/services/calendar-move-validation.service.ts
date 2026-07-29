import {
  DayOfWeek,
} from "@/generated/prisma/client";

import {
  prisma,
} from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                CONFIGURATION                               */
/* -------------------------------------------------------------------------- */

const TIME_ZONE =
  "Europe/Paris";

const DAY_OF_WEEK_BY_NUMBER: Record<
  number,
  DayOfWeek
> = {
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
  7: DayOfWeek.SUNDAY,
};

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type ValidateCalendarMoveInput = {
  startsAt: Date;
  endsAt: Date;
  staffId: string | null;
};

type ScheduleConfiguration = {
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  reason?: string | null;
};

/* -------------------------------------------------------------------------- */
/*                              DATE UTILITIES                                */
/* -------------------------------------------------------------------------- */

function getParisDateKey(
  date: Date,
): string {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(date);
}

function getParisDayNumber(
  date: Date,
): number {
  const weekday =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: TIME_ZONE,
        weekday: "short",
      },
    ).format(date);

  switch (weekday) {
    case "Mon":
      return 1;

    case "Tue":
      return 2;

    case "Wed":
      return 3;

    case "Thu":
      return 4;

    case "Fri":
      return 5;

    case "Sat":
      return 6;

    case "Sun":
      return 7;

    default:
      throw new Error(
        "Le jour du rendez-vous ne peut pas être déterminé.",
      );
  }
}

function getParisMinutes(
  date: Date,
): number {
  const parts =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      },
    ).formatToParts(date);

  const hour =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "hour",
      )?.value ?? 0,
    );

  const minute =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "minute",
      )?.value ?? 0,
    );

  return (
    hour * 60 +
    minute
  );
}

function getDatabaseDate(
  date: Date,
): Date {
  return new Date(
    `${getParisDateKey(date)}T00:00:00.000Z`,
  );
}

function parseTime(
  value: string | null,
): number | null {
  if (
    !value ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(
      value,
    )
  ) {
    return null;
  }

  const [
    hour,
    minute,
  ] = value
    .split(":")
    .map(Number);

  return (
    hour * 60 +
    minute
  );
}

function rangesOverlap(
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): boolean {
  return (
    firstStart <
      secondEnd &&
    firstEnd >
      secondStart
  );
}

function minuteRangesOverlap(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
): boolean {
  return (
    firstStart <
      secondEnd &&
    firstEnd >
      secondStart
  );
}

/* -------------------------------------------------------------------------- */
/*                            SCHEDULE VALIDATION                             */
/* -------------------------------------------------------------------------- */

function assertInsideSchedule(
  schedule: ScheduleConfiguration,
  appointmentStartMinutes: number,
  appointmentEndMinutes: number,
  ownerLabel: string,
): void {
  if (!schedule.isOpen) {
    throw new Error(
      schedule.reason?.trim() ||
        `${ownerLabel} est fermé sur cette journée.`,
    );
  }

  const startMinutes =
    parseTime(
      schedule.startTime,
    );

  const endMinutes =
    parseTime(
      schedule.endTime,
    );

  if (
    startMinutes === null ||
    endMinutes === null
  ) {
    throw new Error(
      `Les horaires de ${ownerLabel.toLowerCase()} ne sont pas correctement configurés pour cette journée.`,
    );
  }

  if (
    appointmentStartMinutes <
      startMinutes ||
    appointmentEndMinutes >
      endMinutes
  ) {
    throw new Error(
      `Le rendez-vous doit rester compris entre ${schedule.startTime} et ${schedule.endTime}.`,
    );
  }

  const breakStart =
    parseTime(
      schedule.breakStart,
    );

  const breakEnd =
    parseTime(
      schedule.breakEnd,
    );

  if (
    breakStart !== null &&
    breakEnd !== null &&
    minuteRangesOverlap(
      appointmentStartMinutes,
      appointmentEndMinutes,
      breakStart,
      breakEnd,
    )
  ) {
    throw new Error(
      `Le rendez-vous chevauche la pause de ${ownerLabel.toLowerCase()} (${schedule.breakStart} à ${schedule.breakEnd}).`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                           BUSINESS VALIDATION                              */
/* -------------------------------------------------------------------------- */

async function assertBusinessAvailability(
  startsAt: Date,
  endsAt: Date,
): Promise<void> {
  const databaseDate =
    getDatabaseDate(
      startsAt,
    );

  const dayOfWeek =
    DAY_OF_WEEK_BY_NUMBER[
      getParisDayNumber(
        startsAt,
      )
    ];

  const [
    timeOff,
    override,
    regularHours,
  ] =
    await Promise.all([
      prisma.timeOff.findFirst({
        where: {
          startsAt: {
            lt: endsAt,
          },

          endsAt: {
            gt: startsAt,
          },
        },

        select: {
          title: true,
          reason: true,
          startsAt: true,
          endsAt: true,
        },
      }),

      prisma.workingHourOverride.findUnique({
        where: {
          date:
            databaseDate,
        },

        select: {
          isOpen: true,
          startTime: true,
          endTime: true,
          breakStart: true,
          breakEnd: true,
          reason: true,
        },
      }),

      prisma.workingHour.findUnique({
        where: {
          dayOfWeek,
        },

        select: {
          isOpen: true,
          startTime: true,
          endTime: true,
          breakStart: true,
          breakEnd: true,
        },
      }),
    ]);

  if (
    timeOff &&
    rangesOverlap(
      startsAt,
      endsAt,
      timeOff.startsAt,
      timeOff.endsAt,
    )
  ) {
    throw new Error(
      timeOff.reason?.trim() ||
        timeOff.title?.trim() ||
        "Le salon est fermé sur cette période.",
    );
  }

  const appointmentStartMinutes =
    getParisMinutes(
      startsAt,
    );

  const appointmentEndMinutes =
    getParisMinutes(
      endsAt,
    );

  if (override) {
    assertInsideSchedule(
      override,
      appointmentStartMinutes,
      appointmentEndMinutes,
      "Le salon",
    );

    return;
  }

  if (!regularHours) {
    throw new Error(
      "Les horaires du salon ne sont pas configurés pour cette journée.",
    );
  }

  assertInsideSchedule(
    regularHours,
    appointmentStartMinutes,
    appointmentEndMinutes,
    "Le salon",
  );
}

/* -------------------------------------------------------------------------- */
/*                             STAFF VALIDATION                               */
/* -------------------------------------------------------------------------- */

async function assertStaffAvailability(
  staffId: string,
  startsAt: Date,
  endsAt: Date,
): Promise<void> {
  const databaseDate =
    getDatabaseDate(
      startsAt,
    );

  const dayOfWeek =
    DAY_OF_WEEK_BY_NUMBER[
      getParisDayNumber(
        startsAt,
      )
    ];

  const [
    staff,
    timeOff,
    override,
    regularHours,
  ] =
    await Promise.all([
      prisma.staffProfile.findFirst({
        where: {
          id: staffId,
          isActive: true,
        },

        select: {
          id: true,
          displayName: true,

          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      prisma.staffTimeOff.findFirst({
        where: {
          staffId,

          startsAt: {
            lt: endsAt,
          },

          endsAt: {
            gt: startsAt,
          },
        },

        select: {
          title: true,
          reason: true,
          startsAt: true,
          endsAt: true,
        },
      }),

      prisma.staffWorkingHourOverride.findUnique({
        where: {
          staffId_date: {
            staffId,
            date:
              databaseDate,
          },
        },

        select: {
          isOpen: true,
          startTime: true,
          endTime: true,
          hasBreak: true,
          breakStart: true,
          breakEnd: true,
          reason: true,
        },
      }),

      prisma.staffWorkingHour.findUnique({
        where: {
          staffId_dayOfWeek: {
            staffId,
            dayOfWeek,
          },
        },

        select: {
          isOpen: true,
          startTime: true,
          endTime: true,
          hasBreak: true,
          breakStart: true,
          breakEnd: true,
        },
      }),
    ]);

  if (!staff) {
    throw new Error(
      "La professionnelle sélectionnée est introuvable ou inactive.",
    );
  }

  const staffName =
    staff.displayName?.trim() ||
    `${staff.user.firstName} ${staff.user.lastName}`.trim() ||
    "La professionnelle";

  if (
    timeOff &&
    rangesOverlap(
      startsAt,
      endsAt,
      timeOff.startsAt,
      timeOff.endsAt,
    )
  ) {
    throw new Error(
      timeOff.reason?.trim() ||
        timeOff.title?.trim() ||
        `${staffName} est absente sur cette période.`,
    );
  }

  const appointmentStartMinutes =
    getParisMinutes(
      startsAt,
    );

  const appointmentEndMinutes =
    getParisMinutes(
      endsAt,
    );

  if (override) {
    assertInsideSchedule(
      {
        isOpen:
          override.isOpen,

        startTime:
          override.startTime,

        endTime:
          override.endTime,

        breakStart:
          override.hasBreak
            ? override.breakStart
            : null,

        breakEnd:
          override.hasBreak
            ? override.breakEnd
            : null,

        reason:
          override.reason,
      },
      appointmentStartMinutes,
      appointmentEndMinutes,
      staffName,
    );

    return;
  }

  if (!regularHours) {
    throw new Error(
      `Les horaires de ${staffName} ne sont pas configurés pour cette journée.`,
    );
  }

  assertInsideSchedule(
    {
      isOpen:
        regularHours.isOpen,

      startTime:
        regularHours.startTime,

      endTime:
        regularHours.endTime,

      breakStart:
        regularHours.hasBreak
          ? regularHours.breakStart
          : null,

      breakEnd:
        regularHours.hasBreak
          ? regularHours.breakEnd
          : null,
    },
    appointmentStartMinutes,
    appointmentEndMinutes,
    staffName,
  );
}

/* -------------------------------------------------------------------------- */
/*                             PUBLIC FUNCTION                                */
/* -------------------------------------------------------------------------- */

export async function validateCalendarMove(
  input: ValidateCalendarMoveInput,
): Promise<void> {
  if (
    Number.isNaN(
      input.startsAt.getTime(),
    ) ||
    Number.isNaN(
      input.endsAt.getTime(),
    )
  ) {
    throw new Error(
      "Les dates du rendez-vous sont invalides.",
    );
  }

  if (
    input.endsAt <=
    input.startsAt
  ) {
    throw new Error(
      "La fin du rendez-vous doit être postérieure au début.",
    );
  }

  if (
    getParisDateKey(
      input.startsAt,
    ) !==
    getParisDateKey(
      input.endsAt,
    )
  ) {
    throw new Error(
      "Un rendez-vous ne peut pas être déplacé sur plusieurs journées.",
    );
  }

  await assertBusinessAvailability(
    input.startsAt,
    input.endsAt,
  );

  if (input.staffId) {
    await assertStaffAvailability(
      input.staffId,
      input.startsAt,
      input.endsAt,
    );
  }
}
