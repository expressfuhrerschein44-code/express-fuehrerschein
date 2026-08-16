import {
  NextRequest,
  NextResponse,
} from "next/server";

import { LOGIN_ROUTES } from "@/data/login";
import { getAuthPublicOrigin } from "@/lib/server/auth-origin";
import { issueAuthSession } from "@/lib/server/auth-session";
import { authenticateAppleAuthorizationCode } from "@/lib/server/oauth/apple-oauth";
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

/**
 * Apple is configured with response_mode=form_post,
 * therefore this callback intentionally uses POST.
 */
export async function POST(
  request: NextRequest,
) {
  let form: FormData;

  try {
    form =
      await request.formData();
  } catch {
    return NextResponse.redirect(
      loginErrorUrl(
        request,
        "oauth_state",
      ),
      302,
    );
  }

  const providerError =
    form.get("error");

  if (
    typeof providerError ===
      "string" &&
    providerError
  ) {
    return NextResponse.redirect(
      loginErrorUrl(
        request,
        "oauth_cancelled",
      ),
      302,
    );
  }

  const stateValue =
    form.get("state");

  const codeValue =
    form.get("code");

  const state =
    typeof stateValue ===
      "string"
      ? stateValue
      : "";

  const code =
    typeof codeValue ===
      "string"
      ? codeValue
      : "";

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
      "apple",
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
      await authenticateAppleAuthorizationCode({
        code,
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
      "[Express-Führerschein] Apple OAuth callback failed",
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
