import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const BUCKET = "product-images";

export async function GET() {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list("", {
      limit: 200,
      sortBy: { column: "name", order: "desc" },
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter out placeholder/folder entries and map to public URLs
  const files = (data ?? [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder" && f.id)
    .map((f) => ({
      name: f.name,
      url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
      size: f.metadata?.size ?? 0,
      created_at: f.created_at,
    }));

  return NextResponse.json(files);
}
