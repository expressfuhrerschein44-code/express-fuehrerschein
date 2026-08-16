import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminTheoryReportDetail,
} from "@/components/admin/theory/admin-theory-reports-table";

import {
  AdminTheoryServiceError,
  getAdminTheoryReportDetail,
} from "@/lib/server/admin/theory/admin-theory-service";

type Props = {
  params: Promise<{
    reportId: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { reportId } =
    await params;

  try {
    const report =
      await getAdminTheoryReportDetail(reportId);

    return (
      <AdminTheoryReportDetail
        report={report}
      />
    );
  } catch (error) {
    if (
      error instanceof AdminTheoryServiceError &&
      error.code === "UNAUTHENTICATED"
    ) {
      redirect("/admin/login");
    }

    if (
      error instanceof AdminTheoryServiceError &&
      error.code === "NOT_FOUND"
    ) {
      notFound();
    }

    throw error;
  }
}
