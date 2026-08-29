import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/orders/[id] — update order status
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const newStatus = body?.status;

  if (!newStatus || !["pending", "completed", "cancelled"].includes(newStatus)) {
    return NextResponse.json({ error: "Valid status is required (pending, completed, cancelled)" }, { status: 400 });
  }

  const orderId = Number(id);

  const { data: existingOrder, error: fetchError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (fetchError || !existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const oldStatus = existingOrder.status;

  if (oldStatus === newStatus) {
    return NextResponse.json({ error: "Order is already in this status" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (newStatus === "completed" && oldStatus !== "completed") {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (orderItems) {
      for (const item of orderItems) {
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
  }

  if (newStatus === "cancelled" && oldStatus === "completed") {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    if (orderItems) {
      for (const item of orderItems) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();

        if (product) {
          const newStock = Number(product.stock) + item.quantity;
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.product_id);
        }
      }
    }
  }

  return NextResponse.json({ success: true, status: newStatus });
}

// POST /api/admin/orders/[id]/send-email — send order confirmation email
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const orderId = Number(id);
  const body = await req.json().catch(() => ({}));
  const customMessage = body?.message?.trim();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  const items = orderItems ?? [];
  const productIds = [...new Set(items.map((i: { product_id: number }) => i.product_id))];

  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);

  const productNameMap: Record<number, string> = {};
  if (products) {
    for (const p of products) {
      productNameMap[p.id] = p.name;
    }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const itemsHtml = items.map((item) => {
    const productName = productNameMap[item.product_id] ?? "Unknown Product";
    const lineTotal = Number(item.price) * item.quantity;
    return `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #333;">${productName}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #333; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #333; text-align: right;">₱${Number(item.price).toFixed(2)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #333; text-align: right;">₱${lineTotal.toFixed(2)}</td>
      </tr>
    `;
  }).join("");

  const customMessageBlock = customMessage
    ? `<div style="background-color: #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #facc15;">
        <p style="color: #facc15; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Personal note from the team</p>
        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${customMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
       </div>`
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #fff; background-color: #18181b;">
      <h1 style="color: #facc15; font-size: 24px; margin-bottom: 8px;">Memento Curated</h1>
      <p style="color: #a1a1aa; margin-bottom: 24px;">Order Confirmation</p>

      <div style="background-color: #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="color: #d4d4d8; margin-bottom: 4px;"><strong>Order #:</strong> #${order.id}</p>
        <p style="color: #d4d4d8; margin-bottom: 4px;"><strong>Customer:</strong> ${order.user_name}</p>
        <p style="color: #d4d4d8; margin-bottom: 4px;"><strong>Email:</strong> ${order.user_email}</p>
        <p style="color: #d4d4d8; margin-bottom: 4px;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleString("en-PH")}</p>
        <p style="color: #d4d4d8;"><strong>Status:</strong> <span style="color: #4ade80; text-transform: capitalize;">${order.status}</span></p>
      </div>

      ${customMessageBlock}

      <h2 style="color: #facc15; font-size: 18px; margin-bottom: 12px;">Order Items</h2>
      <table style="width: 100%; border-collapse: collapse; background-color: #27272a; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #3f3f46;">
            <th style="padding: 10px 12px; text-align: left; color: #facc15; font-size: 12px; text-transform: uppercase;">Product</th>
            <th style="padding: 10px 12px; text-align: center; color: #facc15; font-size: 12px; text-transform: uppercase;">Qty</th>
            <th style="padding: 10px 12px; text-align: right; color: #facc15; font-size: 12px; text-transform: uppercase;">Price</th>
            <th style="padding: 10px 12px; text-align: right; color: #facc15; font-size: 12px; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #3f3f46;">
            <td colspan="3" style="padding: 12px; text-align: right; color: #facc15; font-weight: bold;">Total</td>
            <td style="padding: 12px; text-align: right; color: #facc15; font-weight: bold;">₱${Number(order.total).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
        Thank you for your order! We'll notify you when your items are shipped.
      </p>

      <p style="color: #71717a; font-size: 12px; margin-top: 32px;">
        © ${new Date().getFullYear()} Memento Curated. All rights reserved.
      </p>
    </div>
  `;

  const customMessageText = customMessage ? `\nPersonal note from the team:\n${customMessage}\n` : "";

  const text = `
Memento Curated - Order Confirmation

Order #: #${order.id}
Customer: ${order.user_name}
Email: ${order.user_email}
Date: ${new Date(order.created_at).toLocaleString("en-PH")}
Status: ${order.status}
${customMessageText}
Order Items:
${items.map((item) => {
  const productName = productNameMap[item.product_id] ?? "Unknown Product";
  const lineTotal = Number(item.price) * item.quantity;
  return `- ${productName} x${item.quantity} = ₱${lineTotal.toFixed(2)}`;
}).join("\n")}

Total: ₱${Number(order.total).toFixed(2)}

Thank you for your order!
  `.trim();

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Memento Curated" <${process.env.SMTP_USER}>`,
      to: order.user_email,
      subject: `Order Confirmation #${order.id} — Memento Curated`,
      text,
      html,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
