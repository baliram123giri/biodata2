import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { uploadToVPS, deleteFromVPS } from "@/lib/vps-upload";

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as any) || null;
}

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-vps-upload-secret");
    const isAuthorizedSecret = secret && secret === process.env.NEXTAUTH_SECRET;

    if (!isAuthorizedSecret) {
      const sessionUser = await getSessionUser();
      if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { file, folder } = body;

    if (!file) {
      return NextResponse.json({ error: "Missing file parameter" }, { status: 400 });
    }

    // Determine the folder path safely
    let targetFolder = folder || "blog";
    if (!targetFolder.startsWith("matrimonial/") && !targetFolder.startsWith("biodata/")) {
      targetFolder = `matrimonial/${targetFolder}`;
    }

    const secureUrl = await uploadToVPS(file, targetFolder);

    return NextResponse.json({ success: true, url: secureUrl });
  } catch (error: any) {
    console.error("Upload image error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const secret = req.headers.get("x-vps-upload-secret");
    const isAuthorizedSecret = secret && secret === process.env.NEXTAUTH_SECRET;

    if (!isAuthorizedSecret) {
      const sessionUser = await getSessionUser();
      if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "superadmin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    await deleteFromVPS(url);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete image error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
