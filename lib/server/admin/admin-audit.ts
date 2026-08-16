import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  prisma,
} from "@/lib/server/prisma";

export async function writeAdminAuditLog(
  input: {
    adminId?: string | null;
    targetUserId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    metadata?: Prisma.InputJsonValue;
    ipHash?: string | null;
    userAgent?: string | null;
  },
): Promise<void> {
  try {
    await prisma.admin_audit_logs.create({
      data: {
        admin_id:
          input.adminId ??
          null,
        target_user_id:
          input.targetUserId ??
          null,
        action:
          input.action
            .trim()
            .slice(
              0,
              80,
            ),
        entity_type:
          input.entityType
            .trim()
            .slice(
              0,
              64,
            ),
        entity_id:
          input.entityId
            ?.trim()
            .slice(
              0,
              128,
            ) ??
          null,
        metadata:
          input.metadata,
        ip_hash:
          input.ipHash ??
          null,
        user_agent:
          input.userAgent
            ?.slice(
              0,
              512,
            ) ??
          null,
      },
    });
  } catch (
    error
  ) {
    console.error(
      "[ADMIN_AUDIT_WRITE_ERROR]",
      error,
    );
  }
}
