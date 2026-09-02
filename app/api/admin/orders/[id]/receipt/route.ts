import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

type Params = { params: Promise<{ id: string }> };

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// GET /api/admin/orders/[id]/receipt — generate receipt HTML
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const orderId = Number(id);

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

  const receiptNo = `RCPT-${order.custom_order_id || order.id}-${Date.now().toString(36).toUpperCase()}`;
  const issuedAt = new Date().toLocaleString("en-PH", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const itemsHtml = items
    .map((item) => {
      const productName = productNameMap[item.product_id] ?? "Unknown Product";
      const lineTotal = Number(item.price) * item.quantity;
      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">${productName}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151; font-size: 14px;">${item.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-size: 14px;">₱${Number(item.price).toFixed(2)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-size: 14px; font-weight: 600;">₱${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Receipt #${receiptNo}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 40px; background: #f3f4f6; color: #111827; }
        .page { max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        .brand { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .brand h1 { margin: 0; font-size: 22px; color: #b45309; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; }
        .meta { background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #e5e7eb; }
        .meta p { margin: 4px 0; font-size: 14px; color: #374151; }
        .meta strong { color: #111827; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { text-align: left; padding: 10px 12px; background: #f9fafb; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
        td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; }
        .total-row td { border-bottom: none; font-weight: 700; color: #111827; font-size: 16px; }
        .note { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 12px; margin-bottom: 24px; }
        .note p { margin: 0; font-size: 14px; color: #1e40af; }
        .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px; }
        @media print {
          body { background: #fff; padding: 0; }
          .page { box-shadow: none; border-radius: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="brand">
          <div>
            <h1>Memento Curated</h1>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Official Receipt</p>
          </div>
          <div style="text-align: right;">
            <span class="badge">PAID</span>
            <p style="margin: 6px 0 0; font-size: 12px; color: #6b7280;">${issuedAt}</p>
          </div>
        </div>

        <div class="meta">
          <p><strong>Receipt No:</strong> ${receiptNo}</p>
          <p><strong>Order Ref:</strong> #${order.custom_order_id || order.id}</p>
          <p><strong>Customer:</strong> ${order.user_name}</p>
          <p><strong>Email:</strong> ${order.user_email}</p>
          <p><strong>Order Date:</strong> ${formatDate(order.created_at)}</p>
          <p><strong>Payment:</strong> Cash on Delivery (COD)</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr class="total-row">
              <td colspan="3" style="text-align: right; padding: 12px;">Total</td>
              <td style="text-align: right; padding: 12px;">₱${Number(order.total).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="note">
          <p><strong>Note:</strong> This receipt serves as your official proof of purchase. Please keep it for your records. For concerns, contact our support team.</p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Memento Curated. All rights reserved.</p>
          <button class="no-print" onclick="window.print()" style="margin-top: 12px; padding: 8px 16px; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; font-size: 14px;">Print Receipt</button>
        </div>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `inline; filename="receipt-${receiptNo}.html"`,
    },
  });
}
