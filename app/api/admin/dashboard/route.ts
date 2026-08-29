import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET() {
  const LOW_STOCK_THRESHOLD = 5;

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("status, total");

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const ordersList = orders ?? [];
  const totalOrders = ordersList.length;
  const completedOrders = ordersList.filter((o) => o.status === "completed");
  const pendingOrders = ordersList.filter((o) => o.status === "pending");
  const cancelledOrders = ordersList.filter((o) => o.status === "cancelled");
  const totalSales = completedOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, stock, price")
    .lte("stock", LOW_STOCK_THRESHOLD)
    .order("stock", { ascending: true });

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  const lowStockProducts = (products ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    stock: Number(p.stock),
    price: Number(p.price),
  }));

  return NextResponse.json({
    totalOrders,
    totalSales,
    completedCount: completedOrders.length,
    pendingCount: pendingOrders.length,
    cancelledCount: cancelledOrders.length,
    lowStockProducts,
  });
}
