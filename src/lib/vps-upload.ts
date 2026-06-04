import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

/**
 * Gets the upload directory path.
 * If LOCAL_UPLOAD is "true" in env, it forces saving in local Next.js public/uploads folder.
 * Otherwise, if UPLOAD_DIR is set in env, it uses that.
 * Next, it checks if "/var/www/biodata99/uploads" exists (VPS environment) and uses it.
 * Otherwise, it falls back to Next.js local "public/uploads" folder for development.
 */
function getUploadDir(): string {
  if (process.env.LOCAL_UPLOAD === "true") {
    return path.join(process.cwd(), "public", "uploads");
  }
  if (process.env.UPLOAD_DIR) {
    return process.env.UPLOAD_DIR;
  }
  if (fs.existsSync("/var/www/biodata99/uploads")) {
    return "/var/www/biodata99/uploads";
  }
  return path.join(process.cwd(), "public", "uploads");
}

/**
 * Uploads a base64 encoded image to the VPS or local directory, compressing PNG/JPEG/JPG/WEBP to WebP.
 * SVGs are kept as SVGs.
 * 
 * @param fileStr Base64 encoded string or raw SVG string
 * @param subFolder Subfolder inside the uploads directory (e.g. "matrimonial/backgrounds")
 * @returns The public URL of the uploaded image
 */
export async function uploadToVPS(fileStr: string, subFolder: string): Promise<string> {
  if (!fileStr) {
    throw new Error("No file content provided");
  }

  const baseUploadDir = getUploadDir();
  
  // Set the base upload URL depending on whether we are testing locally or uploading to the VPS
  const baseUploadUrl = process.env.LOCAL_UPLOAD === "true"
    ? `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/uploads`
    : (process.env.UPLOAD_BASE_URL || "https://biodata99.com/uploads");

  // Proxy to live VPS only if LOCAL_UPLOAD is NOT "true" and we are on Windows (local dev)
  const isLocalDev = process.env.LOCAL_UPLOAD !== "true" && (process.platform === "win32" || !fs.existsSync("/var/www/biodata99/uploads"));
  if (isLocalDev) {
    console.log(`[VPS Upload Proxy] Local development detected. Proxying upload to remote VPS...`);
    try {
      // Direct the API endpoint to the live production server's API
      const apiEndpoint = "https://biodata99.com/api/admin/upload";
      
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-vps-upload-secret": process.env.NEXTAUTH_SECRET || "",
        },
        body: JSON.stringify({
          file: fileStr,
          folder: subFolder,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`VPS server returned status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (result.success && result.url) {
        console.log(`[VPS Upload Proxy] Successfully uploaded to remote VPS: ${result.url}`);
        return result.url;
      } else {
        throw new Error(result.error || "Unknown error during proxy upload");
      }
    } catch (proxyError: any) {
      console.error("[VPS Upload Proxy] Failed to proxy upload to live VPS, falling back to local file write:", proxyError.message);
      // Fall through to local file system write so local dev works offline
    }
  }

  // Normalize subFolder and create destination directory
  const normalizedSubFolder = subFolder.replace(/\\/g, "/");
  const destFolder = path.join(baseUploadDir, ...normalizedSubFolder.split("/"));
  
  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
  }

  let mimeType = "";
  let buffer: Buffer;

  // Parse the input string (base64 data URI, raw SVG, or raw base64)
  if (fileStr.startsWith("data:")) {
    const commaIndex = fileStr.indexOf(",");
    if (commaIndex === -1) {
      throw new Error("Invalid data URI format");
    }
    const header = fileStr.substring(0, commaIndex);
    const data = fileStr.substring(commaIndex + 1);
    
    const mimeMatch = header.match(/data:([^;]+)/);
    mimeType = mimeMatch ? mimeMatch[1] : "";
    
    if (header.includes(";base64")) {
      buffer = Buffer.from(data, "base64");
    } else {
      buffer = Buffer.from(decodeURIComponent(data));
    }
  } else if (fileStr.trim().startsWith("<svg") || fileStr.includes("http://www.w3.org/2000/svg")) {
    mimeType = "image/svg+xml";
    buffer = Buffer.from(fileStr, "utf-8");
  } else {
    // Attempt to parse as raw base64
    buffer = Buffer.from(fileStr, "base64");
    mimeType = "image/png"; // default fallback
  }

  // Server-side Size Validation: Max 5MB
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("File size exceeds 5MB limit");
  }

  // Server-side Format Validation: JPG, JPEG, PNG, WEBP, SVG
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error("Invalid file format. Only JPG, JPEG, PNG, WEBP, and SVG are allowed.");
  }

  const filename = crypto.randomUUID();
  let finalBuffer: Buffer = buffer;
  let extension = "";

  if (mimeType === "image/svg+xml" || mimeType.includes("svg")) {
    extension = ".svg";
    finalBuffer = buffer;
  } else {
    extension = ".webp";
    // Convert and compress to WebP using sharp
    try {
      finalBuffer = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer();
    } catch (sharpError) {
      console.error("[VPS Upload] Sharp compression failed, falling back to raw buffer:", sharpError);
      throw new Error("Failed to process and compress image: " + (sharpError as Error).message);
    }
  }

  const finalFilename = `${filename}${extension}`;
  const destFilePath = path.join(destFolder, finalFilename);

  // Write file to filesystem
  fs.writeFileSync(destFilePath, finalBuffer);
  console.log(`[VPS Upload] Successfully wrote file to: ${destFilePath}`);

  // Return the public URL
  return `${baseUploadUrl}/${normalizedSubFolder}/${finalFilename}`;
}

/**
 * Deletes a file from the VPS uploads folder or local directory
 * @param url The public URL of the file to delete
 */
export async function deleteFromVPS(url: string): Promise<void> {
  if (!url) return;

  const isLocalTesting = process.env.LOCAL_UPLOAD === "true";
  const baseUploadUrl = isLocalTesting
    ? `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/uploads`
    : (process.env.UPLOAD_BASE_URL || "https://biodata99.com/uploads");

  if (!url.startsWith(baseUploadUrl)) {
    console.log(`[VPS Upload] URL is not hosted on uploads destination, skipping deletion: ${url}`);
    return;
  }

  // Proxy to live VPS only if LOCAL_UPLOAD is NOT "true" and we are on Windows (local dev)
  const isLocalDev = process.env.LOCAL_UPLOAD !== "true" && (process.platform === "win32" || !fs.existsSync("/var/www/biodata99/uploads"));
  if (isLocalDev) {
    console.log(`[VPS Upload Proxy] Local development detected. Proxying deletion to remote VPS...`);
    try {
      const apiEndpoint = `https://biodata99.com/api/admin/upload?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiEndpoint, {
        method: "DELETE",
        headers: {
          "x-vps-upload-secret": process.env.NEXTAUTH_SECRET || "",
        },
      });

      if (!response.ok) {
        console.warn(`[VPS Upload Proxy] VPS server returned status ${response.status} on delete`);
      } else {
        console.log(`[VPS Upload Proxy] Successfully proxy deleted from remote VPS: ${url}`);
        return;
      }
    } catch (proxyError: any) {
      console.error("[VPS Upload Proxy] Failed to proxy delete from VPS:", proxyError.message);
      // Fall through to local file system delete
    }
  }

  try {
    const relativePath = url.substring(baseUploadUrl.length);
    const baseUploadDir = getUploadDir();
    
    // Safety check to prevent directory traversal
    const normalizedRelativePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\))+/, "");
    const filePath = path.join(baseUploadDir, ...normalizedRelativePath.split(/[/\\]/));

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[VPS Upload] Successfully deleted file: ${filePath}`);
    } else {
      console.warn(`[VPS Upload] File to delete not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`[VPS Upload] Failed to delete file from uploads (${url}):`, error);
  }
}
