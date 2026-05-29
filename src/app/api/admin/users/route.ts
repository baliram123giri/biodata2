import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiCache, TTL } from "@/lib/api-cache";
import { hashPassword } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await apiCache.remember("admin:users", TTL.MEDIUM, () =>
      prisma.user.findMany({
        where: { role: { not: "superadmin" } },
        orderBy: { createdAt: "desc" },
      })
    );

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("List users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only superadmin can create users and assign roles!
    if (sessionUser.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden: Only Super Admins can create users and assign roles" }, { status: 403 });
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        role,
        status: "active"
      }
    });

    // Bust users cache so next GET reflects the new user
    apiCache.invalidate("admin:users");

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
