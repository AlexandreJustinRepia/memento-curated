import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET /api/admin/ratings
export async function GET() {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE /api/admin/ratings/:id
export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.pathname.split("/").pop());
  if (!id) {
    return NextResponse.json({ error: "rating id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
