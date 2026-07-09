import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Role, ClearanceStatus } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

const studentRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format").refine(
    (val) => val.endsWith("@fupre.edu.ng"),
    { message: "Must be a valid FUPRE institutional email address (@fupre.edu.ng)." }
  ),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z.string().optional(),
  matricNumber: z.string().min(3, "Matriculation number is required"),
  department: z.string().min(2, "Department is required"),
  faculty: z.string().min(2, "Faculty is required"),
  level: z.string().min(2, "Level is required"),
  sessionOfGraduation: z.string().min(4, "Graduation session is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate Input
    const parsed = studentRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      phone,
      matricNumber,
      department,
      faculty,
      level,
      sessionOfGraduation,
    } = parsed.data;

    // 2. Check if Email or Matric Number already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    const existingStudent = await prisma.student.findUnique({
      where: { matricNumber },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Matric number is already registered" },
        { status: 400 }
      );
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. DB Transaction to create User, Student, and Clearance Requests
    const result = await prisma.$transaction(async (tx) => {
      // Create User
      const user = await tx.user.create({
        data: {
          email,
          hashedPassword,
          name,
          role: Role.STUDENT,
          phone,
        },
      });

      // Create Student
      const student = await tx.student.create({
        data: {
          userId: user.id,
          matricNumber,
          department,
          faculty,
          level,
          sessionOfGraduation,
        },
      });

      // Query active Clearing Units
      const activeUnits = await tx.clearingUnit.findMany({
        where: { isActive: true },
      });

      // Pre-initialize Clearance Requests
      if (activeUnits.length > 0) {
        await tx.clearanceRequest.createMany({
          data: activeUnits.map((unit) => ({
            studentId: user.id,
            unitId: unit.id,
            status: ClearanceStatus.NOT_SUBMITTED,
          })),
        });
      }

      return { user, student };
    });

    // 5. Create Audit Log Entry
    await createAuditLog({
      actorId: result.user.id,
      actorRole: Role.STUDENT,
      action: "REGISTER_STUDENT",
      entityType: "User",
      entityId: result.user.id,
      metadata: {
        email: result.user.email,
        matricNumber: result.student.matricNumber,
      },
    });

    // Mock verification link
    console.log(`[MOCK EMAIL VERIFICATION] Verification link for student ${result.user.email}: ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=mock-token-${result.user.id}`);

    return NextResponse.json(
      {
        message: "Registration successful. Please verify your email.",
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
