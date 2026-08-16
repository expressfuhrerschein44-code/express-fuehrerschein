import "server-only";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  prisma,
} from "@/lib/server/prisma";

export class PraxisAdminAccessError
  extends Error {
  readonly status:
    number;

  constructor(
    message: string,
    status:
      number,
  ) {
    super(
      message,
    );

    this.name =
      "PraxisAdminAccessError";

    this.status =
      status;
  }
}

function configuredAdminEmails():
  Set<string> {
  const raw =
    process.env
      .PRAXIS_ADMIN_EMAILS
      ?.trim() ??
    "";

  return new Set(
    raw
      .split(",")
      .map(
        (
          value,
        ) =>
          value
            .trim()
            .toLowerCase(),
      )
      .filter(
        Boolean,
      ),
  );
}

export interface PraxisAdminSession {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export async function requirePraxisAdminSession():
  Promise<PraxisAdminSession> {
  const allowedEmails =
    configuredAdminEmails();

  if (
    allowedEmails.size ===
    0
  ) {
    throw new PraxisAdminAccessError(
      "Praxis-Administration ist noch nicht konfiguriert.",
      503,
    );
  }

  const session =
    await requireClientSession();

  const user =
    await prisma.users.findUnique({
      where: {
        id:
          session.user.id,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        status: true,
      },
    });

  if (
    !user ||
    user.status !==
      "active" ||
    !allowedEmails.has(
      user.email
        .trim()
        .toLowerCase(),
    )
  ) {
    throw new PraxisAdminAccessError(
      "Kein Zugriff auf die Praxis-Administration.",
      403,
    );
  }

  return {
    userId:
      user.id,
    email:
      user.email,
    firstName:
      user.first_name,
    lastName:
      user.last_name,
  };
}
