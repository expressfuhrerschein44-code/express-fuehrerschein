import { redirect } from "next/navigation";

import { AdminApplicationsPage } from "@/components/admin/applications/admin-applications-page";
import {
  AdminApplicationsServiceError,
  getAdminApplicationsPageData,
} from "@/lib/server/admin/applications/admin-applications-service";
import { parseAdminApplicationsQueryRecord } from "@/lib/server/admin/applications/admin-applications-validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminApplicationsRouteProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminApplicationsRoute({
  searchParams,
}: AdminApplicationsRouteProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = parseAdminApplicationsQueryRecord(resolvedSearchParams);

  try {
    const data = await getAdminApplicationsPageData(query);
    return <AdminApplicationsPage data={data} />;
  } catch (error) {
    if (
      error instanceof AdminApplicationsServiceError &&
      error.code === "UNAUTHENTICATED"
    ) {
      redirect("/admin/login");
    }

    throw error;
  }
}
