import { NextResponse } from "next/server";
import { Role } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // 1. Authenticate Admin
    const { user, errorResponse } = await requireRole(req, [Role.ADMIN]);
    if (errorResponse) return errorResponse;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse filter query parameters
    const { searchParams } = new URL(req.url);
    const actorId = searchParams.get("actorId");
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // 3. Build Prisma where conditions
    const whereClause: any = {};

    if (actorId) {
      whereClause.actorId = actorId;
    }

    if (action) {
      whereClause.action = action;
    }

    if (entityType) {
      whereClause.entityType = entityType;
    }

    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) {
        whereClause.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.timestamp.lte = new Date(endDate);
      }
    }

    // 4. Query Database
    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        actor: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 100, // Safety limit
    });

    return NextResponse.json({
      auditLogs: auditLogs.map((log) => ({
        id: log.id,
        actorId: log.actorId,
        actorName: log.actor?.name || "System/Unknown",
        actorEmail: log.actor?.email || "system@fupre.edu.ng",
        actorRole: log.actorRole,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata,
        timestamp: log.timestamp,
      })),
    });
  } catch (error) {
    console.error("Fetch audit logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
