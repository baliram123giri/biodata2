import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { uploadToVPS } from "@/lib/vps-upload";

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

    const backgrounds = await prisma.background.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, backgrounds });
  } catch (error: any) {
    console.error("Fetch backgrounds error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, file } = body;

    if (!name || !file) {
      return NextResponse.json({ error: "Missing name or file parameter" }, { status: 400 });
    }

    const secureUrl = await uploadToVPS(file, "matrimonial/backgrounds");

    const background = await prisma.background.create({
      data: {
        name,
        url: secureUrl,
      },
    });

    return NextResponse.json({ success: true, background });
  } catch (error: any) {
    console.error("Create background error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
