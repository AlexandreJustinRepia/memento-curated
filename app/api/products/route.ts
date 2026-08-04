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

  const products = data ?? [];

  const productIds = products.map((p) => p.id);

  const ratingsMap: Record<number, { avg_rating: number | null; rating_count: number }> = {};

  if (productIds.length > 0) {
    const { data: ratingsData, error: ratingsError } = await supabase
      .from("ratings")
      .select("product_id, rating")
      .in("product_id", productIds);

    if (!ratingsError && ratingsData) {
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

  const enriched = products.map((p) => ({
    ...p,
    avg_rating: ratingsMap[p.id]?.avg_rating ?? null,
    rating_count: ratingsMap[p.id]?.rating_count ?? 0,
  }));

  return NextResponse.json(enriched);
}
