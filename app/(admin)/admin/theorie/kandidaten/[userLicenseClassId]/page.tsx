import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminTheoryCandidateDetail,
} from "@/components/admin/theory/admin-theory-candidate-detail";

import {
  AdminTheoryServiceError,
  getAdminTheoryCandidateDetail,
} from "@/lib/server/admin/theory/admin-theory-service";

type Props = {
  params: Promise<{
    userLicenseClassId: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { userLicenseClassId } =
    await params;

  try {
    const candidate =
      await getAdminTheoryCandidateDetail(userLicenseClassId);

    return (
      <AdminTheoryCandidateDetail
        candidate={candidate}
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
