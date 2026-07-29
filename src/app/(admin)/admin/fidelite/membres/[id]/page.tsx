import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
} from "lucide-react";

import {
  AdminVipMemberDetails,
} from "@/features/admin/vip/components/admin-vip-member-details";

import {
  getAdminVipMemberDetails,
  getAdminVipMemberManagementOptions,
} from "@/features/admin/vip/services/admin-vip-members.service";

import {
  requireAdminUser,
} from "@/lib/session";

type AdminVipMemberDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function AdminVipMemberDetailsPage({
  params,
}: AdminVipMemberDetailsPageProps) {
  await requireAdminUser();

  const {
    id,
  } =
    await params;

  const [
    member,
    options,
  ] =
    await Promise.all([
      getAdminVipMemberDetails(
        id,
      ),

      getAdminVipMemberManagementOptions(),
    ]);

  if (!member) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/admin/fidelite/membres"
          className="mb-5 inline-flex items-center gap-2 text-sm font-black text-zinc-600 transition hover:text-violet-700"
        >
          <ArrowLeft className="size-4" />

          Retour aux membres VIP
        </Link>

        <AdminVipMemberDetails
          member={member}
          levels={options.levels}
          rewards={options.rewards}
        />
      </div>
    </main>
  );
}
