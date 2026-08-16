/**
 * Express-Führerschein
 * GET /api/admin/payments/[paymentId]/proof
 * Redirects an authenticated admin to a short-lived private Supabase URL.
 */

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getAdminPaymentProofUrl,
  AdminPaymentsServiceError,
} from "@/lib/server/admin/payments/admin-payments-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    const signedUrl = await getAdminPaymentProofUrl(paymentId);

    return NextResponse.redirect(signedUrl, {
      status: 307,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    if (error instanceof AdminPaymentsServiceError) {
      return NextResponse.json(
        {
          ok: false,
          code: error.code,
          message: error.message,
        },
        {
          status: error.status,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        },
      );
    }

    console.error(
      "[Express-Führerschein] admin payment proof failed",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "La preuve de paiement ne peut pas être ouverte pour le moment.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
