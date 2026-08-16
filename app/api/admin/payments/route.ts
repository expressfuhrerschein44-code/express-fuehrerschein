/**
 * Express-Führerschein
 * POST /api/admin/payments
 * Create a payment stage for a submitted driving-license application.
 */

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createPaymentFromAdmin,
  AdminPaymentsServiceError,
} from "@/lib/server/admin/payments/admin-payments-service";

import {
  AdminPaymentValidationError,
  assertSameOrigin,
  getRequestAuditContext,
} from "@/lib/server/admin/payments/admin-payments-validation";

import type {
  AdminPaymentApiResponse,
  AdminPaymentDetail,
} from "@/types/admin-payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
} as const;

function json<T>(
  body: AdminPaymentApiResponse<T>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function errorResponse(error: unknown) {
  if (error instanceof AdminPaymentsServiceError) {
    return json(
      {
        ok: false,
        code: error.code,
        message: error.message,
        fields: error.fields,
      },
      error.status,
    );
  }

  if (error instanceof AdminPaymentValidationError) {
    return json(
      {
        ok: false,
        code: error.code,
        message: error.message,
        fields: error.fields,
      },
      error.status,
    );
  }

  console.error(
    "[Express-Führerschein] admin payment create failed",
    error,
  );

  return json(
    {
      ok: false,
      code: "INTERNAL_ERROR",
      message:
        "Le paiement ne peut pas être créé pour le moment.",
    },
    500,
  );
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new AdminPaymentValidationError(
        "Les données envoyées sont invalides.",
      );
    }

    const payment = await createPaymentFromAdmin({
      rawInput: body,
      audit: getRequestAuditContext(request),
    });

    return json<AdminPaymentDetail>(
      {
        ok: true,
        data: payment,
        message:
          payment.status === "awaiting_payment"
            ? "L’étape de paiement a été créée et activée."
            : "L’étape de paiement a été enregistrée en brouillon.",
      },
      201,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
