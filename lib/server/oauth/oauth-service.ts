/**
 * Express-Führerschein
 * OAuth account resolution and safe linking.
 */

import { oauthAccountRepository } from "@/lib/server/repositories/oauth-account-repository";
import { userRepository } from "@/lib/server/repositories/user-repository";
import type { UserRecord } from "@/lib/server/repositories/user-repository";
import type { GoogleIdentity } from "@/lib/server/oauth/google-oauth";
import type { AppleIdentity } from "@/lib/server/oauth/apple-oauth";

export type OAuthIdentity = GoogleIdentity | AppleIdentity;

export interface OAuthAuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: UserRecord["countryCode"];
}

export type OAuthServiceResult =
  | {
      status: "authenticated";
      user: OAuthAuthenticatedUser;
      linked: boolean;
    }
  | {
      status: "profile_required";
      identity: {
        provider: OAuthIdentity["provider"];
        providerAccountId: string;
        email: string;
      };
    };

export class OAuthServiceError extends Error {
  constructor(
    public readonly code:
      | "ACCOUNT_DISABLED"
      | "OAUTH_LINK_CONFLICT"
      | "OAUTH_USER_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "OAuthServiceError";
  }
}

function toAuthenticatedUser(user: UserRecord): OAuthAuthenticatedUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    countryCode: user.countryCode,
  };
}

function assertAllowed(user: UserRecord): void {
  if (user.status === "disabled") {
    throw new OAuthServiceError(
      "ACCOUNT_DISABLED",
      "Dieses Konto ist derzeit deaktiviert.",
    );
  }
}

export async function resolveOAuthIdentity(
  identity: OAuthIdentity,
): Promise<OAuthServiceResult> {
  const providerLink = await oauthAccountRepository.findByProviderAccount(
    identity.provider,
    identity.providerAccountId,
  );

  if (providerLink) {
    const linkedUser = await userRepository.findById(providerLink.userId);
    if (!linkedUser) {
      throw new OAuthServiceError(
        "OAUTH_USER_NOT_FOUND",
        "Das verknüpfte Benutzerkonto wurde nicht gefunden.",
      );
    }

    assertAllowed(linkedUser);
    const activeUser =
      linkedUser.status === "active"
        ? linkedUser
        : await userRepository.activate(linkedUser.id);

    if (!activeUser) {
      throw new OAuthServiceError(
        "OAUTH_USER_NOT_FOUND",
        "Das Benutzerkonto konnte nicht aktiviert werden.",
      );
    }

    return {
      status: "authenticated",
      user: toAuthenticatedUser(activeUser),
      linked: false,
    };
  }

  const user = await userRepository.findByEmail(identity.email);
  if (user) {
    assertAllowed(user);

    const existingForUser = await oauthAccountRepository.findByUserAndProvider(
      user.id,
      identity.provider,
    );

    if (
      existingForUser &&
      existingForUser.providerAccountId !== identity.providerAccountId
    ) {
      throw new OAuthServiceError(
        "OAUTH_LINK_CONFLICT",
        "Dieses Benutzerkonto ist bereits mit einem anderen Anbieter-Konto verknüpft.",
      );
    }

    if (!existingForUser) {
      await oauthAccountRepository.create({
        userId: user.id,
        provider: identity.provider,
        providerAccountId: identity.providerAccountId,
        email: identity.email,
      });
    }

    const activeUser =
      user.status === "active" ? user : await userRepository.activate(user.id);

    if (!activeUser) {
      throw new OAuthServiceError(
        "OAUTH_USER_NOT_FOUND",
        "Das Benutzerkonto konnte nicht aktiviert werden.",
      );
    }

    return {
      status: "authenticated",
      user: toAuthenticatedUser(activeUser),
      linked: !existingForUser,
    };
  }

  // New Google/Apple users still need country + telephone because the current
  // user schema requires those fields. The callback can send them to a secure
  // profile-completion step instead of creating an incomplete account.
  return {
    status: "profile_required",
    identity: {
      provider: identity.provider,
      providerAccountId: identity.providerAccountId,
      email: identity.email,
    },
  };
}
