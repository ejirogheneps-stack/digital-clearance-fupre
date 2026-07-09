import { NextResponse } from "next/server";
import { z } from "zod";
import { Role, ClearanceStatus } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

const createUnitSchema = z.object({
  name: z.string().min(2, "Unit name must be at least 2 characters long"),
  description: z.string().optional(),
});

// GET /api/admin/units
export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireRole(req, [Role.ADMIN]);
    if (errorResponse) return errorResponse;

    const units = await prisma.clearingUnit.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ units });
  } catch (error) {
    console.error("Fetch units error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/units
export async function POST(req: Request) {
  try {
    // 1. Authenticate Admin
    const { user, errorResponse } = await requireRole(req, [Role.ADMIN]);
    if (errorResponse) return errorResponse;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate Body
    const body = await req.json();
    const parsed = createUnitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, description } = parsed.data;

    // 3. Check if unit exists
    const existingUnit = await prisma.clearingUnit.findUnique({
      where: { name },
    });

    if (existingUnit) {
      return NextResponse.json(
        { error: "A clearing unit with this name already exists." },
        { status: 400 }
      );
    }

    // 4. Create unit and pre-initialize clearance requests for existing students
    const unit = await prisma.$transaction(async (tx) => {
      const newUnit = await tx.clearingUnit.create({
        data: {
          name,
          description,
        },
      });

      // Get all existing students
      const students = await tx.student.findMany({
        select: { userId: true },
      });

      if (students.length > 0) {
        await tx.clearanceRequest.createMany({
          data: students.map((student) => ({
            studentId: student.userId,
            unitId: newUnit.id,
            status: ClearanceStatus.NOT_SUBMITTED,
          })),
        });
      }

      return newUnit;
    });

    // 5. Audit log
    await createAuditLog({
      actorId: user.userId,
      actorRole: user.role as Role,
      action: "CREATE_CLEARING_UNIT",
      entityType: "ClearingUnit",
      entityId: unit.id,
      metadata: { name: unit.name },
    });

    return NextResponse.json(
      {
        message: "Clearing unit created successfully.",
        unit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create clearing unit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
