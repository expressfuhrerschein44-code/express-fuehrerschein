import {
  redirect,
} from "next/navigation";

import {
  AdminTheoryPage,
} from "@/components/admin/theory/admin-theory-page";

import {
  AdminTheoryServiceError,
  getAdminTheoryPageData,
} from "@/lib/server/admin/theory/admin-theory-service";

export default async function TheorieAdminPage() {
  try {
    const data =
      await getAdminTheoryPageData();

    return (
      <AdminTheoryPage
        initialData={data}
      />
    );
  } catch (error) {
    if (
      error instanceof AdminTheoryServiceError &&
      error.code === "UNAUTHENTICATED"
    ) {
      redirect("/admin/login");
    }

    throw error;
  }
}
