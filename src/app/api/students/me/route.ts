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

    // 2. Fetch Profile details
    const studentProfile = await prisma.student.findUnique({
      where: { userId: user.userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: studentProfile.userId,
      name: studentProfile.user.name,
      email: studentProfile.user.email,
      phone: studentProfile.user.phone,
      matricNumber: studentProfile.matricNumber,
      department: studentProfile.department,
      faculty: studentProfile.faculty,
      level: studentProfile.level,
      sessionOfGraduation: studentProfile.sessionOfGraduation,
      profilePhotoUrl: studentProfile.profilePhotoUrl,
      createdAt: studentProfile.user.createdAt,
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
