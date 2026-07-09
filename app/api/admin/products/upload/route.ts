import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

// Service-role key — can write to storage regardless of RLS
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (pre-optimization)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Sharp optimization settings
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const WEBP_QUALITY = 82;

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type: ${file.type}` },
      { status: 415 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 413 });
  }

  // Read the raw buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Optimize with Sharp: resize (if needed) and convert to WebP
  let optimizedBuffer: Buffer;
  try {
    optimizedBuffer = await sharp(buffer)
      .rotate() // auto-rotate based on EXIF orientation
      .resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: "inside", // preserve aspect ratio, no cropping
        withoutEnlargement: true, // don't upscale small images
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch (err) {
    console.error("[upload] Sharp processing error:", err);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }

  // Generate a unique file name (always .webp since we converted)
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, optimizedBuffer, {
      contentType: "image/webp",
      upsert: false,
    });

  if (uploadError) {
    console.error("[upload] Storage error:", uploadError.message);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return NextResponse.json({ url: data.publicUrl });
}