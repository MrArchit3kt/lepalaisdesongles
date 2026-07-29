import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const staff = await prisma.staffProfile.findMany({
    orderBy: {
      sortOrder: "asc",
    },
    include: {
      user: true,
      services: {
        include: {
          service: true,
        },
      },
      workstationAssignments: {
        include: {
          workstation: {
            include: {
              serviceAssignments: {
                include: {
                  service: true,
                },
              },
            },
          },
        },
      },
    },
  });

  console.log(JSON.stringify(staff, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
