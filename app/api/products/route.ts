import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Public read — publishable key is fine; products table has anon SELECT policy
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, price, stock, image_url")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
