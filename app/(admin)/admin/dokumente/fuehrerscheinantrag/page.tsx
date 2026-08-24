import type {
  Metadata,
} from "next";

import {
  DrivingLicenseDocumentBuilder,
} from "@/components/admin/documents/driving-license-document-builder";

export const metadata: Metadata = {
  title:
    "Fahrerlaubnis-Dokument erstellen",
};

export default function DrivingLicenseDocumentPage() {
  return (
    <DrivingLicenseDocumentBuilder />
  );
}