import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  PaymentsServiceError,
  submitPaymentProof,
} from "@/lib/server/payments/payments-service";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function noStoreHeaders():
  Record<string, string> {
  return {
    "Cache-Control":
      "private, no-store, max-age=0",
  };
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params:
      Promise<{
        paymentId: string;
      }>;
  },
) {
  try {
    const {
      paymentId:
        rawPaymentId,
    } =
      await params;

    const paymentId =
      decodeURIComponent(
        rawPaymentId,
      ).trim();

    if (!paymentId) {
      return NextResponse.json(
        {
          ok:
            false,
          error: {
            code:
              "PAYMENT_ID_REQUIRED",
            message:
              "paymentId fehlt.",
          },
        },
        {
          status:
            400,
          headers:
            noStoreHeaders(),
        },
      );
    }

    const session =
      await requireClientSession();

    const formData =
      await request.formData();

    const proof =
      formData.get(
        "proof",
      );

    if (
      !(proof instanceof File)
    ) {
      return NextResponse.json(
        {
          ok:
            false,
          error: {
            code:
              "PAYMENT_PROOF_REQUIRED",
            message:
              "Bitte wähle einen Zahlungsnachweis aus.",
          },
        },
        {
          status:
            400,
          headers:
            noStoreHeaders(),
        },
      );
    }

    const bytes =
      new Uint8Array(
        await proof.arrayBuffer(),
      );

    const data =
      await submitPaymentProof({
        userId:
          session.user.id,
        paymentId,
        originalFilename:
          proof.name,
        mimeType:
          proof.type,
        bytes,
      });

    return NextResponse.json(
      {
        ok:
          true,
        data,
      },
      {
        status:
          201,
        headers:
          noStoreHeaders(),
      },
    );
  } catch (
    error
  ) {
    if (
      error instanceof
      PaymentsServiceError
    ) {
      return NextResponse.json(
        {
          ok:
            false,
          error: {
            code:
              error.code,
            message:
              error.message,
          },
        },
        {
          status:
            error.status,
          headers:
            noStoreHeaders(),
        },
      );
    }

    console.error(
      "[PAYMENT_PROOF_POST_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,
        error: {
          code:
            "PAYMENT_PROOF_UPLOAD_FAILED",
          message:
            "Der Zahlungsnachweis konnte nicht eingereicht werden.",
        },
      },
      {
        status:
          500,
        headers:
          noStoreHeaders(),
      },
    );
  }
}
