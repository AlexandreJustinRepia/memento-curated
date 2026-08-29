import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// GET /api/admin/orders — list all orders with product details and ratings
export async function GET() {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  const ordersList = orders ?? [];

  if (ordersList.length === 0) {
    return NextResponse.json([]);
  }

  const orderIds = ordersList.map((o: { id: number }) => o.id);

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const items = orderItems ?? [];
  const productIds = [...new Set(items.map((i: { product_id: number }) => i.product_id))];

  let ratingsMap: Record<number, { avg_rating: number | null; rating_count: number }> = {};
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

  const { data: products } = await supabase
    .from("products")
    .select("id, name, stock")
    .in("id", productIds);

  const productNameMap: Record<number, string> = {};
  const productStockMap: Record<number, number> = {};
  if (products) {
    for (const p of products) {
      productNameMap[p.id] = p.name;
      productStockMap[p.id] = Number(p.stock);
    }
  }

  const salesMap: Record<number, number> = {};
  for (const item of items) {
    salesMap[item.product_id] = (salesMap[item.product_id] || 0) + item.quantity;
  }

  const enriched = ordersList.map((order: {
    id: number;
    user_id: string;
    user_name: string;
    user_email: string;
    status: string;
    total: number;
    created_at: string;
    [key: string]: unknown;
  }) => {
    const orderItemsList = items.filter((i: { order_id: number }) => i.order_id === order.id);
    const enrichedItems = orderItemsList.map((item: {
      id: number;
      order_id: number;
      product_id: number;
      quantity: number;
      price: number;
      created_at: string;
      [key: string]: unknown;
    }) => ({
      ...item,
      product_name: productNameMap[item.product_id] ?? "Unknown Product",
      avg_rating: ratingsMap[item.product_id]?.avg_rating ?? null,
      rating_count: ratingsMap[item.product_id]?.rating_count ?? 0,
      total_sales: salesMap[item.product_id] ?? 0,
      current_stock: productStockMap[item.product_id] ?? 0,
    }));

    return {
      ...order,
      items: enrichedItems,
    };
  });

  return NextResponse.json(enriched);
}

// POST /api/admin/orders — create an order
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.user_email || !body?.items || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "user_email and items are required" }, { status: 400 });
  }

  const productIds = [...new Set(body.items.map((item: { product_id: number }) => item.product_id))];

  if (productIds.length > 0) {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, stock")
      .in("id", productIds);

    if (productsError || !products) {
      return NextResponse.json({ error: "Failed to verify product stock" }, { status: 500 });
    }

    const stockMap = new Map(products.map((p) => [p.id, { name: p.name, stock: Number(p.stock) }]));

    const outOfStock: string[] = [];
    for (const item of body.items) {
      const product = stockMap.get(item.product_id);
      if (!product) {
        return NextResponse.json({ error: `Product #${item.product_id} not found` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        outOfStock.push(`${product.name} (available: ${product.stock}, requested: ${item.quantity})`);
      }
    }

    if (outOfStock.length > 0) {
      return NextResponse.json({
        error: "Insufficient stock",
        details: outOfStock,
      }, { status: 400 });
    }
  }

  const total = body.items.reduce((sum: number, item: { price: number; quantity: number }) => {
    return sum + Number(item.price) * Number(item.quantity);
  }, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: body.user_id ?? "guest",
      user_name: body.user_name ?? "Guest",
      user_email: body.user_email,
      status: body.status ?? "pending",
      total,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Failed to create order" }, { status: 500 });
  }

  const orderItems = body.items.map((item: {
    product_id: number;
    quantity: number;
    price: number;
  }) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  if (body.status === "completed") {
    for (const item of body.items) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product_id)
        .single();

      if (product) {
        const newStock = Math.max(0, Number(product.stock) - item.quantity);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.product_id);
      }
    }
  }

  return NextResponse.json(order, { status: 201 });
}
