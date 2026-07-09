import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshTokenCookie = cookieStore.get("refreshToken");

    if (!refreshTokenCookie || !refreshTokenCookie.value) {
      return NextResponse.json(
        { error: "Unauthorized: Missing refresh token." },
        { status: 401 }
      );
    }

    const token = refreshTokenCookie.value;
    const payload = await verifyRefreshToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired refresh token." },
        { status: 401 }
      );
    }

    // Verify user is still active in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, deletedAt: true },
    });

    if (!user || user.deletedAt !== null) {
      return NextResponse.json(
        { error: "Unauthorized: User account is inactive or deleted." },
        { status: 401 }
      );
    }

    // Prepare token payloads
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Rotate refresh token (Generate new access and refresh tokens)
    const newAccessToken = await signAccessToken(tokenPayload);
    const newRefreshToken = await signRefreshToken(tokenPayload);

    // Set new refresh token in HTTP-only cookie
    cookieStore.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return NextResponse.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
