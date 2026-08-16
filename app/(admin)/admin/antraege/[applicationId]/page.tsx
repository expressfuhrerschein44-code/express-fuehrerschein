import { notFound, redirect } from "next/navigation";

import { AdminApplicationDetailPage } from "@/components/admin/applications/admin-application-detail-page";
import {
  AdminApplicationsServiceError,
  getAdminApplicationDetail,
} from "@/lib/server/admin/applications/admin-applications-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminApplicationDetailRouteProps {
  params: Promise<{
    applicationId: string;
  }>;
}

export default async function AdminApplicationDetailRoute({
  params,
}: AdminApplicationDetailRouteProps) {
  const { applicationId } = await params;

  try {
    const application = await getAdminApplicationDetail(applicationId);
    return <AdminApplicationDetailPage application={application} />;
  } catch (error) {
    if (error instanceof AdminApplicationsServiceError) {
      if (error.code === "UNAUTHENTICATED") {
        redirect("/admin/login");
      }

      if (
        error.code === "APPLICATION_NOT_FOUND" ||
        error.code === "VALIDATION_ERROR"
      ) {
        notFound();
      }
    }

    throw error;
  }
}
