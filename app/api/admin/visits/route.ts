import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side only — secret key never reaches the browser
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!   // service_role equivalent → bypasses RLS
);

export async function GET() {
  const { data, error } = await supabase.rpc("count_visits");

  if (error) {
    console.error("[visits] Supabase RPC error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
