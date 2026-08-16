import {
  redirect,
} from "next/navigation";

import {
  AdminPraxisPage,
} from "@/components/admin/praxis/admin-praxis-page";

import {
  AdminPraxisServiceError,
  getAdminPraxisPageData,
} from "@/lib/server/admin/praxis/admin-praxis-service";

async function loadPageData() {
  try {
    return {
      data:
        await getAdminPraxisPageData(),
      error:
        null,
    };
  } catch (
    error
  ) {
    return {
      data:
        null,
      error,
    };
  }
}

export default async function PraxisPage() {
  const result =
    await loadPageData();

  if (
    result.error instanceof
      AdminPraxisServiceError &&
    result.error.code ===
      "UNAUTHENTICATED"
  ) {
    redirect(
      "/admin/login",
    );
  }

  if (
    result.error
  ) {
    throw result.error;
  }

  if (
    !result.data
  ) {
    throw new Error(
      "[Express-Führerschein] Praxis page data missing.",
    );
  }

  return (
    <AdminPraxisPage
      initialData={
        result.data
      }
    />
  );
}
