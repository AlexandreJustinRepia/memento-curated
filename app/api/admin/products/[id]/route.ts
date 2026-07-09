import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/products/[id] — update a product
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name        !== undefined) updates.name        = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.category    !== undefined) updates.category    = body.category;
  if (body.price       !== undefined) updates.price       = Number(body.price);
  if (body.stock       !== undefined) updates.stock       = Number(body.stock);
  if (body.image_url   !== undefined) updates.image_url   = body.image_url;

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE /api/admin/products/[id] — delete a product
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
