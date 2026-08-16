import {
  AdminCustomersPage,
} from "@/components/admin/customers/admin-customers-page";

import {
  getAdminCustomersPageData,
} from "@/lib/server/admin/customers/admin-customers-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
};

export default async function AdminKundenPage({
  searchParams,
}: PageProps) {
  const query = await searchParams;
  const data = await getAdminCustomersPageData(query);

  return <AdminCustomersPage data={data} />;
}
