import { Role } from "./auth";
import prisma from "./prisma";

interface CreateAuditLogParams {
  actorId?: string | null;
  actorRole: Role;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Creates an immutable audit log entry in the database.
 * Designed to swallow logging exceptions to prevent crashing the caller workflow,
 * but prints error to standard output.
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        actorRole: params.actorRole,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        metadata: params.metadata || {},
      },
    });
  } catch (error) {
    console.error("CRITICAL: Failed to write to audit log:", error);
  }
}
