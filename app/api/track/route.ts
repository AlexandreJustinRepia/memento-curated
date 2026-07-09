import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Server-side only — secret key never sent to browser
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Sanitize inputs
    const page =
      typeof body.page === "string" ? body.page.slice(0, 255) : "/";
    const referrer =
      typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;

    // Hash the IP for privacy — raw IP is never stored
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    const userAgent =
      req.headers.get("user-agent")?.slice(0, 500) ?? null;

    await supabase.rpc("track_visit", {
      p_page: page,
      p_referrer: referrer,
      p_user_agent: userAgent,
      p_ip_hash: ipHash,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Never let tracking errors surface to the user
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
