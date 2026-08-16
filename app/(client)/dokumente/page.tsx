import {
  DocumentsPage,
} from "@/components/documents/documents-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getDocumentsPageData,
} from "@/lib/server/documents/documents-service";

export const dynamic =
  "force-dynamic";

export default async function DokumentePage() {
  const session =
    await requireClientSession();

  const data =
    await getDocumentsPageData({
      userId:
        session.user.id,
    });

  return (
    <DocumentsPage
      data={
        data
      }
    />
  );
}
