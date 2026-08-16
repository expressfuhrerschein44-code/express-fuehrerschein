import {
  NextRequest,
  NextResponse,
} from "next/server";

import { LOGIN_ROUTES } from "@/data/login";
import {
  getAuthPublicOrigin,
  sanitizeReturnPath,
} from "@/lib/server/auth-origin";
import { createGoogleAuthorizationUrl } from "@/lib/server/oauth/google-oauth";
import { prepareOAuthTransaction } from "@/lib/server/oauth/oauth-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function loginErrorUrl(
  request: NextRequest,
  code: string,
): URL {
  const url =
    new URL(
      LOGIN_ROUTES.login,
      getAuthPublicOrigin(
        request,
      ),
    );

  url.searchParams.set(
    "oauth_error",
    code,
  );

  return url;
}

export async function GET(
  request: NextRequest,
) {
  const returnTo =
    sanitizeReturnPath(
      request.nextUrl.searchParams.get(
        "returnTo",
      ),
      LOGIN_ROUTES.afterLogin,
    );

  try {
    const transaction =
      await prepareOAuthTransaction(
        "google",
        returnTo,
      );

    const authorizationUrl =
      createGoogleAuthorizationUrl({
        state:
          transaction.state,
        nonce:
          transaction.nonce,
        codeChallenge:
          transaction.codeChallenge,
        request,
      });

    return NextResponse.redirect(
      authorizationUrl,
      302,
    );
  } catch (error) {
    console.error(
      "[Express-Führerschein] Google OAuth start failed",
      error,
    );

    return NextResponse.redirect(
      loginErrorUrl(
        request,
        "google_configuration",
      ),
      302,
    );
  }
}
