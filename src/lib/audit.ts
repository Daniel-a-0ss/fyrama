import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type LogParams = {
  action: AuditAction;
  userId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  details?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function logAudit(params: LogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        userId: params.userId ?? null,
        entityType: params.entityType ?? null,
        entityId: params.entityId ?? null,
        details: params.details ? JSON.stringify(params.details).slice(0, 4000) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (err) {
    // La auditoría no debe romper la operación principal.
    console.error("[audit]", err);
  }
}