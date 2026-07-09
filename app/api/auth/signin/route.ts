import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Regular (publishable) client for user-facing sign in
const authClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Admin client to read profile role
const adminClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { email, password } = body ?? {};

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // Fetch the user's profile to get their role
  const { data: profile } = await adminClient
    .from("profiles")
    .select("name, role, status")
    .eq("id", data.user.id)
    .single();

  if (profile?.status === "inactive") {
    return NextResponse.json({ error: "Your account has been deactivated." }, { status: 403 });
  }

  // Set a lightweight session cookie (httpOnly)
  const sessionPayload = JSON.stringify({
    id:    data.user.id,
    email: data.user.email,
    name:  profile?.name ?? "",
    role:  profile?.role ?? "customer",
  });

  const response = NextResponse.json({
    role: profile?.role ?? "customer",
    name: profile?.name ?? "",
  });

  response.cookies.set("mc_session", sessionPayload, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
