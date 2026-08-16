/**
 * Express-Führerschein
 * GET/PATCH /api/admin/payments/[paymentId]
 */

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  activatePaymentFromAdmin,
  cancelPaymentFromAdmin,
  confirmPaymentFromAdmin,
  getAdminPaymentDetail,
  rejectPaymentFromAdmin,
  startPaymentReviewFromAdmin,
  updatePaymentFromAdmin,
  AdminPaymentsServiceError,
} from "@/lib/server/admin/payments/admin-payments-service";

import {
  AdminPaymentValidationError,
  assertSameOrigin,
  getRequestAuditContext,
  parseAdminPaymentAction,
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
    "[Express-Führerschein] admin payment mutation failed",
    error,
  );

  return json(
    {
      ok: false,
      code: "INTERNAL_ERROR",
      message:
        "L’action sur le paiement ne peut pas être exécutée pour le moment.",
    },
    500,
  );
}

interface RouteContext {
  params: Promise<{
    paymentId: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { paymentId } = await context.params;
    const payment = await getAdminPaymentDetail(paymentId);

    return json<AdminPaymentDetail>({
      ok: true,
      data: payment,
      message: "Paiement chargé.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    assertSameOrigin(request);

    const { paymentId } = await context.params;
    let rawBody: unknown;

    try {
      rawBody = await request.json();
    } catch {
      throw new AdminPaymentValidationError(
        "Les données envoyées sont invalides.",
      );
    }

    const mutation = parseAdminPaymentAction(rawBody);
    const audit = getRequestAuditContext(request);
    let payment: AdminPaymentDetail;
    let message: string;

    switch (mutation.action) {
      case "update":
        payment = await updatePaymentFromAdmin({
          paymentId,
          rawInput: mutation.data,
          audit,
        });
        message = "Le brouillon a été mis à jour.";
        break;

      case "activate":
        payment = await activatePaymentFromAdmin({
          paymentId,
          audit,
        });
        message =
          "Le paiement est maintenant visible dans l’espace client.";
        break;

      case "start_review":
        payment = await startPaymentReviewFromAdmin({
          paymentId,
          audit,
        });
        message = "La vérification du paiement a commencé.";
        break;

      case "confirm":
        payment = await confirmPaymentFromAdmin({
          paymentId,
          audit,
        });
        message = "Le paiement a été confirmé.";
        break;

      case "reject":
        payment = await rejectPaymentFromAdmin({
          paymentId,
          reason: mutation.reason ?? "",
          audit,
        });
        message = "Le paiement a été refusé.";
        break;

      case "cancel":
        payment = await cancelPaymentFromAdmin({
          paymentId,
          reason: mutation.reason,
          audit,
        });
        message = "Le paiement a été annulé.";
        break;
    }

    return json<AdminPaymentDetail>({
      ok: true,
      data: payment,
      message,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
