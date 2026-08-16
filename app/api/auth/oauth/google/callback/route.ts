import {
  NextRequest,
  NextResponse,
} from "next/server";

import { LOGIN_ROUTES } from "@/data/login";
import { getAuthPublicOrigin } from "@/lib/server/auth-origin";
import { issueAuthSession } from "@/lib/server/auth-session";
import { authenticateGoogleAuthorizationCode } from "@/lib/server/oauth/google-oauth";
import { resolveOAuthIdentity } from "@/lib/server/oauth/oauth-service";
import { consumeOAuthTransaction } from "@/lib/server/oauth/oauth-state";

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
  if (
    request.nextUrl.searchParams.get(
      "error",
    )
  ) {
    return NextResponse.redirect(
      loginErrorUrl(
        request,
        "oauth_cancelled",
      ),
      302,
    );
  }

  const state =
    request.nextUrl.searchParams.get(
      "state",
    );

  const code =
    request.nextUrl.searchParams.get(
      "code",
    );

  if (
    !state ||
    !code
  ) {
    return NextResponse.redirect(
      loginErrorUrl(
        request,
        "oauth_state",
      ),
      302,
    );
  }

  const transaction =
    await consumeOAuthTransaction(
      "google",
      state,
    );

  if (!transaction) {
    return NextResponse.redirect(
      loginErrorUrl(
        request,
        "oauth_state",
      ),
      302,
    );
  }

  try {
    const identity =
      await authenticateGoogleAuthorizationCode({
        code,
        codeVerifier:
          transaction.codeVerifier,
        nonce:
          transaction.nonce,
        request,
      });

    const resolution =
      await resolveOAuthIdentity(
        identity,
      );

    if (
      resolution.status ===
      "profile_required"
    ) {
      return NextResponse.redirect(
        loginErrorUrl(
          request,
          "oauth_profile_required",
        ),
        302,
      );
    }

    await issueAuthSession(
      resolution.user.id,
    );

    return NextResponse.redirect(
      new URL(
        transaction.returnTo,
        getAuthPublicOrigin(
          request,
        ),
      ),
      302,
    );
  } catch (error) {
    console.error(
      "[Express-Führerschein] Google OAuth callback failed",
      error,
    );

    return NextResponse.redirect(
      loginErrorUrl(
        request,
        "oauth_exchange",
      ),
      302,
    );
  }
}
