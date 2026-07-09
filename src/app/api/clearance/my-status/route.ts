import { NextResponse } from "next/server";
import { Role } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // 1. Authenticate & Require Student Role
    const { user, errorResponse } = await requireRole(req, [Role.STUDENT]);
    if (errorResponse) return errorResponse;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch all clearance requests for the student
    const requests = await prisma.clearanceRequest.findMany({
      where: { studentId: user.userId },
      include: {
        clearingUnit: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        documents: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: {
        clearingUnit: {
          name: "asc",
        },
      },
    });

    // Check if requests exist. If not, maybe initialize them if clearing units exist
    if (requests.length === 0) {
      const activeUnits = await prisma.clearingUnit.findMany({
        where: { isActive: true },
      });

      if (activeUnits.length > 0) {
        await prisma.clearanceRequest.createMany({
          data: activeUnits.map((unit) => ({
            studentId: user.userId,
            unitId: unit.id,
            status: "NOT_SUBMITTED",
          })),
        });

        // Re-fetch
        return GET(req);
      }
    }

    return NextResponse.json({
      clearanceRequests: requests,
    });
  } catch (error) {
    console.error("Fetch clearance status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
