import {
  AdminDashboard,
} from "@/components/admin/dashboard/admin-dashboard";

import {
  requireAdminSession,
} from "@/lib/server/admin/admin-auth";

import {
  getAdminDashboardData,
} from "@/lib/server/admin/admin-repository";

export const dynamic =
  "force-dynamic";

export default async function AdminDashboardPage() {
  const session =
    await requireAdminSession();

  const data =
    await getAdminDashboardData(
      session.admin.id,
    );

  return (
    <AdminDashboard
      admin={
        session.admin
      }
      data={
        data
      }
    />
  );
}
