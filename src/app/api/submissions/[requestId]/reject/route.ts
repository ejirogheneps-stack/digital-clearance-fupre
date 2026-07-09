import { NextResponse } from "next/server";
import { Role, ClearanceStatus } from "@/lib/auth";
import { requireUnitAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await props.params;

    // 1. Parse body and validate rejectionNote
    const body = await req.json();
    const { rejectionNote } = body;

    if (!rejectionNote || typeof rejectionNote !== "string" || rejectionNote.trim().length === 0) {
      return NextResponse.json(
        { error: "Bad Request: A rejection feedback note is required." },
        { status: 400 }
      );
    }

    // 2. Fetch the request to verify unit ID
    const clearanceRequest = await prisma.clearanceRequest.findUnique({
      where: { id: requestId },
      include: {
        clearingUnit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!clearanceRequest) {
      return NextResponse.json(
        { error: "Clearance request not found." },
        { status: 404 }
      );
    }

    // 3. Unit-level access check
    const { user, errorResponse } = await requireUnitAccess(
      req,
      clearanceRequest.unitId
    );
    if (errorResponse) return errorResponse;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 4. Update request status to REJECTED in transaction
    const updatedRequest = await prisma.$transaction(async (tx) => {
      const updated = await tx.clearanceRequest.update({
        where: { id: requestId },
        data: {
          status: ClearanceStatus.REJECTED,
          reviewedAt: new Date(),
          reviewedBy: user.userId,
          rejectionNote: rejectionNote.trim(),
        },
      });

      // Notify Student
      await tx.notification.create({
        data: {
          userId: clearanceRequest.studentId,
          type: "STATUS_CHANGE",
          message: `Your clearance request for ${clearanceRequest.clearingUnit.name} has been REJECTED. Reason: "${rejectionNote.trim()}"`,
        },
      });

      return updated;
    });

    // 5. Audit Log
    await createAuditLog({
      actorId: user.userId,
      actorRole: user.role as Role,
      action: "REJECT_CLEARANCE_REQUEST",
      entityType: "ClearanceRequest",
      entityId: updatedRequest.id,
      metadata: {
        studentId: clearanceRequest.studentId,
        unitId: clearanceRequest.unitId,
        unitName: clearanceRequest.clearingUnit.name,
        reason: rejectionNote.trim(),
      },
    });

    return NextResponse.json({
      message: "Clearance request rejected successfully.",
      clearanceRequest: updatedRequest,
    });
  } catch (error) {
    console.error("Reject clearance request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
