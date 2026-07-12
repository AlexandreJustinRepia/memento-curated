import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Admin client — can create users without email confirmation
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  // ── Rate limit: 10 sign-up attempts per hour per IP ───────────────────
  const ip = getClientIp(req);
  const rl = rateLimit(ip, { id: "signup", limit: 10, windowMs: 60 * 60 * 1000 });

  if (!rl.success) {
    const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many sign-up attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
        },
      }
    );
  }

  const body = await req.json().catch(() => null);
  const { name, email, password } = body ?? {};

  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  // Create auth user (email_confirm: true skips the verification email)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Profile is auto-created by the on_auth_user_created trigger
  return NextResponse.json({ id: data.user.id, email: data.user.email }, { status: 201 });
}
