import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminPraxisDetailPage,
} from "@/components/admin/praxis/admin-praxis-detail-page";

import {
  AdminPraxisServiceError,
  getAdminPraxisAppointment,
  getAdminPraxisPageData,
} from "@/lib/server/admin/praxis/admin-praxis-service";

type PageProps = {
  params:
    Promise<{
      appointmentId:
        string;
    }>;
};

async function loadDetail(
  appointmentId:
    string,
) {
  try {
    const [
      appointment,
      pageData,
    ] =
      await Promise.all([
        getAdminPraxisAppointment(
          appointmentId,
        ),
        getAdminPraxisPageData(),
      ]);

    return {
      appointment,
      clients:
        pageData.clients,
      error:
        null,
    };
  } catch (
    error
  ) {
    return {
      appointment:
        null,
      clients:
        [],
      error,
    };
  }
}

export default async function PraxisDetailPage({
  params,
}: PageProps) {
  const {
    appointmentId,
  } =
    await params;

  const result =
    await loadDetail(
      appointmentId,
    );

  if (
    result.error instanceof
      AdminPraxisServiceError
  ) {
    if (
      result.error.code ===
      "UNAUTHENTICATED"
    ) {
      redirect(
        "/admin/login",
      );
    }

    if (
      result.error.code ===
      "NOT_FOUND"
    ) {
      notFound();
    }
  }

  if (
    result.error
  ) {
    throw result.error;
  }

  if (
    !result.appointment
  ) {
    notFound();
  }

  return (
    <AdminPraxisDetailPage
      appointment={
        result.appointment
      }
      clients={
        result.clients
      }
    />
  );
}
