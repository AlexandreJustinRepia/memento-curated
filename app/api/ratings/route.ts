import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET /api/ratings?product_id=1
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("product_id");
  if (!productId) {
    return NextResponse.json({ error: "product_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("product_id", Number(productId))
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// POST /api/ratings
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (
    !body?.product_id ||
    !body?.user_id ||
    !body?.user_name ||
    !body?.rating ||
    !body?.quality ||
    !body?.appearance ||
    !body?.value_for_money ||
    !body?.matches_description
  ) {
    return NextResponse.json(
      { error: "product_id, user_id, user_name, rating, quality, appearance, value_for_money, and matches_description are required" },
      { status: 400 }
    );
  }

  const rating = Number(body.rating);
  const quality = Number(body.quality);
  const appearance = Number(body.appearance);
  const valueForMoney = Number(body.value_for_money);
  const matchesDescription = Number(body.matches_description);

  if ([rating, quality, appearance, valueForMoney, matchesDescription].some((n) => n < 1 || n > 5)) {
    return NextResponse.json({ error: "All ratings must be between 1 and 5" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ratings")
    .insert({
      product_id:         Number(body.product_id),
      user_id:            body.user_id,
      user_name:          body.user_name,
      rating,
      quality,
      appearance,
      value_for_money:    valueForMoney,
      matches_description: matchesDescription,
      comment:            body.comment ?? null,
      photos:             Array.isArray(body.photos) ? body.photos : [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
