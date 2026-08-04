import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET /api/admin/products — list all products
export async function GET() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = data ?? [];
  const productIds = products.map((p: { id: number }) => p.id);

  const ratingsMap: Record<number, { avg_rating: number | null; rating_count: number }> = {};
  if (productIds.length > 0) {
    const { data: ratingsData } = await supabase
      .from("ratings")
      .select("product_id, rating")
      .in("product_id", productIds);

    if (ratingsData) {
      const grouped: Record<number, { sum: number; count: number }> = {};
      for (const r of ratingsData) {
        if (!grouped[r.product_id]) {
          grouped[r.product_id] = { sum: 0, count: 0 };
        }
        grouped[r.product_id].sum += r.rating;
        grouped[r.product_id].count += 1;
      }
      for (const [pid, stats] of Object.entries(grouped)) {
        ratingsMap[Number(pid)] = {
          avg_rating: Number((stats.sum / stats.count).toFixed(1)),
          rating_count: stats.count,
        };
      }
    }
  }

  const enriched = products.map((p: { id: number; [key: string]: unknown }) => ({
    ...p,
    avg_rating: ratingsMap[p.id]?.avg_rating ?? null,
    rating_count: ratingsMap[p.id]?.rating_count ?? 0,
  }));

  return NextResponse.json(enriched);
}

// POST /api/admin/products — create a product
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name:        body.name,
      description: body.description ?? null,
      category:    body.category   ?? "Uncategorized",
      price:       Number(body.price)  || 0,
      stock:       Number(body.stock)  || 0,
      image_url:   body.image_url  ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
