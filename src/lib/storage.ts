import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== "https://your-project-ref.supabase.co" &&
  supabaseServiceKey &&
  supabaseServiceKey !== "your-supabase-service-role-key";

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Uploads a document to cloud storage (Supabase) if credentials exist.
 * Otherwise, falls back to saving files locally in `public/uploads` for local dev.
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueName = `${Date.now()}-${sanitizedName}`;

  if (supabase) {
    try {
      const bucketName = "clearance-documents";
      
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(uniqueName, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uniqueName);

      return urlData.publicUrl;
    } catch (err: any) {
      console.warn("Supabase storage upload failed, falling back to local:", err.message);
    }
  }

  // Fallback to local file system
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, uniqueName);
  fs.writeFileSync(filePath, fileBuffer);

  return `/uploads/${uniqueName}`;
}
