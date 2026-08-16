import {
  notFound,
} from "next/navigation";

import {
  AdminCustomerDetailPage,
} from "@/components/admin/customers/admin-customer-detail-page";

import {
  AdminCustomersServiceError,
  getAdminCustomerDetail,
} from "@/lib/server/admin/customers/admin-customers-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminCustomerPage({
  params,
}: PageProps) {
  const { userId } = await params;

  try {
    const data = await getAdminCustomerDetail(userId);
    return <AdminCustomerDetailPage data={data} />;
  } catch (error) {
    if (
      error instanceof AdminCustomersServiceError &&
      error.code === "NOT_FOUND"
    ) {
      notFound();
    }

    throw error;
  }
}
