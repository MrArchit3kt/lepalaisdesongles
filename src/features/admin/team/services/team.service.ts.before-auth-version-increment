import { hash } from "bcryptjs";

import {
  AppointmentStatus,
  DayOfWeek,
  UserRole,
  UserStatus,
  type Prisma,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import {
  createTeamMemberSchema,
  type CreateTeamMemberInput,
} from "../schemas/create-team-member.schema";

import {
  updateTeamMemberSchema,
  type UpdateTeamMemberInput,
} from "../schemas/update-team-member.schema";

import type {
  TeamMember,
  TeamMemberListResponse,
  TeamQuery,
  TeamService,
  TeamSortDirection,
  TeamSortField,
  TeamStatistics,
  TeamWorkingHour,
  TeamWorkingHourOverride,
  TeamWorkstation,
  TeamTimeOff,
} from "../types/team.types";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTES                                */
/* -------------------------------------------------------------------------- */

const PASSWORD_SALT_ROUNDS = 12;

const DAYS_OF_WEEK: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

const CANCELLED_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.REFUSED,
  AppointmentStatus.CANCELLED_BY_CLIENT,
  AppointmentStatus.CANCELLED_BY_ADMIN,
  AppointmentStatus.NO_SHOW,
  AppointmentStatus.EXPIRED,
];

const TEAM_MEMBER_INCLUDE = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      image: true,
      status: true,
      role: true,
    },
  },

  services: {
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    include: {
      service: {
        select: {
          id: true,
          name: true,
          durationMinutes: true,
          cleanupMinutes: true,
          priceCents: true,
          depositRequired: true,
          depositCents: true,
        },
      },
    },
  },

  workstationAssignments: {
    orderBy: [
      {
        isPrimary: "desc",
      },
      {
        createdAt: "asc",
      },
    ],
    include: {
      workstation: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
        },
      },
    },
  },

  workingHours: {
    orderBy: {
      dayOfWeek: "asc",
    },
  },

  overrides: {
    orderBy: {
      date: "asc",
    },
  },

  timeOffs: {
    orderBy: {
      startsAt: "asc",
    },
  },

  appointments: {
    select: {
      id: true,
      clientId: true,
      status: true,
      totalPriceCents: true,

      review: {
        select: {
          rating: true,
        },
      },
    },
  },
} satisfies Prisma.StaffProfileInclude;

type TeamMemberRecord = Prisma.StaffProfileGetPayload<{
  include: typeof TEAM_MEMBER_INCLUDE;
}>;

/* -------------------------------------------------------------------------- */
/*                                  UTILITAIRES                               */
/* -------------------------------------------------------------------------- */

function normalizeOptionalString(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function normalizeEmail(value: string): string {
  return value.trim().toLocaleLowerCase("fr-FR");
}

function normalizeSearch(value: string | null | undefined): string {
  return (
    value
      ?.trim()
      .toLocaleLowerCase("fr-FR")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "") ?? ""
  );
}

function normalizeIdList(ids: string[]): string[] {
  return Array.from(
    new Set(
      ids
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );
}

function getDisplayName(record: {
  displayName: string | null;
  user: {
    firstName: string;
    lastName: string;
  };
}): string {
  const configuredDisplayName =
    record.displayName?.trim();

  if (configuredDisplayName) {
    return configuredDisplayName;
  }

  return `${record.user.firstName} ${record.user.lastName}`.trim();
}

function calculateTeamStatistics(
  appointments: TeamMemberRecord["appointments"],
): TeamStatistics {
  let completedAppointments = 0;
  let cancelledAppointments = 0;
  let revenueCents = 0;

  const clientIds = new Set<string>();
  const ratings: number[] = [];

  for (const appointment of appointments) {
    clientIds.add(appointment.clientId);

    if (
      appointment.status ===
      AppointmentStatus.COMPLETED
    ) {
      completedAppointments += 1;
      revenueCents += appointment.totalPriceCents;
    }

    if (
      CANCELLED_APPOINTMENT_STATUSES.includes(
        appointment.status,
      )
    ) {
      cancelledAppointments += 1;
    }

    if (appointment.review?.rating) {
      ratings.push(appointment.review.rating);
    }
  }

  const averageTicketCents =
    completedAppointments > 0
      ? Math.round(
          revenueCents / completedAppointments,
        )
      : 0;

  const averageRating =
    ratings.length > 0
      ? Number(
          (
            ratings.reduce(
              (total, rating) => total + rating,
              0,
            ) / ratings.length
          ).toFixed(2),
        )
      : 0;

  return {
    appointments: appointments.length,
    completedAppointments,
    cancelledAppointments,
    revenueCents,
    averageTicketCents,
    averageRating,
    clients: clientIds.size,
  };
}

function mapTeamWorkstations(
  record: TeamMemberRecord,
): TeamWorkstation[] {
  return record.workstationAssignments.map(
    (assignment) => ({
      id: assignment.workstation.id,
      name: assignment.workstation.name,
      slug: assignment.workstation.slug,
      isPrimary: assignment.isPrimary,
      isActive:
        assignment.isActive &&
        assignment.workstation.isActive,
    }),
  );
}

function mapTeamServices(
  record: TeamMemberRecord,
): TeamService[] {
  return record.services.map((assignment) => ({
    id: assignment.id,
    serviceId: assignment.serviceId,
    name: assignment.service.name,

    durationMinutes:
      assignment.durationMinutes ??
      assignment.service.durationMinutes,

    cleanupMinutes:
      assignment.cleanupMinutes ??
      assignment.service.cleanupMinutes,

    priceCents:
      assignment.priceCents ??
      assignment.service.priceCents,

    depositRequired:
      assignment.depositRequired ??
      assignment.service.depositRequired,

    depositCents:
      assignment.depositCents ??
      assignment.service.depositCents,

    isActive: assignment.isActive,
  }));
}

function mapWorkingHours(
  record: TeamMemberRecord,
): TeamWorkingHour[] {
  return record.workingHours.map((workingHour) => ({
    id: workingHour.id,
    dayOfWeek: workingHour.dayOfWeek,
    isOpen: workingHour.isOpen,
    startTime: workingHour.startTime,
    endTime: workingHour.endTime,
    hasBreak: workingHour.hasBreak,
    breakStart: workingHour.breakStart,
    breakEnd: workingHour.breakEnd,
  }));
}

function mapWorkingHourOverrides(
  record: TeamMemberRecord,
): TeamWorkingHourOverride[] {
  return record.overrides.map((override) => ({
    id: override.id,
    date: override.date.toISOString(),
    isOpen: override.isOpen,
    startTime: override.startTime,
    endTime: override.endTime,
    hasBreak: override.hasBreak,
    breakStart: override.breakStart,
    breakEnd: override.breakEnd,
    reason: override.reason,
  }));
}

function mapTimeOffs(
  record: TeamMemberRecord,
): TeamTimeOff[] {
  return record.timeOffs.map((timeOff) => ({
    id: timeOff.id,
    title: timeOff.title,
    reason: timeOff.reason,
    startsAt: timeOff.startsAt.toISOString(),
    endsAt: timeOff.endsAt.toISOString(),
    allDay: timeOff.allDay,
  }));
}

function mapTeamMember(
  record: TeamMemberRecord,
): TeamMember {
  return {
    id: record.id,
    userId: record.userId,

    firstName: record.user.firstName,
    lastName: record.user.lastName,
    displayName: getDisplayName(record),

    email: record.user.email,
    phone: record.user.phone,
    image: record.user.image,

    bio: record.bio,
    color: record.color,

    isOwner: record.isOwner,
    isActive:
      record.isActive &&
      record.user.status === UserStatus.ACTIVE,

    acceptsOnlineBooking:
      record.acceptsOnlineBooking,

    defaultCleanupMinutes:
      record.defaultCleanupMinutes,

    slotIntervalMinutes:
      record.slotIntervalMinutes,

    sortOrder: record.sortOrder,

    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),

    workstations: mapTeamWorkstations(record),
    services: mapTeamServices(record),
    workingHours: mapWorkingHours(record),
    overrides:
      mapWorkingHourOverrides(record),
    timeOffs: mapTimeOffs(record),

    statistics: calculateTeamStatistics(
      record.appointments,
    ),
  };
}

function compareNumbers(
  first: number,
  second: number,
  direction: TeamSortDirection,
): number {
  return direction === "asc"
    ? first - second
    : second - first;
}

function compareStrings(
  first: string,
  second: string,
  direction: TeamSortDirection,
): number {
  const result = first.localeCompare(
    second,
    "fr-FR",
    {
      sensitivity: "base",
    },
  );

  return direction === "asc"
    ? result
    : -result;
}

function sortTeamMembers(
  members: TeamMember[],
  sortField: TeamSortField,
  sortDirection: TeamSortDirection,
): TeamMember[] {
  return [...members].sort((first, second) => {
    if (sortField === "displayName") {
      return compareStrings(
        first.displayName,
        second.displayName,
        sortDirection,
      );
    }

    if (sortField === "createdAt") {
      return compareNumbers(
        new Date(first.createdAt).getTime(),
        new Date(second.createdAt).getTime(),
        sortDirection,
      );
    }

    if (sortField === "appointments") {
      return compareNumbers(
        first.statistics.appointments,
        second.statistics.appointments,
        sortDirection,
      );
    }

    return compareNumbers(
      first.statistics.revenueCents,
      second.statistics.revenueCents,
      sortDirection,
    );
  });
}

function filterTeamMembers(
  members: TeamMember[],
  query: TeamQuery,
): TeamMember[] {
  const search = normalizeSearch(
    query.filters.search,
  );

  return members.filter((member) => {
    if (
      query.filters.activeOnly &&
      !member.isActive
    ) {
      return false;
    }

    if (
      query.filters.onlineBookingOnly &&
      !member.acceptsOnlineBooking
    ) {
      return false;
    }

    if (
      !query.filters.includeOwner &&
      member.isOwner
    ) {
      return false;
    }

    if (!search) {
      return true;
    }

    const searchableContent = normalizeSearch(
      [
        member.displayName,
        member.firstName,
        member.lastName,
        member.email,
        member.phone ?? "",
        member.bio ?? "",
        ...member.services.map(
          (service) => service.name,
        ),
        ...member.workstations.map(
          (workstation) => workstation.name,
        ),
      ].join(" "),
    );

    return searchableContent.includes(search);
  });
}

/* -------------------------------------------------------------------------- */
/*                              VÉRIFICATIONS DB                              */
/* -------------------------------------------------------------------------- */

async function assertEmailAvailable(
  email: string,
  excludedUserId?: string,
): Promise<void> {
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      ...(excludedUserId
        ? {
            id: {
              not: excludedUserId,
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new Error(
      "Cette adresse e-mail est déjà utilisée.",
    );
  }
}

async function assertServicesExist(
  serviceIds: string[],
): Promise<void> {
  if (serviceIds.length === 0) {
    return;
  }

  const count = await prisma.service.count({
    where: {
      id: {
        in: serviceIds,
      },
    },
  });

  if (count !== serviceIds.length) {
    throw new Error(
      "Une ou plusieurs prestations sélectionnées sont introuvables.",
    );
  }
}

async function assertWorkstationsExist(
  workstationIds: string[],
): Promise<void> {
  if (workstationIds.length === 0) {
    return;
  }

  const count = await prisma.workstation.count({
    where: {
      id: {
        in: workstationIds,
      },
    },
  });

  if (count !== workstationIds.length) {
    throw new Error(
      "Un ou plusieurs postes sélectionnés sont introuvables.",
    );
  }
}

async function getNextSortOrder(): Promise<number> {
  const lastMember =
    await prisma.staffProfile.findFirst({
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        sortOrder: true,
      },
    });

  return (lastMember?.sortOrder ?? -1) + 1;
}

/* -------------------------------------------------------------------------- */
/*                         INITIALISATION DES HORAIRES                         */
/* -------------------------------------------------------------------------- */

function defaultWorkingHourForDay(
  dayOfWeek: DayOfWeek,
) {
  const isSunday =
    dayOfWeek === DayOfWeek.SUNDAY;

  return {
    dayOfWeek,
    isOpen: !isSunday,
    startTime: isSunday ? null : "09:00",
    endTime: isSunday ? null : "19:00",
    breakStart: null,
    breakEnd: null,
  };
}

async function buildInitialWorkingHours(
  isOwner: boolean,
): Promise<
  Array<{
    dayOfWeek: DayOfWeek;
    isOpen: boolean;
    startTime: string | null;
    endTime: string | null;
    hasBreak: boolean;
    breakStart: string | null;
    breakEnd: string | null;
  }>
> {
  const salonHours =
    await prisma.workingHour.findMany();

  const salonHoursMap = new Map(
    salonHours.map((hour) => [
      hour.dayOfWeek,
      hour,
    ]),
  );

  return DAYS_OF_WEEK.map((dayOfWeek) => {
    const configuredHour =
      salonHoursMap.get(dayOfWeek);

    const fallback =
      defaultWorkingHourForDay(dayOfWeek);

    const isOpen =
      configuredHour?.isOpen ??
      fallback.isOpen;

    const breakStart =
      isOwner
        ? null
        : configuredHour?.breakStart ?? null;

    const breakEnd =
      isOwner
        ? null
        : configuredHour?.breakEnd ?? null;

    return {
      dayOfWeek,
      isOpen,

      startTime: isOpen
        ? configuredHour?.startTime ??
          fallback.startTime
        : null,

      endTime: isOpen
        ? configuredHour?.endTime ??
          fallback.endTime
        : null,

      hasBreak:
        isOpen &&
        !isOwner &&
        Boolean(breakStart && breakEnd),

      breakStart:
        isOpen && !isOwner
          ? breakStart
          : null,

      breakEnd:
        isOpen && !isOwner
          ? breakEnd
          : null,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*                                  LECTURE                                   */
/* -------------------------------------------------------------------------- */

export async function getTeamMembers(
  query: TeamQuery = {
    filters: {
      search: "",
      activeOnly: false,
      onlineBookingOnly: false,
      includeOwner: true,
    },
    sortField: "displayName",
    sortDirection: "asc",
  },
): Promise<TeamMemberListResponse> {
  const records =
    await prisma.staffProfile.findMany({
      include: TEAM_MEMBER_INCLUDE,
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

  const mappedMembers =
    records.map(mapTeamMember);

  const filteredMembers =
    filterTeamMembers(mappedMembers, query);

  const sortedMembers = sortTeamMembers(
    filteredMembers,
    query.sortField,
    query.sortDirection,
  );

  return {
    members: sortedMembers,
    total: sortedMembers.length,
  };
}

export async function getTeamMemberById(
  id: string,
): Promise<TeamMember> {
  const cleanId = id.trim();

  if (!cleanId) {
    throw new Error(
      "Identifiant de la professionnelle manquant.",
    );
  }

  const record =
    await prisma.staffProfile.findUnique({
      where: {
        id: cleanId,
      },
      include: TEAM_MEMBER_INCLUDE,
    });

  if (!record) {
    throw new Error(
      "Professionnelle introuvable.",
    );
  }

  return mapTeamMember(record);
}

export async function getTeamMemberByUserId(
  userId: string,
): Promise<TeamMember | null> {
  const cleanUserId = userId.trim();

  if (!cleanUserId) {
    return null;
  }

  const record =
    await prisma.staffProfile.findUnique({
      where: {
        userId: cleanUserId,
      },
      include: TEAM_MEMBER_INCLUDE,
    });

  return record
    ? mapTeamMember(record)
    : null;
}

export async function getTeamFormOptions() {
  const [services, workstations] =
    await Promise.all([
      prisma.service.findMany({
        where: {
          isActive: true,
        },
        orderBy: [
          {
            category: {
              sortOrder: "asc",
            },
          },
          {
            sortOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
        select: {
          id: true,
          name: true,
          durationMinutes: true,
          priceCents: true,

          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),

      prisma.workstation.findMany({
        where: {
          isActive: true,
        },
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          availableForBooking: true,
        },
      }),
    ]);

  return {
    services,
    workstations,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  CRÉATION                                  */
/* -------------------------------------------------------------------------- */

export async function createTeamMember(
  rawInput: CreateTeamMemberInput,
): Promise<TeamMember> {
  const input =
    createTeamMemberSchema.parse(rawInput);

  const email = normalizeEmail(input.email);

  const serviceIds = normalizeIdList(
    input.serviceIds,
  );

  const workstationIds = normalizeIdList(
    input.workstationIds,
  );

  await Promise.all([
    assertEmailAvailable(email),
    assertServicesExist(serviceIds),
    assertWorkstationsExist(workstationIds),
  ]);

  const [
    passwordHash,
    sortOrder,
    initialWorkingHours,
  ] = await Promise.all([
    hash(
      input.password,
      PASSWORD_SALT_ROUNDS,
    ),
    getNextSortOrder(),
    buildInitialWorkingHours(input.isOwner),
  ]);

  const createdStaffId =
    await prisma.$transaction(
      async (transaction) => {
        if (input.isOwner) {
          await transaction.staffProfile.updateMany({
            where: {
              isOwner: true,
            },
            data: {
              isOwner: false,
            },
          });
        }

        const user = await transaction.user.create({
          data: {
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            email,
            phone:
              normalizeOptionalString(input.phone),
            passwordHash,

            role: input.isOwner
              ? UserRole.ADMIN
              : UserRole.STAFF,

            status: input.isActive
              ? UserStatus.ACTIVE
              : UserStatus.DISABLED,

            emailVerified: new Date(),
          },
          select: {
            id: true,
          },
        });

        const staff =
          await transaction.staffProfile.create({
            data: {
              userId: user.id,

              displayName:
                `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),

              bio:
                normalizeOptionalString(input.bio),

              color: input.color,

              isOwner: input.isOwner,
              isActive: input.isActive,

              acceptsOnlineBooking:
                input.acceptsOnlineBooking,

              defaultCleanupMinutes:
                input.defaultCleanupMinutes,

              slotIntervalMinutes:
                input.slotIntervalMinutes,

              sortOrder,

              services:
                serviceIds.length > 0
                  ? {
                      create: serviceIds.map(
                        (serviceId, index) => ({
                          serviceId,
                          isActive: true,
                          sortOrder: index,
                        }),
                      ),
                    }
                  : undefined,

              workstationAssignments:
                workstationIds.length > 0
                  ? {
                      create:
                        workstationIds.map(
                          (
                            workstationId,
                            index,
                          ) => ({
                            workstationId,
                            isPrimary:
                              index === 0,
                            isActive: true,
                          }),
                        ),
                    }
                  : undefined,

              workingHours: {
                create:
                  initialWorkingHours,
              },
            },
            select: {
              id: true,
            },
          });

        return staff.id;
      },
    );

  return getTeamMemberById(createdStaffId);
}

/* -------------------------------------------------------------------------- */
/*                              MISE À JOUR                                   */
/* -------------------------------------------------------------------------- */

export async function updateTeamMember(
  rawInput: UpdateTeamMemberInput,
): Promise<TeamMember> {
  const input =
    updateTeamMemberSchema.parse(rawInput);

  const existingStaff =
    await prisma.staffProfile.findUnique({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        userId: true,
        isOwner: true,

        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

  if (!existingStaff) {
    throw new Error(
      "Professionnelle introuvable.",
    );
  }

  const email = normalizeEmail(input.email);

  const serviceIds = normalizeIdList(
    input.serviceIds,
  );

  const workstationIds = normalizeIdList(
    input.workstationIds,
  );

  await Promise.all([
    assertEmailAvailable(
      email,
      existingStaff.userId,
    ),
    assertServicesExist(serviceIds),
    assertWorkstationsExist(workstationIds),
  ]);

  const passwordHash =
    input.password?.trim()
      ? await hash(
          input.password,
          PASSWORD_SALT_ROUNDS,
        )
      : null;

  const nextRole =
    input.isOwner
      ? UserRole.ADMIN
      : UserRole.STAFF;

  const nextStatus =
    input.isActive
      ? UserStatus.ACTIVE
      : UserStatus.DISABLED;

  const shouldInvalidateAuthentication =
    passwordHash !== null ||
    email !== existingStaff.user.email ||
    nextRole !== existingStaff.user.role ||
    nextStatus !== existingStaff.user.status;

  await prisma.$transaction(
    async (transaction) => {
      if (input.isOwner) {
        await transaction.staffProfile.updateMany({
          where: {
            isOwner: true,
            id: {
              not: input.id,
            },
          },
          data: {
            isOwner: false,
          },
        });
      }

      await transaction.user.update({
        where: {
          id: existingStaff.userId,
        },
        data: {
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email,

          phone:
            normalizeOptionalString(input.phone),

          role:
            nextRole,

          status:
            nextStatus,

          ...(passwordHash
            ? {
                passwordHash,
              }
            : {}),

          ...(shouldInvalidateAuthentication
            ? {
                authVersion: {
                  increment: 1,
                },
              }
            : {}),
        },
      });

      await transaction.staffProfile.update({
        where: {
          id: input.id,
        },
        data: {
          displayName:
            `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),

          bio:
            normalizeOptionalString(input.bio),

          color: input.color,

          isOwner: input.isOwner,
          isActive: input.isActive,

          acceptsOnlineBooking:
            input.acceptsOnlineBooking,

          defaultCleanupMinutes:
            input.defaultCleanupMinutes,

          slotIntervalMinutes:
            input.slotIntervalMinutes,
        },
      });

      await transaction.staffService.deleteMany({
        where: {
          staffId: input.id,
        },
      });

      if (serviceIds.length > 0) {
        await transaction.staffService.createMany({
          data: serviceIds.map(
            (serviceId, index) => ({
              staffId: input.id,
              serviceId,
              isActive: true,
              sortOrder: index,
            }),
          ),
        });
      }

      await transaction.staffWorkstation.deleteMany({
        where: {
          staffId: input.id,
        },
      });

      if (workstationIds.length > 0) {
        await transaction.staffWorkstation.createMany({
          data: workstationIds.map(
            (workstationId, index) => ({
              staffId: input.id,
              workstationId,
              isPrimary: index === 0,
              isActive: true,
            }),
          ),
        });
      }

      /*
       * Le patron ne doit avoir aucune pause.
       *
       * Lorsqu'une professionnelle devient patronne,
       * toutes ses pauses hebdomadaires sont supprimées.
       */
      if (
        input.isOwner &&
        !existingStaff.isOwner
      ) {
        await transaction.staffWorkingHour.updateMany({
          where: {
            staffId: input.id,
          },
          data: {
            hasBreak: false,
            breakStart: null,
            breakEnd: null,
          },
        });

        await transaction.staffWorkingHourOverride.updateMany({
          where: {
            staffId: input.id,
          },
          data: {
            hasBreak: false,
            breakStart: null,
            breakEnd: null,
          },
        });
      }
    },
  );

  return getTeamMemberById(input.id);
}

/* -------------------------------------------------------------------------- */
/*                         ACTIVATION / DÉSACTIVATION                          */
/* -------------------------------------------------------------------------- */

export async function setTeamMemberActive(
  id: string,
  isActive: boolean,
): Promise<TeamMember> {
  const cleanId = id.trim();

  const staff =
    await prisma.staffProfile.findUnique({
      where: {
        id: cleanId,
      },
      select: {
        id: true,
        userId: true,

        user: {
          select: {
            status: true,
          },
        },
      },
    });

  if (!staff) {
    throw new Error(
      "Professionnelle introuvable.",
    );
  }

  const nextStatus =
    isActive
      ? UserStatus.ACTIVE
      : UserStatus.DISABLED;

  const shouldInvalidateAuthentication =
    staff.user.status !==
    nextStatus;

  await prisma.$transaction([
    prisma.staffProfile.update({
      where: {
        id: staff.id,
      },
      data: {
        isActive,
        acceptsOnlineBooking: isActive
          ? undefined
          : false,
      },
    }),

    prisma.user.update({
      where: {
        id: staff.userId,
      },
      data: {
        status:
          nextStatus,

        ...(shouldInvalidateAuthentication
          ? {
              authVersion: {
                increment: 1,
              },
            }
          : {}),
      },
    }),
  ]);

  return getTeamMemberById(staff.id);
}

/* -------------------------------------------------------------------------- */
/*                                RÉORDONNEMENT                               */
/* -------------------------------------------------------------------------- */

export async function reorderTeamMembers(
  orderedIds: string[],
): Promise<TeamMemberListResponse> {
  const ids = normalizeIdList(orderedIds);

  if (ids.length === 0) {
    throw new Error(
      "La liste des professionnelles est vide.",
    );
  }

  const existingCount =
    await prisma.staffProfile.count({
      where: {
        id: {
          in: ids,
        },
      },
    });

  if (existingCount !== ids.length) {
    throw new Error(
      "Une ou plusieurs professionnelles sont introuvables.",
    );
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.staffProfile.update({
        where: {
          id,
        },
        data: {
          sortOrder: index,
        },
      }),
    ),
  );

  return getTeamMembers({
    filters: {
      search: "",
      activeOnly: false,
      onlineBookingOnly: false,
      includeOwner: true,
    },
    sortField: "displayName",
    sortDirection: "asc",
  });
}

/* -------------------------------------------------------------------------- */
/*                                  SUPPRESSION                               */
/* -------------------------------------------------------------------------- */

export async function deleteTeamMember(
  id: string,
): Promise<{
  deleted: boolean;
  deactivated: boolean;
}> {
  const cleanId = id.trim();

  if (!cleanId) {
    throw new Error(
      "Identifiant de la professionnelle manquant.",
    );
  }

  const staff =
    await prisma.staffProfile.findUnique({
      where: {
        id: cleanId,
      },
      select: {
        id: true,
        userId: true,
        isOwner: true,

        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

  if (!staff) {
    throw new Error(
      "Professionnelle introuvable.",
    );
  }

  if (staff.isOwner) {
    throw new Error(
      "Le compte propriétaire ne peut pas être supprimé. Désactivez-le ou désignez d'abord une autre propriétaire.",
    );
  }

  /*
   * Lorsque des rendez-vous existent, on conserve le compte
   * afin de préserver l'historique et les relations Prisma.
   */
  if (staff._count.appointments > 0) {
    await prisma.$transaction([
      prisma.staffProfile.update({
        where: {
          id: staff.id,
        },
        data: {
          isActive: false,
          acceptsOnlineBooking: false,
        },
      }),

      prisma.user.update({
        where: {
          id: staff.userId,
        },
        data: {
          status:
            UserStatus.DISABLED,

          authVersion: {
            increment: 1,
          },
        },
      }),
    ]);

    return {
      deleted: false,
      deactivated: true,
    };
  }

  /*
   * La suppression du User supprime automatiquement le
   * StaffProfile et ses dépendances grâce aux onDelete Cascade.
   */
  await prisma.user.delete({
    where: {
      id: staff.userId,
    },
  });

  return {
    deleted: true,
    deactivated: false,
  };
}
