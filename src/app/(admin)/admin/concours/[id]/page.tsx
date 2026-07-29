import {
  notFound,
} from "next/navigation";

import {
  AdminContestDetails,
} from "@/features/admin/contests/components/admin-contest-details";

import {
  getAdminContestDetails,
} from "@/features/admin/contests/services/admin-contests-management.service";

import {
  requireAdminUser,
} from "@/lib/session";

type AdminContestDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function AdminContestDetailsPage({
  params,
}: AdminContestDetailsPageProps) {
  await requireAdminUser();

  const {
    id,
  } =
    await params;

  const contest =
    await getAdminContestDetails(
      id,
    );

  if (!contest) {
    notFound();
  }

  return (
    <AdminContestDetails
      contest={contest}
    />
  );
}
