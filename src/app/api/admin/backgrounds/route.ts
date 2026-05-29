import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import cloudinary from "@/lib/cloudinary";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

async function uploadToCloudinary(fileStr: string, folder: string): Promise<string> {
  try {
    const options = {
      folder: `matrimonial/${folder}`,
      resource_type: "auto" as const,
    };
    const uploadRes = await cloudinary.uploader.upload(fileStr, options);
    return uploadRes.secure_url;
  } catch (error) {
    console.error(`Cloudinary upload error [${folder}]:`, error);
    throw new Error("Failed to upload asset to Cloudinary");
  }
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

    const secureUrl = await uploadToCloudinary(file, "backgrounds");

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
