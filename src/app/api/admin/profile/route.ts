import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { hashPassword, verifyPassword } from "@/lib/auth";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown Browser";

    return NextResponse.json({ 
      success: true, 
      user,
      sessionMeta: {
        ip,
        userAgent
      }
    });
  } catch (error: any) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    // Fetch full user record to verify password and email
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    // Validate and update name
    if (name) {
      if (name.trim().length < 2) {
        return NextResponse.json({ error: "Name must be at least 2 characters long" }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    // Validate and update email
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      if (existingUser) {
        return NextResponse.json({ error: "Email is already in use by another user" }, { status: 400 });
      }

      updateData.email = email.toLowerCase();
    }

    // Validate and update password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to change password" }, { status: 400 });
      }

      const isCurrentPasswordCorrect = verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordCorrect) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 });
      }

      updateData.password = hashPassword(newPassword);
    }

    // If nothing to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No changes requested" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
